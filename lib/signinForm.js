AT.prototype.signinFormHelpers = {
    buttonText: function() {
        var label = {
            sgin: 'signIn',
            sgup: 'signUp',
            fpwd: 'emailResetLink',
            cpwd: 'updateYourPassword',
        };
        return T9n.get(label[AccountsTemplates.getState()]);
    },
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
        return '';
    },
    displayField: function() {
        return _.contains(this.visible, AccountsTemplates.getState());
    },
    fields: function() {
        return AccountsTemplates.getFields();
    },
    forgotPwdLink: function(){
        var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
        return forgotPwdRoutePath || '#';
    },
    loginServices: function() {
        return Accounts.oauth && Accounts.oauth.serviceNames().sort();
    },
    otherLoginServices: function() {
        return Accounts.oauth && Accounts.oauth.serviceNames().length > 0;
    },
    overallError: function() {
        var errorText = AccountsTemplates.getFieldError('overall');
        if (errorText)
            return T9n.get('error.accounts.' + errorText);
    },
    result: function() {
        var resultText = AccountsTemplates.getFieldError('result');
        if (resultText)
            return T9n.get(resultText);
    },
    showAddRemoveServices: function() {
        return AccountsTemplates.getConfig('showAddRemoveServices');
    },
    showForgotPassword: function() {
        return AccountsTemplates.getConfig('showForgotPasswordLink') && AccountsTemplates.getState() !== 'fpwd';
    },
    showSignUpLink: function(){
        return !AccountsTemplates.getConfig('forbidClientAccountCreation');
    },
    signedInAs: function() {
        var user = Meteor.user();
        if (user) {
            if (user.username) {
                return user.username;
            } else if (user.profile && user.profile.name) {
                return user.profile.name;
            } else if (user.emails && user.emails[0]) {
                return user.emails[0].address;
            } else {
                return "Signed In";
            }
        }
    },
    signInLink: function(){
        var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
        return signInRoutePath || '#';
    },
    signUpLink: function(){
        var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
        return signUpRoutePath || '#';
    },
    stateIs: function(state) {
        return AccountsTemplates.getState() === state;
    },
    submitDisabled: function(){
        var errors = _.map(AccountsTemplates.getFieldsNames(), function(name){
            return AccountsTemplates.getFieldError(name);
        });
        if (_.some(errors))
            return 'disabled';
    },
    passwordLoginService: function() {
        return !!Package['accounts-password'];
    },
};

