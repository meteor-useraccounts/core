AT.prototype.atInputHelpers = {
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
        return '';
    },
    displayFormLabels: function() {
        return AccountsTemplates.getConfig('displayFormLabels');
    },
    displayName: function() {
        return T9n.get(this.displayName || this.name, markIfMissing=false);
    },
    errorText: function() {
        return T9n.get(AccountsTemplates.getFieldError(this.name), markIfMissing=false);
    },
    hasError: function() {
        return AccountsTemplates.getFieldError(this.name);
    },
    hasFeedback: function() {
        return AccountsTemplates.getConfig('formValidationFeedback');
    },
    hasSuccess: function() {
        return AccountsTemplates.getFieldError(this.name) === false;
    },
    placeholder: function() {
        if (AccountsTemplates.getConfig('showPlaceholders')) {
            var placeholder = this.placeholder || this.displayName || this.name;
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    'focusout input': function(event){
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        if (state === "signIn")
            return;
        // Client-side only validation
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        var fieldName = this.name;
        AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));
    },
    'keyup input': function(event){
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        if (state === "signIn")
            return;
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        var fieldName = this.name;
        if (AccountsTemplates.getConfig('continuousValidation'))
            // Client-side only validation
            AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));
        else
            AccountsTemplates.setFieldError(fieldName, null);
    }
};