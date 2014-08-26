
AT.prototype.atFormHelpers = {
    hide: function(){
        var state = this.state || AccountsTemplates.getState();
        return state === 'hide';
    },
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
        return '';
    },
    showTitle: function(){
        var state = this.state || AccountsTemplates.getState();
        if (Meteor.user() && state === 'signIn')
            return false;
        return !(state === 'signIn' && otherLoginServices());
    },
    title: function(){
        var state = this.state || AccountsTemplates.getState();
        var user = Meteor.user();
        var title = {
            changePwd: 'changePassword',
            enrollAccount: 'createAccount',
            forgotPwd: 'resetYourPassword',
            resetPwd: 'resetYourPassword',
            signIn: 'signIn',
            signUp: 'createAccount',
        };
        return T9n.get(title[state]);
    },
    showSignInLink: function(){
        var state = this.state || AccountsTemplates.getState();
        return state === 'signUp';
    },
    signInLink: function(){
        return AccountsTemplates.getRoutePath('signIn');
    },
    overallError: function() {
        return AccountsTemplates.getFieldError('overall');
    },
    result: function() {
        var resultText = AccountsTemplates.getFieldError('result');
        if (resultText)
            return T9n.get(resultText);
    },
    showLoginServices: function(){
        var state = this.state || AccountsTemplates.getState();
        if (state !== 'signIn' || !otherLoginServices())
            return false;
        if (Meteor.user())
            return AccountsTemplates.getConfig('showAddRemoveServices');
        return true;
    },
    loginServices: function() {
        return Accounts.oauth && Accounts.oauth.serviceNames().sort();
    },
    showServicesSeparator: function(){
        var pwdService = Package['accounts-password'] !== undefined;
        var state = this.state || AccountsTemplates.getState();
        var signIn = state === 'signIn';
        return signIn && !Meteor.user() && pwdService && otherLoginServices();
    },
    showPwdService: function() {
        if (Meteor.user()){
            var state = this.state || AccountsTemplates.getState();
            return state === 'changePwd';
        }
        return Package['accounts-password'] !== undefined && !Meteor.user();
    },
    state: function(){
        return this.state || AccountsTemplates.getState();
    },
    fields: function() {
        var state = this.state || AccountsTemplates.getState();
        return _.filter(AccountsTemplates.getFields(), function(s) {
            return _.contains(s.visible, state);
        });
    },
    showForgotPasswordLink: function() {
        var state = this.state || AccountsTemplates.getState();
        return state === 'signIn' && AccountsTemplates.getConfig('showForgotPasswordLink');
    },
    forgotPwdLink: function(){
        return AccountsTemplates.getRoutePath('forgotPwd');
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
            changePwd: 'updateYourPassword',
            enrollAccount: 'createAccount',
            forgotPwd: 'emailResetLink',
            resetPwd: 'setPassword',
            signIn: 'signIn',
            signUp: 'signUp',
        };
        var state = this.state || AccountsTemplates.getState();
        return T9n.get(label[state]);
    },
    showSignUpLink: function(){
        var state = this.state || AccountsTemplates.getState();
        return state === 'signIn' && !AccountsTemplates.getConfig('forbidClientAccountCreation');
    },
    signUpLink: function(){
        return AccountsTemplates.getRoutePath('signUp');
    },
    showTermsLink: function(){
        var state = this.state || AccountsTemplates.getState();
        return state === 'signUp' && (!!AccountsTemplates.getConfig('privacyUrl') || !!AccountsTemplates.getConfig('termsUrl'));
    },
    privacyUrl: function(){
        return AccountsTemplates.getConfig('privacyUrl');
    },
    showTermsAnd: function(){
        return !!AccountsTemplates.getConfig('privacyUrl') && !!AccountsTemplates.getConfig('termsUrl');
    },
    termsUrl: function(){
        return AccountsTemplates.getConfig('termsUrl');
    },
};

