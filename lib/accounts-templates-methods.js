Meteor.methods({
    ATRemoveService: function(service_name){
        var userId = this.userId;
        if (userId){
            var user = Meteor.users.findOne(userId);
            var numServices = _.keys(user.services).length; // including 'resume'
            if (numServices === 2)
                throw new Meteor.Error(403, "Cannot remove the only service!", {});
            var unset = {};
            unset['services.' + service_name] = "";
            Meteor.users.update(userId, {$unset: unset});
        }
    },
    ATValidateField: function(fieldName, value) {
        check(fieldName, String);
        check(value, String);
        return AccountsTemplates.fullFieldValidation(fieldName, value);
    },
    ATSignup: function(signupInfo) {
        if (Meteor.userId()) {
            throw new Meteor.Error(403, "Already signed in!", {});
        }
        check(signupInfo, Object);
        // Picks-up whitelisted fields
        signupInfo = _.pick(signupInfo, AccountsTemplates.getFieldsNames());
        // Validates fields' value
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
        // Validation passed, lets try to create the new user
        // Extracts login and pwd
        var login = signupInfo.login;
        var password = signupInfo.password;
        // Clears profile data removing login and pwd
        delete signupInfo.login;
        delete signupInfo.password;
        // Determines whether login is an email or username
        var loginField = AccountsTemplates.getField('login');
        var signupData = {
            password: password,
            profile: signupInfo
        };
        if (loginField.type === 'email')
            signupData['email'] = login;
        else
            signupData['username'] = login;
        return Accounts.createUser(signupData);
    },
});

if (Meteor.isServer) {
    Meteor.methods({
        ATEmailConfigured: function() {
            this.unblock();
            return !!process.env.MAIL_URL && !! Package['email'];
        },
    });
}