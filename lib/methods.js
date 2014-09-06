
Meteor.methods({
    ATRemoveService: function(service_name){
        var userId = this.userId;
        if (userId){
            var user = Meteor.users.findOne(userId);
            var numServices = _.keys(user.services).length; // including 'resume'
            if (numServices === 2)
                throw new Meteor.Error(403, "Cannot remove the only active service!", {});
            var unset = {};
            unset['services.' + service_name] = "";
            Meteor.users.update(userId, {$unset: unset});
        }
    }
});


if (Meteor.isServer) {
    Meteor.methods({
        ATCreateUserServer: function(options){
            if (AccountsTemplates.getConfig('forbidClientAccountCreation'))
                throw new Meteor.Error(403, "Client side accounts creation is disabled!!!");
            // createUser() does more checking.
            check(options, Object);
            var allFieldIds = AccountsTemplates.getFieldIds();
            // Picks-up whitelisted fields for profile
            var profile = options.profile;
            profile = _.pick(profile, allFieldIds);
            profile = _.omit(profile, 'username', 'email', 'password');
            // Validates fields' value
            var signupInfo = _.clone(profile);
            if (options.username)
                signupInfo.username = options.username;
            if (options.email)
                signupInfo.email = options.email;
            if (options.password)
                signupInfo.password = options.password;
            var validationErrors = {};
            var someError = false;

            // Validates fields values
            _.each(allFieldIds, function(fieldId){
                var value = signupInfo[fieldId];
                if (fieldId === 'password'){
                    // Can't Pick-up password here
                    // NOTE: at this stage the password is already encripted,
                    //       so there is no way to validate it!!!
                    check(value, Object);
                    return;
                }
                var validationErr = AccountsTemplates.validateField(fieldId, value, 'strict');
                if (validationErr) {
                    validationErrors[fieldId] = validationErr;
                    someError = true;
                }
            });
            if (someError)
                throw new Meteor.Error(403, "Validation Errors", validationErrors);

            // Possibly removes the profile field
            if (_.isEmpty(options.profile))
                delete options.profile

            // Create user. result contains id and token.
            var userId = Accounts.createUser(options);
            // safety belt. createUser is supposed to throw on error. send 500 error
            // instead of sending a verification email with empty userid.
            if (! userId)
                throw new Error("createUser failed to insert new user");

            // If `Accounts._options.sendVerificationEmail` is set, register
            // a token to verify the user's primary email, and send it to
            // that address.
            if (options.email && AccountsTemplates.getConfig('sendVerificationEmail'))
                Accounts.sendVerificationEmail(userId, options.email);

            // client gets logged in as the new user afterwards.
            // return {userId: userId};
        },
    });
}