AT.prototype.atInputHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    showLabels: function() {
        return AccountsTemplates.options.showLabels;
    },
    displayName: function() {
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        var displayName = this.getDisplayName();
        return T9n.get(displayName, markIfMissing=false);
    },
    optionalText: function(){
        return "(" + T9n.get("optional", markIfMissing=false) + ")";
    },
    errorText: function() {
        var err = AccountsTemplates.state.fields.get(this._id);
        return T9n.get(err, markIfMissing=false);
    },
    placeholder: function() {
        if (AccountsTemplates.options.showPlaceholders) {
            var parentData = UI._parentData(1);
            var state = (parentData && parentData.state) || AccountsTemplates.getState();
            var placeholder = this.getPlaceholder();
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    "focusout input": function(event){
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
        // Possibly updates input"s value
        if (value !== currTarg.value)
            currTarg.value = value;
        var fieldId = this._id;
        // Special case for password confirmation
        if (value && fieldId.substr(fieldId.length - 6) == "_again"){
            var pwd_input_id = "#at-field-" + fieldId.substr(0, fieldId.length - 6);
            if (value !== $(pwd_input_id).val()){
                AccountsTemplates.state.fields.set(fieldId, "error.pwdsDontMatch");
                return;
            }
        }
        AccountsTemplates.state.fields.set(fieldId, AccountsTemplates.validateField(fieldId, value));
    },
    "keyup input": function(event){
        // Client-side only continuous validation
        if (!this.continuousValidation)
            return;
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        var currTarg = event.currentTarget;
        var value = this.fixValue(currTarg.value);
        var fieldId = this._id;
        // Special case for password confirmation
        if (value && fieldId.substr(fieldId.length - 6) == "_again"){
            var pwd_input_id = "#at-field-" + fieldId.substr(0, fieldId.length - 6);
            if (value !== $(pwd_input_id).val()){
                AccountsTemplates.state.fields.set(fieldId, "error.pwdsDontMatch");
                return;
            }
        }
        AccountsTemplates.state.fields.set(fieldId, AccountsTemplates.validateField(fieldId, value));
    },
};