
// ---------------------------------------------------------------------------------

// AccountsTemplates object

// ---------------------------------------------------------------------------------



// -------------------
// Client/Server stuff
// -------------------

// Constructor
AT = function() {
    if (Meteor.isClient) {
        this._deps.state = new Deps.Dependency();
        this._deps.disabled = new Deps.Dependency();
        this._deps.errors = {};
        this._deps.errors.overall = new Deps.Dependency();
        this._deps.errors.result = new Deps.Dependency();
        this.errors.overall = false;
        this.errors.result = false;
    }
};

// Configuration pattern to be checked with check
AT.prototype.CONFIG_PAT = {
    // Misc
    confirmPassword: Match.Optional(Boolean),
    continuousValidation: Match.Optional(Boolean),
    displayFormLabels: Match.Optional(Boolean),
    enablePasswordChange: Match.Optional(Boolean),
    forbidClientAccountCreation: Match.Optional(Boolean),
    formValidationFeedback: Match.Optional(Boolean),
    showAddRemoveServices: Match.Optional(Boolean),
    showForgotPasswordLink: Match.Optional(Boolean),
    showPlaceholders: Match.Optional(Boolean),

    // Redirects
    homeRoutePath: Match.Optional(String),
    postSignInRoutePath: Match.Optional(String),
    postSignUpRoutePath: Match.Optional(String),

    // Routes' name
    changePwdRouteName: Match.Optional(String),
    enrollAccountRouteName: Match.Optional(String),
    forgotPwdRouteName: Match.Optional(String),
    resetPwdRouteName: Match.Optional(String),
    signInRouteName: Match.Optional(String),
    signUpRouteName: Match.Optional(String),

    // Routes' path
    changePwdRoutePath: Match.Optional(String),
    enrollAccountRoutePath: Match.Optional(String),
    forgotPwdRoutePath: Match.Optional(String),
    resetPwdRoutePath: Match.Optional(String),
    signInRoutePath: Match.Optional(String),
    signUpRoutePath: Match.Optional(String),

    // Templates
    changePwdRouteTemplate: Match.Optional(String),
    enrollAccountRouteTemplate: Match.Optional(String),
    forgotPwdRouteTemplate: Match.Optional(String),
    resetPwdRouteTemplate: Match.Optional(String),
    signInRouteTemplate: Match.Optional(String),
    signUpRouteTemplate: Match.Optional(String),

    // Layout
    layoutTemplate: Match.Optional(String)
};


/*
    Each field object is represented by a document in the ATFieldsCollection collection:
        name:        String              // A unique field's name
        type:        String              // Displayed input type
        required:    Boolean (optional)  // Specifies Whether to fail or not when field is left empty
        displayName: String  (optional)  // The field's name to be displayed as a label above the input element
        placeholder: String  (optional)  // The placeholder text to be displayed inside the input element
        minLength:   Integer (optional)  // Possibly specifies the minimum allowed length
        maxLength:   Integer (optional)  // Possibly specifies the maximum allowed length
        re:          RegExp  (optional)  // Regular expression for validation
        errStr:      String  (optional)  // Error message to be displayed in case re validation fails
*/

// Field pattern to be checked with check
AT.prototype.FIELD_PAT = {
    name: String,
    type: String,
    required: Match.Optional(Boolean),
    displayName: Match.Optional(String),
    placeholder: Match.Optional(String),
    minLength: Match.Optional(Match.Integer),
    maxLength: Match.Optional(Match.Integer),
    re: Match.Optional(RegExp), // Regular expression for validation
    errStr: Match.Optional(String),
};

// Allowed input types
AT.prototype.INPUT_TYPES = [
    "password",
    "email",
    "text",
    "tel",
    "url",
];

// Current configuration values
AT.prototype._config = {
    confirmPassword: false,
    continuousValidation: true,
    displayFormLabels: true,
    enablePasswordChange: false,
    forbidClientAccountCreation: false,
    formValidationFeedback: true,
    homeRoute: '/',
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showPlaceholders: true,
};

// SignIn / SignUp fields
AT.prototype._fields = [{
    name: "email",
    type: "email",
    displayName: "Email",
    required: true,
}, {
    name: "password",
    type: "password",
    required: true,
    minLength: 6
}];

AT.prototype._initialized = false;

