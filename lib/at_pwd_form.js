AT.prototype.atPwdFormHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    fields: function() {
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return _.filter(AccountsTemplates.getFields(), function(s) {
            return _.contains(s.visible, state);
        });
    },
    showForgotPasswordLink: function() {
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return state === "signIn" && AccountsTemplates.options.showForgotPasswordLink;
    },
};

AT.prototype.atPwdFormEvents = {
    // Form submit
    "submit #at-pwd-form": function(event, t) {
        event.preventDefault();
        $("#at-btn").blur();

        // Clears error and result
        AccountsTemplates.clearState();
        AccountsTemplates.setDisabled(true);

        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
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
            var inputField = t.$("#at-field-" + fieldId);
            var value = field.fixValue(inputField.val() || "");
            // Possibly updates the input value
            if (value !== inputField.val())
                inputField.val(value);

            if (value)
                formData[fieldId] = value;

            // Validates the field value only if current state is not "signIn"
            if (preValidation){
                var validationErr = AccountsTemplates.validateField(fieldId, value, "strict");
                if (validationErr) {
                    if (field.negativeValidation)
                        AccountsTemplates.state.fields.set(fieldId, validationErr);
                    else{
                        var fId = T9n.get(field.getDisplayName(), markIfMissing=false);
                        //errList.push(fId + ": " + err);
                        errList.push({
                            field: field.getDisplayName(),
                            err: validationErr
                        });
                    }
                    someError = true;
                }
            }
        });
        if (someError){
            if (errList.length)
                AccountsTemplates.state.form.set("error", errList);
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
                var pwd_again = AccountsTemplates.getField("password_again");
                if (pwd_again.negativeValidation){
                    //AccountsTemplates.state.fields.set("password", T9n.get("error.pwdsDontMatch"));
                    AccountsTemplates.state.fields.set("password_again", T9n.get("error.pwdsDontMatch"));
                }
                else
                    AccountsTemplates.state.form.set("error", [{
                        field: pwd_again.getDisplayName(),
                        err: "error.pwdsDontMatch"
                    }]);
                AccountsTemplates.setDisabled(false);
                return;
            }
            // Checks new passwords for correct match
            if (new_password_again && new_password !== new_password_again){
                var new_pwd_again = AccountsTemplates.getField("new_password_again");
                if (new_pwd_again.negativeValidation){
                    //AccountsTemplates.state.fields.set("new_password", T9n.get("error.pwdsDontMatch"));
                    AccountsTemplates.state.fields.set("new_password_again", T9n.get("error.pwdsDontMatch"));
                }
                else
                    AccountsTemplates.state.form.set("error", [{
                        field: new_pwd_again.getDisplayName(),
                        err: "error.pwdsDontMatch"
                    }]);
                AccountsTemplates.setDisabled(false);
                return;
            }
        }

        // -------
        // Sign In
        // -------
        if (state === "signIn") {
            var pwdOk = !!password;
            var userOk = true;
            var loginSelector;
            if (email)
                loginSelector = {email: email};
            else if (username)
                loginSelector = {username: username};
            else if (username_and_email)
                loginSelector = username_and_email;
            else
                userOk = false;

            // Possibly exits is not both 'password' and 'username' are not empty...
            if (!pwdOk || !userOk){
                AccountsTemplates.setDisabled(false);
                return;
            }

            return Meteor.loginWithPassword(loginSelector, password, function(error) {
                AccountsTemplates.setDisabled(false);
                AccountsTemplates.submitCallback(error, state);
            });
        }

        // -------
        // Sign Up
        // -------
        if (state === "signUp") {
            var hash = AccountsTemplates.hashPassword(password);
            return Meteor.call("ATCreateUserServer", {
                username: username,
                email: email,
                password: hash,
                profile: formData,
            }, function(error){
                AccountsTemplates.submitCallback(error, undefined, function(){
                    if (AccountsTemplates.options.sendVerificationEmail && AccountsTemplates.options.enforceEmailVerification){
                        AccountsTemplates.state.form.set("result", "Registration Successful! Please check your email and follow the instructions.");
                        // Cleans up input fields' content
                        _.each(AccountsTemplates.getFields(), function(field){
                            // Considers only visible fields...
                            if (!_.contains(field.visible, state))
                                return;
                            var fieldId = field._id;
                            t.$("#at-field-" + fieldId).val("");
                        });

                        AccountsTemplates.setDisabled(false);
                        return;
                    }
                    var loginSelector;
                    if (email)
                        loginSelector = {email: email};
                    else if (username)
                        loginSelector = {username: username};
                    else
                        loginSelector = username_and_email;
                    Meteor.loginWithPassword(loginSelector, password, function(error) {
                        AccountsTemplates.submitCallback(error, state, function(){
                            AccountsTemplates.setState("signIn");
                        });
                    });
                });
            });
        }

        //----------------
        // Forgot Password
        //----------------
        if (state === "forgotPwd"){
            return Accounts.forgotPassword({
                email: email
            }, function(error) {
                AccountsTemplates.submitCallback(error, state, function(){
                    AccountsTemplates.state.form.set("result", "info.emailSent");
                    t.$("#at-field-email").val("");
                });
            });
        }

        //--------------------------------
        // Reset Password / Enroll Account
        //--------------------------------
        if (state === "resetPwd" || state === "enrollAccount") {
            var pwd = new_password ? new_password : password;
            return Accounts.resetPassword(AccountsTemplates.paramToken, pwd, function(error) {
                AccountsTemplates.submitCallback(error, state, function(){
                    AccountsTemplates.state.form.set("result", "info.passwordReset");
                    var pwd_field_id = (state === "resetPwd") ? "new_password" : "password";
                    t.$("#at-field-" + pwd_field_id).val("");
                    if (AccountsTemplates.options.confirmPassword)
                        t.$("#at-field-" + pwd_field_id + "_again").val("");
                });
            });
        }

        //----------------
        // Change Password
        //----------------
        if (state === "changePwd"){
            return Accounts.changePassword(current_password, new_password, function(error) {
                AccountsTemplates.submitCallback(error, state, function(){
                    AccountsTemplates.state.form.set("result", "info.passwordChanged");
                    t.$("#at-field-current_password").val("");
                    t.$("#at-field-new_password").val("");
                    if (AccountsTemplates.options.confirmPassword)
                        t.$("#at-field-new_password_again").val("");
                });
            });
        }
    },
};
