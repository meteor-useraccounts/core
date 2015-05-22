AT.prototype.atInputRendered = function(){
    var fieldId = this.data._id;
    var queryKey = this.data.options && this.data.options.queryKey || this.data._id;
    var inputQueryVal = Router.current().params.query[queryKey];
    if (inputQueryVal)
        this.$("input#at-field-" + fieldId).val(inputQueryVal);

    var parentData = Template.currentData();
    var state = (parentData && parentData.state) || AccountsTemplates.getState();
    var firstVisibleInput = _.find(AccountsTemplates.getFields(), function(f){
      return _.contains(f.visible, state);
    });
    if (firstVisibleInput && firstVisibleInput._id === fieldId) {
      this.$("input#at-field-" + fieldId).focus();
    }
};

AT.prototype.atInputHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    showLabels: function() {
        return AccountsTemplates.options.showLabels;
    },
    displayName: function() {
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        var displayName = this.getDisplayName(state);
        return T9n.get(displayName, markIfMissing=false);
    },
    optionalText: function(){
        return "(" + T9n.get(AccountsTemplates.texts.optionalField, markIfMissing=false) + ")";
    },
    templateName: function() {
        if (this.template)
            return this.template;
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
            var parentData = Template.parentData();
            var state = (parentData && parentData.state) || AccountsTemplates.getState();
            var placeholder = this.getPlaceholder(state);
            return T9n.get(placeholder, markIfMissing=false);
        }
    },
};

AT.prototype.atInputEvents = {
    "focusin input": function(event, t){
        this.clearStatus();
    },
    "focusout input": function(event, t){
        var fieldId = this._id;
        var rawValue = this.getValue(t);
        var value = this.fixValue(rawValue);
        // Possibly updates the input value
        if (value !== rawValue) {
            this.setValue(t, value);
        }

        // Client-side only validation
        if (!this.validation)
            return;
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        // Special case for password confirmation
        if (value && fieldId === "password_again"){
            if (value !== t.$("#at-field-password").val())
                return this.setError(AccountsTemplates.texts.errors.pwdMismatch);
        }
        this.validate(value);
    },
    "keyup input": function(event, t){
        // Client-side only continuous validation
        if (!this.continuousValidation)
            return;
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        // No validation during signIn
        if (state === "signIn")
            return;
        var fieldId = this._id;
        var rawValue = this.getValue(t);
        var value = this.fixValue(rawValue);
        // Possibly updates the input value
        if (value !== rawValue) {
            this.setValue(t, value);
        }
        // Special case for password confirmation
        if (value && fieldId === "password_again"){
            if (value !== t.$("#at-field-password").val())
                return this.setError(AccountsTemplates.texts.errors.pwdMismatch);
        }
        this.validate(value);
    },
};