// The following 'special' fields are not considered SignUp fields
// ...their order is crucial for correct input elements display
AT.prototype._special_fields = [
    'email',
    'username',
    'username_email',
    'password',
    'password_again',
];


// Input type validation
AT.prototype._isValidInputType = function(value) {
    return _.indexOf(this.INPUT_TYPES, value) !== -1;
};

AT.prototype.addField = function(field) {
    // Fields can be added only before initialization
    if (this._initialized)
        throw new Error("AccountsTemplates.addField should strictly be called before AccountsTemplates.init!");
    check(field, this.FIELD_PAT);
    // Checks there"s currently no field called field.name
    if (_.indexOf(_.pluck(this._fields, 'name'), field.name) !== -1)
        throw new Error("A field called " + field.name + " already exists!");
    // Validates field.type
    if (!this._isValidInputType(field.type))
        throw new Error("field.type is not valid!");
    // Checks field.minLength is strictly positive
    if (typeof field.minLength !== "undefined" && field.minLength <= 0)
        throw new Error("field.minLength should be greater than zero!");
    // Checks field.maxLength is strictly positive
    if (typeof field.maxLength !== "undefined" && field.maxLength <= 0)
        throw new Error("field.maxLength should be greater than zero!");
    // Checks field.maxLength is greater than field.minLength
    if (typeof field.minLength !== "undefined" && typeof field.minLength !== "undefined" && field.maxLength < field.minLength)
        throw new Error("field.maxLength should be greater than field.maxLength!");
    this._fields.push(field);
    return this._fields;
};

AT.prototype.addFields = function(fields) {
    var ok;
    try { // don"t bother with `typeof` - just access `length` and `catch`
        ok = fields.length > 0 && "0" in Object(fields);
    } catch (e) {
        throw new Error("field argument should be an array of valid field objects!");
    }
    if (ok) {
        _.map(fields, function(field){
            this.addField(field);
        }, this);
    } else
        throw new Error("field argument should be an array of valid field objects!");
    return this._fields;
};

AT.prototype.configure = function(config) {
    // Configuration options can be set only before initialization
    if (this._initialized)
        throw new Error("Configuration options must be set before AccountsTemplates.init!");
    check(config, this.CONFIG_PAT);

    // Updates the current configuration
    this._config = _.defaults(config, this._config);
};

AT.prototype.getConfig = function(param_name) {
    return this._config[param_name];
};

AT.prototype.getField = function(fieldName) {
    var index = _.indexOf(_.pluck(this._fields, 'name'), fieldName);
    if (index !== -1)
        return this._fields[index];
};

AT.prototype.getFields = function() {
    return this._fields;
};

AT.prototype.getFieldsNames = function() {
    return _.pluck(this._fields, 'name');
};

AT.prototype.validateField = function(fieldName, value) {
    var field = this.getField(fieldName);
    if (!field || value === '')
        return;
    var valueLength = value.length;
    var minLength = field.minLength;
    if (minLength && valueLength < minLength)
        return 'Minimum Required Length:' + minLength;
    var maxLength = field.maxLength;
    if (maxLength && valueLength > maxLength)
        return 'Maximum Allowed Length:' + maxLength;
    if (field.re && valueLength && !value.match(field.re))
        return field.errStr;
};

AT.prototype.fullFieldValidation = function(fieldName, value) {
    check(fieldName, String);
    check(value, String);
    var field = this.getField(fieldName);
    if (!field || (!field.required && value === ''))
        return;
    var valueLength = value.length;
    if (field.required && !valueLength)
        return 'Required Field';
    var minLength = field.minLength;
    if (minLength && valueLength < minLength)
        return 'Minimum Required Length:' + minLength;
    var maxLength = field.maxLength;
    if (maxLength && valueLength > maxLength)
        return 'Maximum Allowed Length:' + maxLength;
    if (field.re && valueLength && !value.match(field.re))
        return field.errStr;
};

AT.prototype.removeField = function(fieldName) {
    // Fields can be removed only before initialization
    if (this._initialized)
        throw new Error("AccountsTemplates.removeField should strictly be called before AccountsTemplates.init!");
    // Tries to look up the field with given name
    var index = _.indexOf(_.pluck(this._fields, 'name'), fieldName);
    if (index !== -1)
        this._fields.splice(index, 1);
    else
        throw new Error("A field called " + fieldName + " does not exist!");
};
