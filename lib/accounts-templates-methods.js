var validateField = function(fieldName, value) {
    check(fieldName, String);
    check(value, String);

    var field = ATFieldsCollection.findOne({
        name: fieldName
    });
    if (!field) {
        throw new Meteor.Error(500, "Internal server error", "accounts-templates-core package got an invalid field name!");
    }
    if (!field.required && value === '')
        return '';
    var ok = true;
    if (field.required && !value.length)
        ok = false;
    if (field.minLength && value.length < field.minLength)
        ok = false;
    if (field.maxLength && value.length > field.maxLength)
        ok = false;
    if (field.re && value.length && !value.match(RegExp(field.re)))
        ok = false;
    if (ok)
        return '';
    return field.errStr;

};

Meteor.methods({
    ATValidateField: function(fieldName, value) {
        return validateField(fieldName, value);
    },
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
            var validationRes = validateField(fieldName, value);
            console.log('validation of field ' + fieldName + ': ' + validationRes);
            if (validationRes !== '') {
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
        if (loginField.type === 'email') {
            return Accounts.createUser({
                email: login,
                password: password,
                profile: signupInfo
            });
        }
        else{
            return Accounts.createUser({
                username: login,
                password: password,
                profile: signupInfo
            });
        }
    }
});