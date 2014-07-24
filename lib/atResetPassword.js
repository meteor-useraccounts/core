AT.prototype.atResetPasswordHelpers = {
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
        return '';
    },
    overallError: function() {
        if (AccountsTemplates.ready()) {
            var errorText = AccountsTemplates.getFieldError('overall');
            if (errorText)
                return T9n.get('error.accounts.' + errorText);
        }
    },
    pwdField: function() {
        return AccountsTemplates.getField('password');
    },
    stateIs: function(state) {
        return AccountsTemplates.getState() === state;
    }
};

AT.prototype.atResetPasswordEvents = {
    'submit #at-form-pwd': function(event, t) {
        event.preventDefault();
        event.stopPropagation();
        $("#at-btn").blur();
        AccountsTemplates.setDisabled(true);
        var paramToken = AccountsTemplates.paramToken;
        var password = t.find('#AT_field_password').value;
        check(paramToken, String);
        check(password, String);
        // NOTE: This is the only place where password validation can be enforced!
        var validationErr = AccountsTemplates.fullFieldValidation('password', password);
        if (validationErr) {
            AccountsTemplates.setFieldError('password', validationErr);
            AccountsTemplates.setDisabled(false);
            return;
        }
        return Accounts.resetPassword(paramToken, password, function(error) {
            if (error) {
                AccountsTemplates.setFieldError('overall', error.reason);
            } else {
                AccountsTemplates.setFieldError('overall', false);
                var nextPath = AccountsTemplates.getConfig('postSignUpRoutePath') || AccountsTemplates.getConfig('homeRoutePath');
                if (nextPath)
                    Router.go(nextPath);
            }
            AccountsTemplates.setDisabled(false);
        });
    },
};