AT.prototype.signinFormEvents = {
    'click #at-fpwd': function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (AccountsTemplates.isDisabled())
            return;
        var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
        if (forgotPwdRoutePath)
            Router.go(forgotPwdRoutePath);
        else
            AccountsTemplates.setState('fpwd');
    },
    'click #at-sgin': function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (AccountsTemplates.isDisabled())
            return;
        var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
        if (signInRoutePath)
            Router.go(signInRoutePath);
        else
            AccountsTemplates.setState('sgin');
    },
    'click #at-sgup': function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (AccountsTemplates.isDisabled())
            return;
        var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
        if (signUpRoutePath)
            Router.go(signUpRoutePath);
        else
            AccountsTemplates.setState('sgup');
    },
    'submit #at-form-login': function(event, t) {
        event.preventDefault();
        event.stopPropagation();
        $("#at-btn").blur();

        var username;
        var email;
        var password;
        var password_again;

        // Sign Up
        if (AccountsTemplates.getState() === 'sgup') {
            if (Meteor.userId()) {
                throw new Meteor.Error(403, "Already signed in!", {});
            }
            AccountsTemplates.setDisabled(true);
            var signupInfo = {};
            var fields = AccountsTemplates.getFieldsNames();
            var visibleFields = [];
            _.map(fields, function(fieldName){
                var fieldInput = t.find('#AT_field_' + fieldName);
                if (fieldInput){
                    visibleFields.push(fieldName);
                    var value = fieldInput.value;
                    if (!!value)
                        signupInfo[fieldName] = value;
                }
            });
            // Client-side pre-validation
            // Validates fields values
            // NOTE: This is the only place where password validation can be enforced!
            var someError = false;
            _.each(visibleFields, function(fieldName){
                var value = signupInfo[fieldName] || '';
                var validationErr = AccountsTemplates.fullFieldValidation(fieldName, value);
                if (validationErr) {
                    AccountsTemplates.setFieldError(fieldName, validationErr);
                    someError = true;
                }
            });
            if (someError){
                AccountsTemplates.setDisabled(false);
                return;
            }
            // Extracts username, email, and pwd
            email = signupInfo.email;
            password = signupInfo.password;
            password_again = signupInfo.password_again;
            username = signupInfo.username;
            // Clears profile data removing username, email, and pwd
            delete signupInfo.email;
            delete signupInfo.password;
            delete signupInfo.password_again;
            delete signupInfo.username;

            if (AccountsTemplates.getConfig('confirmPassword')){
                // Checks password matching
                if (password !== password_again){
                    AccountsTemplates.setFieldError('password', T9n.get('error.pwdsDontMatch'));
                    AccountsTemplates.setFieldError('password_again', T9n.get('error.pwdsDontMatch'));
                    AccountsTemplates.setDisabled(false);
                    return;
                }
            }


            var hashPassword = function (password) {
              return {
                digest: SHA256(password),
                algorithm: "sha-256"
              };
            };
            var signupData = {
                password: hashPassword(password),
                profile: signupInfo
            };
            // Possibly add username and/or email
            if (username)
                signupData['username'] = username;
            if (email)
                signupData['email'] = email;

            Meteor.call('ATCreateUserServer', signupData, function(error){
                if (error) {
                    AccountsTemplates.setDisabled(false);
                    // If error.details is an object, we may try to set fields errors from it
                    if(typeof(error.details) === 'object'){
                        var fieldErrors = error.details;
                        for (var fieldName in fieldErrors)
                            AccountsTemplates.setFieldError(fieldName, fieldErrors[fieldName]);
                    }
                    else
                        AccountsTemplates.setFieldError('overall', error.reason || "Unknown error");
                } else {
                    // FIXME: deal with verification email
                    AccountsTemplates.setFieldError('overall', false);
                    var login;
                    if (username)
                        login = username;
                    else
                        login = email;
                    Meteor.loginWithPassword(login, password, function(error) {
                        AccountsTemplates.setDisabled(false);
                        if (error) {
                            AccountsTemplates.setFieldError('overall', error.reason);
                        } else {
                            AccountsTemplates.setFieldError('overall', false);
                            if (AccountsTemplates.avoidRedirect)
                                AccountsTemplates.avoidRedirect = false;
                            else{
                                var nextPath = AccountsTemplates.getConfig('postSignUpRoutePath');
                                if (nextPath)
                                    Router.go(nextPath);
                                else{
                                    var previousPath = AccountsTemplates.getPrevPath();
                                    if (previousPath)
                                        Router.go(previousPath);
                                    else{
                                        var homeRoutePath = AccountsTemplates.getConfig('homeRoutePath');
                                        if (homeRoutePath)
                                            Router.go(homeRoutePath);
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }
        // Sign In
        if (AccountsTemplates.getState() === 'sgin') {
            switch (AccountsTemplates.loginType()){
                case 'username_and_email':
                    login = t.find('#AT_field_username_and_email').value;
                    break;
                case 'username':
                    login = t.find('#AT_field_username').value;
                    break;
                case 'email':
                    login = t.find('#AT_field_email').value;
                    break;
            }
            password = t.find('#AT_field_password').value;
            return Meteor.loginWithPassword(login, password, function(error) {
                AccountsTemplates.setDisabled(false);
                if (error) {
                    AccountsTemplates.setFieldError('overall', error.reason);
                } else {
                    AccountsTemplates.setFieldError('overall', false);
                    if (AccountsTemplates.avoidRedirect)
                        AccountsTemplates.avoidRedirect = false;
                    else{
                        var nextPath = AccountsTemplates.getConfig('postSignInRoutePath');
                        if (nextPath)
                            Router.go(nextPath);
                        else{
                            var previousPath = AccountsTemplates.getPrevPath();
                            if (previousPath)
                                Router.go(previousPath);
                            else{
                                var homeRoutePath = AccountsTemplates.getConfig('homeRoutePath');
                                if (homeRoutePath)
                                    Router.go(homeRoutePath);
                            }
                        }
                    }
                }
            });
        }
        // Forgot Password
        if (AccountsTemplates.getState() === 'fpwd') {
            // Sending an empty email value to Accounts.forgotPassword makes it
            // throw an error without calling the callback...
            // ...so, for now adding "|| ' '" fixes issue #26
            email = t.find('#AT_field_email').value || ' ';

            var validationErr = AccountsTemplates.fullFieldValidation('email', email);
            if (validationErr) {
                AccountsTemplates.setFieldError('login', validationErr);
                return;
            }
            AccountsTemplates.setDisabled(true);

            return Accounts.forgotPassword({email: email}, function(error) {
                if (error) {
                    AccountsTemplates.setFieldError('overall', error.reason);
                    AccountsTemplates.setFieldError('result', false);
                } else {
                    AccountsTemplates.setFieldError('overall', false);
                    AccountsTemplates.setFieldError('result', 'emailSent');
                    t.find('#AT_field_email').value = '';
                }
                AccountsTemplates.setDisabled(false);
            });
        }
    },
    'click #at-btn-logout': function(event) {
        event.preventDefault();
        event.stopPropagation();
        AccountsTemplates.clearFieldErrors();
        Meteor.logout();
    }
};