var otherLoginServices = function(){
    return Accounts.oauth && Accounts.oauth.serviceNames().length > 0;
};

AT.prototype.signinFormHelpers = {
    hide: function(){
        var state = AccountsTemplates.getState();
        return state === 'hide';
    },
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
        return '';
    },
    showTitle: function(){
        var state = AccountsTemplates.getState();
        if (Meteor.user() && state === 'sgin')
            return true;
        return !(state === 'sgin' && otherLoginServices());
    },
    title: function(){
        var state = AccountsTemplates.getState();
        var user = Meteor.user();
        if (user && state !== 'cpwd') {
            return signedInAs();
        }
        else{
            var title = {
                cpwd: 'changePassword',
                enro: 'createAccount',
                fpwd: 'resetYourPassword',
                rpwd: 'resetYourPassword',
                sgin: 'signIn',
                sgup: 'createAccount',
            };
            return T9n.get(title[state]);
        }
    },
    showSignInLink: function(){
        var state = AccountsTemplates.getState();
        return state === 'sgup';
    },
    signInLink: function(){
        var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
        return signInRoutePath || '#';
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
    showLoginServices: function(){
        var state = AccountsTemplates.getState();
        if (state !== 'sgin' || !otherLoginServices())
            return false;
        if (Meteor.user())
            return AccountsTemplates.getConfig('showAddRemoveServices');
        return true;
    },
    loginServices: function() {
        return Accounts.oauth && Accounts.oauth.serviceNames().sort();
    },
    showServicesSeparator: function(){
        var pwdService = !!Package['accounts-password'];
        var state = AccountsTemplates.getState();
        return pwdService && state === 'sgin' && !Meteor.user();
    },
    showPwdService: function() {
        if (Meteor.user())
            return AccountsTemplates.getState() === 'cpwd';
        return !!Package['accounts-password'] && !Meteor.user();
    },
    fields: function() {
        var state = AccountsTemplates.getState();
        return _.filter(AccountsTemplates.getFields(), function(s) {
            return _.contains(s.visible, state);
        });
    },
    showForgotPasswordLink: function() {
        var state = AccountsTemplates.getState();
        return state === 'sgin' && AccountsTemplates.getConfig('showForgotPasswordLink');
    },
    forgotPwdLink: function(){
        var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
        return forgotPwdRoutePath || '#';
    },
    submitDisabled: function(){
        var errors = _.map(AccountsTemplates.getFieldsNames(), function(name){
            return AccountsTemplates.getFieldError(name);
        });
        if (_.some(errors))
            return 'disabled';
    },
    buttonText: function() {
        var label = {
            cpwd: 'updateYourPassword',
            enro: 'createAccount',
            fpwd: 'emailResetLink',
            rpwd: 'setPassword',
            sgin: 'signIn',
            sgup: 'signUp',
        };
        return T9n.get(label[AccountsTemplates.getState()]);
    },
    showSignUpLink: function(){
        var state = AccountsTemplates.getState();
        return state === 'sgin' && !AccountsTemplates.getConfig('forbidClientAccountCreation');
    },
    signUpLink: function(){
        var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
        return signUpRoutePath || '#';
    },
    showSignOut: function(){
        var state = AccountsTemplates.getState();
        return !!Meteor.user() && state === 'sgin';
    }
};

