AT.prototype.atPwdFormHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    fields: function() {
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return _.filter(AccountsTemplates.getFields(), function(s) {
            return _.contains(s.visible, state);
        });
    },
    showForgotPasswordLink: function() {
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return state === 'signIn' && AccountsTemplates.options.showForgotPasswordLink;
    },
};

AT.prototype.atPwdFormEvents = {
    // Form submit
    'submit #at-pwd-form': function(event, t) {
        event.preventDefault();
        $("#at-btn").blur();

        // Clears error and result
        AccountsTemplates.clearState();
        AccountsTemplates.setDisabled(true);

        var state = this.state || AccountsTemplates.getState();
        var preValidation = (state !== "signIn");

        // Client-side pre-validation
        // Validates fields values
        // NOTE: This is the only place where password validation can be enforced!
        var formData = {};
        var someError = false;
        var errList = [];
        _.each(AccountsTemplates.getFields(), function(field){
            // Considers only visible fields...
            if (!_.contains(field.visible, state))
                return;

            var fieldId = field._id;
            var inputField = $(t).find('#AT_field_' + fieldId);
            var value = field.fixValue(inputField.val() || '');
            // Possibly updates the input value
            if (value !== inputField.val())
                inputField.val(value);

            if (value)
                formData[fieldId] = value;

            // Validates the field value only if current state is not "signIn"
            if (preValidation){
                var validationErr = AccountsTemplates.validateField(fieldId, value, 'strict');
                if (validationErr) {
                    AccountsTemplates.state.fields.set(fieldId, validationErr);
                    if (!field.negativeValidation){
                        var fId = T9n.get(field.getDisplayName(), markIfMissing=false);
                        var err = T9n.get('error.accounts.' + validationErr, markIfMissing=false);
                        // Possibly removes initial prefix in case the key in not found inside t9n
                        if (err.substring(0, 15) === 'error.accounts.')
                            err = err.substring(15);
                        errList.push(fId + ': ' + err);
                    }
                    someError = true;
                }
            }
        });
        if (someError){
            if (errList.length)
                AccountsTemplates.state.form.set('error', errList);
            AccountsTemplates.setDisabled(false);
            return;
        }

        // Extracts username, email, and pwds
        var current_password = formData.current_password;
        var email = formData.email;
        var new_password = formData.new_password;
        var new_password_again = formData.new_password_again;
        var password = formData.password;
        var password_again = formData.password_again;
        var username = formData.username;
        var username_and_email = formData.username_and_email;
        // Clears profile data removing username, email, and pwd
        delete formData.current_password;
        delete formData.email;
        delete formData.new_password;
        delete formData.new_password_again;
        delete formData.password;
        delete formData.password_again;
        delete formData.username;
        delete formData.username_and_email;

        if (AccountsTemplates.options.confirmPassword){
            // Checks passwords for correct match
            if (password_again && password !== password_again){
                AccountsTemplates.state.fields.set('password', T9n.get('error.pwdsDontMatch'));
                AccountsTemplates.state.fields.set('password_again', T9n.get('error.pwdsDontMatch'));
                AccountsTemplates.setDisabled(false);
                return;
            }
            // Checks new passwords for correct match
            if (new_password_again && new_password !== new_password_again){
                AccountsTemplates.state.fields.set('new_password', T9n.get('error.pwdsDontMatch'));
                AccountsTemplates.state.fields.set('new_password_again', T9n.get('error.pwdsDontMatch'));
                AccountsTemplates.setDisabled(false);
                return;
            }
        }

        // -------
        // Sign In
        // -------
        if (state === 'signIn') {
            var loginSelector;
            if (email)
                loginSelector = {email: email};
            else if (username)
                loginSelector = {username: username};
            else
                loginSelector = username_and_email;

            return Meteor.loginWithPassword(loginSelector, password, function(error) {
                AccountsTemplates.setDisabled(false);
                AccountsTemplates.submitCallback(error, state);
            });
        }

        // -------
        // Sign Up
        // -------
        if (state === 'signUp') {
            var hash = AccountsTemplates.hashPassword(password);
            return Meteor.call('ATCreateUserServer', {
                username: username,
                email: email,
                password: hash,
                profile: formData,
            }, function(error){
                AccountsTemplates.submitCallback(error, undefined, function(){
                    var loginSelector;
                    if (email)
                        loginSelector = {email: email};
                    else if (username)
                        loginSelector = {username: username};
                    else
                        loginSelector = username_and_email;
                    Meteor.loginWithPassword(loginSelector, password, function(error) {
                        AccountsTemplates.submitCallback(error, state, function(){
                            AccountsTemplates.setState('signIn');
                        });
                    });
                });
            });
        }

        //----------------
        // Forgot Password
        //----------------
        if (state === 'forgotPwd'){
            return Accounts.forgotPassword({
                email: email
            }, function(error) {
                AccountsTemplates.submitCallback(error, state, function(){
                    AccountsTemplates.state.form.set('result', 'info.emailSent');
                    t.$('#AT_field_email').val('');
                });
            });
        }

        //--------------------------------
        // Reset Password / Enroll Account
        //--------------------------------
        if (state === 'resetPwd' || state === 'enrollAccount') {
            var pwd = new_password ? new_password : password;
            return Accounts.resetPassword(AccountsTemplates.paramToken, pwd, function(error) {
                AccountsTemplates.submitCallback(error, state, function(){
                    AccountsTemplates.state.form.set('result', 'info.passwordReset');
                    var pwd_field_id = (state === 'resetPwd') ? 'new_password' : 'password';
                    t.$('#AT_field_' + pwd_field_id).val('');
                    if (AccountsTemplates.options.confirmPassword)
                        t.$('#AT_field_' + pwd_field_id + '_again').val('');
                });
            });
        }

        //----------------
        // Change Password
        //----------------
        if (state === 'changePwd'){
            return Accounts.changePassword(current_password, new_password, function(error) {
                AccountsTemplates.submitCallback(error, state, function(){
                    AccountsTemplates.state.form.set('result', 'info.passwordChanged');
                    t.$('#AT_field_current_password').val('');
                    t.$('#AT_field_new_password').val('');
                    if (AccountsTemplates.options.confirmPassword)
                        t.$('#AT_field_new_password_again').val('');
                });
            });
        }
    },
};
