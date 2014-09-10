AT.prototype.atInputHelpers = {
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
    },
    showLabels: function() {
        return AccountsTemplates.getConfig('showLabels');
    },
    displayName: function() {
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        var displayName = this.getDisplayName();
        return T9n.get(displayName, markIfMissing=false);
    },
    errorText: function() {
        return T9n.get(AccountsTemplates.getFieldError(this._id), markIfMissing=false);
    },
    placeholder: function() {
        if (AccountsTemplates.getConfig('showPlaceholders')) {
            var parentData = UI._parentData(1);
            var state = (parentData && parentData.state) || AccountsTemplates.getState();
            var placeholder = this.getPlaceholder();
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    'focusout input': function(event, t){
        // Client-side only validation
        if (!this.validation)
            return;
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;

        var currTarg = event.currentTarget;
        var value = this.fixValue(currTarg.value);
        // Possibly updates input's value
        if (value !== currTarg.value)
            currTarg.value = value;
        var fieldId = this._id;
        // Special case for password confirmation
        if (value && fieldId.substr(fieldId.length - 6) == '_again'){
            var pwd_input_id = '#AT_field_' + fieldId.substr(0, fieldId.length - 6);
            if (value !== $(pwd_input_id).val()){
                AccountsTemplates.setFieldError(fieldId, 'error.pwdsDontMatch');
                return;
            }
        }
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
        var value = this.fixValue(currTarg.value);
        var fieldId = this._id;
        // Special case for password confirmation
        if (value && fieldId.substr(fieldId.length - 6) == '_again'){
            var pwd_input_id = '#AT_field_' + fieldId.substr(0, fieldId.length - 6);
            if (value !== $(pwd_input_id).val()){
                AccountsTemplates.setFieldError(fieldId, 'error.pwdsDontMatch');
                return;
            }
        }
        AccountsTemplates.setFieldError(fieldId, AccountsTemplates.validateField(fieldId, value));
    }
};