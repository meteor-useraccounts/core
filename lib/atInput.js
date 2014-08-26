AT.prototype.atInputHelpers = {
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
    },
    showLabels: function() {
        return AccountsTemplates.getConfig('showLabels');
    },
    displayName: function() {
        return T9n.get(this.displayName, markIfMissing=false);
    },
    errorText: function() {
        return T9n.get(AccountsTemplates.getFieldError(this._id), markIfMissing=false);
    },
    hasError: function() {
        return this.negativeValidation && AccountsTemplates.getFieldError(this._id);
    },
    hasSuccess: function() {
        return this.positiveValidation && AccountsTemplates.getFieldError(this._id) === false;
    },
    placeholder: function() {
        if (AccountsTemplates.getConfig('showPlaceholders')) {
            var placeholder = this.placeholder || this.displayName || this._id;
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    'focusout input': function(event){
        // Client-side only validation
        if (!this.validation)
            return;
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        var fieldId = this._id;
        AccountsTemplates.setFieldError(fieldId, AccountsTemplates.validateField(fieldId, value));
    },
    'keyup input': function(event){
        // Client-side only continuous validation
        if (!this.continuousValidation){
            AccountsTemplates.setFieldError(this._id, null);
            return;
        }
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        var fieldId = this._id;
        AccountsTemplates.setFieldError(fieldId, AccountsTemplates.validateField(fieldId, value));
    }
};