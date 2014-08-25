AT.prototype.atInputHelpers = {
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
        return '';
    },
    showLabels: function() {
        return AccountsTemplates.getConfig('showLabels');
    },
    displayName: function() {
        return T9n.get(this.displayName || this.name, markIfMissing=false);
    },
    errorText: function() {
        return T9n.get(AccountsTemplates.getFieldError(this.name), markIfMissing=false);
    },
    hasError: function() {
        return this.negativeValidation && AccountsTemplates.getFieldError(this.name);
    },
    hasSuccess: function() {
        return this.positiveValidation && AccountsTemplates.getFieldError(this.name) === false;
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
        // Client-side only validation
        if (!this.validation)
            return
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        var fieldName = this.name;
        AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));
    },
    'keyup input': function(event){
        // Client-side only continuous validation
        if (!this.continuousValidation){
            AccountsTemplates.setFieldError(this.name, null);
            return
        }
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        var fieldName = this.name;
        AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));            
    }
};