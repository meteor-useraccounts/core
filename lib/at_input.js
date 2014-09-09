AT.prototype.atInputHelpers = {
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
    },
    showLabels: function() {
        return AccountsTemplates.getConfig('showLabels');
    },
    displayName: function() {
            var displayName = this.displayName;
            if (_.isObject(displayName)){
                var parentData = UI._parentData(1);
                var state = (parentData && parentData.state) || AccountsTemplates.getState();
                displayName = displayName[state] || displayName.default;
            }
            if (!displayName)
                displayName = this._id;
        return T9n.get(displayName, markIfMissing=false);
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
            var placeholder = this.placeholder;
            if (_.isObject(placeholder)){
                var parentData = UI._parentData(1);
                var state = (parentData && parentData.state) || AccountsTemplates.getState();
                placeholder = placeholder[state] || placeholder.default;
            }
            if (!placeholder)
                placeholder = this._id;
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    'focusout input': function(event){
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        
        // Possibly applies required transformations to the input value
        var newValue = value;
        if (this.trim)
            newValue = newValue.trim();
        if (this.lowercase)
            newValue = newValue.toLowerCase();
        if (this.uppercase)
            newValue = newValue.toUpperCase();
        // Possibly updates the input value
        if (newValue !== value){
            value = newValue;
            currTarg.value = value;
        }

        // Client-side only validation
        if (!this.validation)
            return;
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
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