
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
            // createUser() does more checking.
            check(options, Object);
            // Determines whether login is an email or username
            var loginField = AccountsTemplates.getField('login');
            var login;
            if (loginField.type === 'email')
                login = options.email;
            else
                login = options.username;
            // Can't Pick-up password here
            // NOTE: at this stage the password is already encripted,
            //       so there is no way to validate it!!!
            // Picks-up whitelisted fields for profile
            var profile = options.profile;
            profile = _.pick(profile, AccountsTemplates.getFieldsNames());
            profile = _.omit(profile, 'username', 'email', 'password');
            // Validates fields' value
            var signupInfo = _.extend({login: login}, profile);
            var validationErrors = {};
            var someError = false;
            // Validates fields values
            for (var fieldName in signupInfo) {
                var value = signupInfo[fieldName];
                check(value, String);
                var validationErr = AccountsTemplates.fullFieldValidation(fieldName, value);
                if (validationErr) {
                    validationErrors[fieldName] = validationErr;
                    someError = true;
                }
            }
            if (someError)
                throw new Meteor.Error(403, "Validation Errors", validationErrors);

            // Create user. result contains id and token.
            var userId = Accounts.createUser(options);
            // safety belt. createUser is supposed to throw on error. send 500 error
            // instead of sending a verification email with empty userid.
            if (! userId)
                throw new Error("createUser failed to insert new user");

            // If `Accounts._options.sendVerificationEmail` is set, register
            // a token to verify the user's primary email, and send it to
            // that address.
            if (options.email && Accounts._options.sendVerificationEmail)
                Accounts.sendVerificationEmail(userId, options.email);

            // client gets logged in as the new user afterwards.
            // return {userId: userId};
        },
        ATEmailConfigured: function() {
            return !!process.env.MAIL_URL && !! Package['email'];
        },
    });
}