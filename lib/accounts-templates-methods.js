Meteor.methods({
    ATSignup: function(signupInfo) {
        if (Meteor.userId()) {
            throw new Meteor.Error(403, "Already signed in!", {});
        }
        console.log('Signing up...');
        console.dir(signupInfo);

        var validationErrors = {};
        var someError = false;
        // Validates fields values
        for (var fieldName in signupInfo) {
            var value = signupInfo[fieldName];
            var validationRes = AccountsTemplates.validateField(fieldName, value);
            if (validationRes) {
                validationErrors[fieldName] = validationRes;
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
        var loginField = ATFieldsCollection.findOne({
            name: 'login'
        });
        var signupData = {
            password: password,
            profile: signupInfo
        };
        if (loginField.type === 'email')
            signupData['email'] = login;
        else
            signupData['username'] = login;
        return Accounts.createUser(signupData);
    }
});