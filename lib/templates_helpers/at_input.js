AT.prototype.atInputRendered = function(){
    var fieldId = this.data._id;
    var inputQueryVal = Router.current().params.query[fieldId];
    if (inputQueryVal)
        this.$("input#at-field-" + fieldId).val(inputQueryVal);
};

AT.prototype.atInputHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    showLabels: function() {
        return AccountsTemplates.options.showLabels;
    },
    displayName: function() {
        var parentData = Template.parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        var displayName = this.getDisplayName(state);
        return T9n.get(displayName, markIfMissing=false);
    },
    optionalText: function(){
        return "(" + T9n.get(AccountsTemplates.texts.optionalField, markIfMissing=false) + ")";
    },
    templateName: function() {
        if (this.type === "checkbox")
            return "atCheckboxInput";
        if (this.type === "select")
            return "atSelectInput";
        if (this.type === "radio")
            return "atRadioInput";
        if (this.type === "hidden")
            return "atHiddenInput";
        return "atTextInput";
    },
    values: function(){
        var id = this._id;
        return _.map(this.select, function(select){
            var s = _.clone(select);
            s._id = id + "-" + select.value;
            s.id = id;
            return s;
        });
    },
    errorText: function() {
        var err = this.getStatus();
        return T9n.get(err, markIfMissing=false);
    },
    placeholder: function() {
        if (AccountsTemplates.options.showPlaceholders) {
            var parentData = Template.parentData(1);
            var state = (parentData && parentData.state) || AccountsTemplates.getState();
            var placeholder = this.getPlaceholder(state);
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    "focusout input": function(event, t){
        // Client-side only validation
        if (!this.validation)
            return;
        var parentData = Template.parentData(1);
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
        if (value && fieldId === "password_again"){
            if (value !== $("#at-field-password").val())
                return this.setStatus(AccountsTemplates.texts.errors.pwdMismatch);
        }
        this.setStatus(this.validate(value));
    },
    "keyup input": function(event){
        // Client-side only continuous validation
        if (!this.continuousValidation)
            return;
        var parentData = Template.parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        var currTarg = event.currentTarget;
        var value = this.fixValue(currTarg.value);
        var fieldId = this._id;
        // Special case for password confirmation
        if (value && fieldId === "password_again"){
            if (value !== $("#at-field-password").val())
                return this.setStatus(AccountsTemplates.texts.errors.pwdMismatch);
        }
        this.setStatus(this.validate(value));
    },
};
