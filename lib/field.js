// ---------------------------------------------------------------------------------

// Field object

// ---------------------------------------------------------------------------------


Field = function(field){
    check(field, FIELD_PAT);
    _.defaults(this, field);
};

Field.prototype.getDisplayName = function(state){
    var dN = this.displayName;
    if (_.isObject(dN))
        dN = dN[state] || dN.default;
    if (!dN)
        dN = this._id;
    return dN;
};

Field.prototype.getPlaceholder = function(state){
    var placeholder = this.placeholder;
    if (_.isObject(placeholder))
        placeholder = placeholder[state] || placeholder.default;
    if (!placeholder)
        placeholder = this._id;
    return placeholder;
};

Field.prototype.getValue = function(tempalteInstance){
    if (this.type === "checkbox")
        return !!(tempalteInstance.$("#at-field-" + this._id + ":checked").val());
    if (this.type === "radio")
        return tempalteInstance.$("[name=at-field-"+ this._id + "]:checked").val();
    return tempalteInstance.$("#at-field-" + this._id).val();
};

Field.prototype.setValue = function(tempalteInstance, value){
    if (this.type === "checkbox") {
        tempalteInstance.$("#at-field-" + this._id).prop('checked', true);
        return;
    }
    if (this.type === "radio") {
        tempalteInstance.$("[name=at-field-"+ this._id + "]").prop('checked', true);
        return;
    }
    tempalteInstance.$("#at-field-" + this._id).val(value);
};

Field.prototype.hasError = function() {
        return this.negativeValidation && AccountsTemplates.state.fields.get(this._id);
};

Field.prototype.hasSuccess = function() {
    return this.positiveValidation && AccountsTemplates.state.fields.equals(this._id, false);
};

Field.prototype.fixValue = function(value){
    if (this.type === "checkbox")
        return !!value;
    if (this.type === "select")
        // TODO: something working...
        return value;
    if (this.type === "radio")
        // TODO: something working...
        return value;
    // Possibly applies required transformations to the input value
    if (this.trim)
        value = value.trim();
    if (this.lowercase)
        value = value.toLowerCase();
    if (this.uppercase)
        value = value.toUpperCase();
    return value;
};