AT.prototype.atFormEvents = {
    // Click forgot password, sign in, or sign up link
    'click .at-link': function(event, t) {
        event.preventDefault();
        var route = event.currentTarget.id.substring(3);
        AccountsTemplates.linkClick(route);
    },
    // Form submit
    'submit #at-form': function(event, t) {
        event.preventDefault();
        $("#at-btn").blur();

        // Clears error and result
        AccountsTemplates.clearFieldErrors();

        var username;
        var email;
        var password;
        var password_again;
        var validationErr;

        var state = this.state || AccountsTemplates.getState();

        // Sign Up
        if (state === 'signUp') {
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
            var errList = [];
            _.each(visibleFields, function(fieldName){
                var value = signupInfo[fieldName] || '';
                validationErr = AccountsTemplates.validateField(fieldName, value, 'strict');
                if (validationErr) {
                    AccountsTemplates.setFieldError(fieldName, validationErr);
                    var fieldObj = AccountsTemplates.getField(fieldName);
                    if (!fieldObj.negativeValidation){
                        var fname = T9n.get(fieldObj.displayName, markIfMissing=false);
                        var err = T9n.get('error.accounts.' + validationErr, markIfMissing=false);
                        // Possibly removes initial prefix in case the key in not found inside t9n
                        if (err.substring(0, 15) === 'error.accounts.')
                            err = err.substring(15);
                        errList.push(fname + ': ' + err); 
                    }
                    someError = true;
                }
            });
            if (someError){
                if (errList.length)
                    AccountsTemplates.setFieldError('overall', errList);    
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
                    else{
                        var err = error.reason || "Unknown error";
                        err = T9n.get('error.accounts.' + err, markIfMissing=false);
                        // Possibly removes initial prefix in case the key in not found inside t9n
                        if (err.substring(0, 15) === 'error.accounts.')
                            err = err.substring(15);
                        AccountsTemplates.setFieldError('overall', [err]);
                    }
                } else {
                    // FIXME: deal with verification email
                    AccountsTemplates.setFieldError('overall', null);
                    var login;
                    if (username)
                        login = username;
                    else
                        login = email;
                    Meteor.loginWithPassword(login, password, function(error) {
                        AccountsTemplates.setDisabled(false);
                        if (error) {
                            var err = error.reason || "Unknown error";
                            err = T9n.get('error.accounts.' + err, markIfMissing=false);
                            // Possibly removes initial prefix in case the key in not found inside t9n
                            if (err.substring(0, 15) === 'error.accounts.')
                                err = err.substring(15);
                            AccountsTemplates.setFieldError('overall', [err]);
                            AccountsTemplates.setFieldError('result', null);
                        } else {
                            AccountsTemplates.setState('signIn');
                            AccountsTemplates.setFieldError('overall', null);
                            AccountsTemplates.postSubmitRedirect(state);
                        }
                    });
                }
            });
        }
        // Sign In
        if (state === 'signIn') {
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
                    var err = error.reason || "Unknown error";
                    err = T9n.get('error.accounts.' + err, markIfMissing=false);
                    // Possibly removes initial prefix in case the key in not found inside t9n
                    if (err.substring(0, 15) === 'error.accounts.')
                        err = err.substring(15);
                    AccountsTemplates.setFieldError('overall', [err]);
                    AccountsTemplates.setFieldError('result', null);
                } else {
                    AccountsTemplates.setFieldError('overall', null);
                    AccountsTemplates.postSubmitRedirect(state);
                }
            });
        }
        // Forgot Password
        if (state === 'forgotPwd') {
            // Sending an empty email value to Accounts.forgotPassword makes it
            // throw an error without calling the callback...
            // ...so, for now adding "|| ' '" fixes issue #26
            email = t.find('#AT_field_email').value || ' ';

            validationErr = AccountsTemplates.validateField('email', email, 'strict');
            if (validationErr) {
                AccountsTemplates.setFieldError('login', validationErr);
                return;
            }
            AccountsTemplates.setDisabled(true);

            return Accounts.forgotPassword({email: email}, function(error) {
                AccountsTemplates.setDisabled(false);
                if (error) {
                    var err = error.reason || "Unknown error";
                    err = T9n.get('error.accounts.' + err, markIfMissing=false);
                    // Possibly removes initial prefix in case the key in not found inside t9n
                    if (err.substring(0, 15) === 'error.accounts.')
                        err = err.substring(15);
                    AccountsTemplates.setFieldError('overall', [err]);
                    AccountsTemplates.setFieldError('result', null);
                } else {
                    AccountsTemplates.setFieldError('overall', null);
                    AccountsTemplates.setFieldError('result', 'info.emailSent');
                    t.find('#AT_field_email').value = '';
                    Meteor.setTimeout(function(){AccountsTemplates.postSubmitRedirect(state);}, 2000);
                }
            });
        }

        // Reset Password / Enroll Account
        if (state === 'resetPwd' || state === 'enrollAccount') {
            var paramToken = AccountsTemplates.paramToken;
            var pwd_field_name;
            if (state === 'resetPwd')
                pwd_field_name = 'new_password';
            else
                pwd_field_name = 'password';
            password = t.find('#AT_field_' + pwd_field_name).value;
            check(paramToken, String);
            check(password, String);
            // NOTE: This is the only place where password validation can be enforced!
            validationErr = AccountsTemplates.validateField(pwd_field_name, password, 'strict');
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
                AccountsTemplates.setDisabled(false);
                if (error) {
                    var err = error.reason || "Unknown error";
                    err = T9n.get('error.accounts.' + err, markIfMissing=false);
                    // Possibly removes initial prefix in case the key in not found inside t9n
                    if (err.substring(0, 15) === 'error.accounts.')
                        err = err.substring(15);
                    AccountsTemplates.setFieldError('overall', [err]);
                } else {
                    AccountsTemplates.setFieldError('overall', null);
                    AccountsTemplates.setFieldError('result', 'info.passwordReset');
                    t.find('#AT_field_' + pwd_field_name).value = '';
                    if (AccountsTemplates.getConfig('confirmPassword'))
                        t.find('#AT_field_' + pwd_field_name + '_again').value = '';
                    //Meteor.setTimeout(function(){AccountsTemplates.postSubmitRedirect(state)}, 1000);
                }
            });
        }

        // Change Password
        if (state === 'changePwd') {
            var oldPassword = t.find('#AT_field_current_password').value;
            password = t.find('#AT_field_new_password').value;
            check(oldPassword, String);
            check(password, String);
            // NOTE: This is the only place where password validation can be enforced!
            validationErr = AccountsTemplates.validateField('new_password', password, 'strict');
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
                AccountsTemplates.setDisabled(false);
                if (error) {
                    var err = error.reason || "Unknown error";
                    err = T9n.get('error.accounts.' + err, markIfMissing=false);
                    // Possibly removes initial prefix in case the key in not found inside t9n
                    if (err.substring(0, 15) === 'error.accounts.')
                        err = err.substring(15);
                    AccountsTemplates.setFieldError('overall', [err]);
                } else {
                    AccountsTemplates.setFieldError('overall', null);
                    AccountsTemplates.setFieldError('result', 'info.passwordChanged');
                    t.find('#AT_field_current_password').value = '';
                    t.find('#AT_field_new_password').value = '';
                    t.find('#AT_field_new_password_again').value = '';
                    //AccountsTemplates.postSubmitRedirect(state);
                }
            });
        }
    },
};