AT.prototype.signinFormEvents = {
    // Click forgot password link
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
    // Click sign in link
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
    // Click sign up link
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
    // Form submit
    'submit #at-form-login': function(event, t) {
        event.preventDefault();
        event.stopPropagation();
        //event.currentTarget.blur();
        $("#at-btn").blur();

        // Clears error and result
        AccountsTemplates.setFieldError('overall', false);
        AccountsTemplates.setFieldError('result', false);

        var username;
        var email;
        var password;
        var password_again;
        var validationErr;

        // Sign Up
        if (AccountsTemplates.getState() === 'sgup') {
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
                validationErr = AccountsTemplates.fullFieldValidation(fieldName, value);
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

            validationErr = AccountsTemplates.fullFieldValidation('email', email);
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
                    AccountsTemplates.setFieldError('result', 'info.emailSent');
                    t.find('#AT_field_email').value = '';
                }
                AccountsTemplates.setDisabled(false);
            });
        }

        // Reset Password / Enroll Account
        if (AccountsTemplates.getState() === 'rpwd' || AccountsTemplates.getState() === 'enro') {
            var paramToken = AccountsTemplates.paramToken;
            var pwd_field_name;
            if (AccountsTemplates.getState() === 'rpwd')
                pwd_field_name = 'password';
            else
                pwd_field_name = 'new_password';
            password = t.find('#AT_field_' + pwd_field_name).value;
            check(paramToken, String);
            check(password, String);
            // NOTE: This is the only place where password validation can be enforced!
            validationErr = AccountsTemplates.fullFieldValidation(pwd_field_name, password);
            if (validationErr) {
                AccountsTemplates.setFieldError(pwd_field_name, validationErr);
                AccountsTemplates.setDisabled(false);
                return;
            }
            if (AccountsTemplates.getConfig('confirmPassword')){
                password_again = t.find('#AT_field_' + pwd_field_name + '_again').value;
                // Checks password matching
                if (password !== password_again){
                    AccountsTemplates.setFieldError(pwd_field_name, T9n.get('error.pwdsDontMatch'));
                    AccountsTemplates.setFieldError(pwd_field_name + '_again', T9n.get('error.pwdsDontMatch'));
                    AccountsTemplates.setDisabled(false);
                    return;
                }
            }
            return Accounts.resetPassword(paramToken, password, function(error) {
                if (error) {
                    AccountsTemplates.setFieldError('overall', error.reason);
                } else {
                    AccountsTemplates.setFieldError('overall', false);
                    //AccountsTemplates.setFieldError('result', 'info.passwordReset');
                    t.find('#AT_field_email').value = '';
                    var nextPath = AccountsTemplates.getConfig('postSignUpRoutePath') || AccountsTemplates.getConfig('homeRoutePath');
                    if (nextPath)
                        Router.go(nextPath);
                }
                AccountsTemplates.setDisabled(false);
            });
        }

        // Change Password
        if (AccountsTemplates.getState() === 'cpwd') {
            var oldPassword = t.find('#AT_field_current_password').value;
            password = t.find('#AT_field_new_password').value;
            check(oldPassword, String);
            check(password, String);
            // NOTE: This is the only place where password validation can be enforced!
            validationErr = AccountsTemplates.fullFieldValidation('new_password', password);
            if (validationErr) {
                AccountsTemplates.setFieldError('new_password', validationErr);
                AccountsTemplates.setDisabled(false);
                return;
            }
            if (AccountsTemplates.getConfig('confirmPassword')){
                password_again = t.find('#AT_field_new_password_again').value;
                // Checks password matching
                if (password !== password_again){
                    AccountsTemplates.setFieldError('new_password', T9n.get('error.pwdsDontMatch'));
                    AccountsTemplates.setFieldError('new_password_again', T9n.get('error.pwdsDontMatch'));
                    AccountsTemplates.setDisabled(false);
                    return;
                }
            }
            return Accounts.changePassword(oldPassword, password, function(error) {
                if (error) {
                    AccountsTemplates.setFieldError('overall', error.reason);
                } else {
                    AccountsTemplates.setFieldError('overall', false);
                    AccountsTemplates.setFieldError('result', 'info.passwordChanged');
                    t.find('#AT_field_current_password').value = '';
                    t.find('#AT_field_new_password').value = '';
                    t.find('#AT_field_new_password_again').value = '';
                }
                AccountsTemplates.setDisabled(false);
            });
        }
    },
    // Logout
    'click #at-btn-logout': function(event) {
        event.preventDefault();
        event.stopPropagation();
        AccountsTemplates.clearFieldErrors();
        Meteor.logout();
    }
};