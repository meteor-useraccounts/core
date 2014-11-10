// ---------------------------------------------------------------------------------

// Field object

// ---------------------------------------------------------------------------------


Field = function(field){
    check(field, FIELD_PAT);
    _.defaults(this, field);

    this.validating = new ReactiveVar(false);
    this.status = new ReactiveVar(null);
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

Field.prototype.getStatus = function(){
    return this.status.get();
}

Field.prototype.getValue = function(tempalteInstance){
    if (this.type === "checkbox")
        return !!(tempalteInstance.$("#at-field-" + this._id + ":checked").val());
    if (this.type === "radio")
        return tempalteInstance.$("[name=at-field-"+ this._id + "]:checked").val();
    return tempalteInstance.$("#at-field-" + this._id).val();
};

Field.prototype.hasError = function() {
        return this.negativeValidation && this.status.get();
};

Field.prototype.hasIcon = function(){
    if (this.negativeFeedback && this.hasError())
        return true;
    if (this.positiveFeedback && this.hasSuccess())
        return true;
    if (this.showValidating && this.isValidating())
        return true;
};

Field.prototype.hasSuccess = function() {
    return this.positiveValidation && this.status.get() === false;
};

Field.prototype.iconClass = function(){
    if (this.isValidating())
        return AccountsTemplates.texts.inputIcons["isValidating"];
    if (this.hasError())
        return AccountsTemplates.texts.inputIcons["hasError"];
    if (this.hasSuccess())
        return AccountsTemplates.texts.inputIcons["hasSuccess"];
}

Field.prototype.isValidating = function(){
    return this.validating.get();
};

Field.prototype.setStatus = function(value){
    check(value, Match.OneOf(Boolean, String, null, undefined));
    return this.status.set(value);
};

Field.prototype.setValidating = function(state){
    check(state, Boolean);
    return this.validating.set(state);
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

Field.prototype.validate = function(value, strict) {
    check(value, Match.OneOf(undefined, String, Boolean));
    this.setValidating(true);
    if (!value){
        if (!!strict){
            if (this.required) {
                this.setValidating(false);
                return "Required Field";
            }
            else {
                this.setValidating(false);
                return false;
            }
        }
        else {
            this.setValidating(false);
            return null;
        }
    }
    var valueLength = value.length;
    var minLength = this.minLength;
    if (minLength && valueLength < minLength) {
        this.setValidating(false);
        return "Minimum required length: " + minLength;
    }
    var maxLength = this.maxLength;
    if (maxLength && valueLength > maxLength) {
        this.setValidating(false);
        return "Maximum allowed length: " + maxLength;
    }
    if (this.re && valueLength && !value.match(this.re)) {
        this.setValidating(false);
        return this.errStr;
    }
    if (this.func && valueLength){
        var result = this.func(value);
        return result === true ? this.errStr || true : result;
    }
    this.setValidating(false);
    return false;
};