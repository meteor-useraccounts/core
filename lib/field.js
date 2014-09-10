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

Field.prototype.hasError = function() {
        return this.negativeValidation && AccountsTemplates.getFieldError(this._id);
};

Field.prototype.hasSuccess = function() {
    return this.positiveValidation && AccountsTemplates.getFieldError(this._id) === false;
};

Field.prototype.fixValue = function(value){
    // Possibly applies required transformations to the input value
    if (this.trim)
        value = value.trim();
    if (this.lowercase)
        value = value.toLowerCase();
    if (this.uppercase)
        value = value.toUpperCase();
    return value;
};