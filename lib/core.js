// ---------------------------------------------------------------------------------

// Patterns for methods" parameters

// ---------------------------------------------------------------------------------

var STATE_PAT = {
    changePwd: Match.Optional(String),
    enrollAccount: Match.Optional(String),
    forgotPwd: Match.Optional(String),
    resetPwd: Match.Optional(String),
    signIn: Match.Optional(String),
    signUp: Match.Optional(String),
};


// Configuration pattern to be checked with check
var CONFIG_PAT = {
    // Behaviour
    confirmPassword: Match.Optional(Boolean),
    enablePasswordChange: Match.Optional(Boolean),
    forbidClientAccountCreation: Match.Optional(Boolean),
    overrideLoginErrors: Match.Optional(Boolean),
    sendVerificationEmail: Match.Optional(Boolean),

    // Appearance
    showAddRemoveServices: Match.Optional(Boolean),
    showForgotPasswordLink: Match.Optional(Boolean),
    showLabels: Match.Optional(Boolean),
    showPlaceholders: Match.Optional(Boolean),

    // Client-side Validation
    continuousValidation: Match.Optional(Boolean),
    negativeFeedback: Match.Optional(Boolean),
    negativeValidation: Match.Optional(Boolean),
    positiveValidation: Match.Optional(Boolean),
    positiveFeedback: Match.Optional(Boolean),

    // Privacy Policy and Terms of Use
    privacyUrl: Match.Optional(String),
    termsUrl: Match.Optional(String),

    // Redirects
    homeRoutePath: Match.Optional(String),
    redirectTimeout: Match.Optional(Number),

    // Texts
    buttonText: Match.Optional(STATE_PAT),
    title: Match.Optional(STATE_PAT),
};


var FIELD_SUB_PAT = {
    default: Match.Optional(String),
    changePwd: Match.Optional(String),
    enrollAccount: Match.Optional(String),
    forgotPwd: Match.Optional(String),
    resetPwd: Match.Optional(String),
    signIn: Match.Optional(String),
    signUp: Match.Optional(String),
};


// Field pattern
var FIELD_PAT = {
    _id: String,
    type: String,
    required: Match.Optional(Boolean),
    displayName: Match.Optional(Match.OneOf(String, FIELD_SUB_PAT)),
    placeholder: Match.Optional(Match.OneOf(String, FIELD_SUB_PAT)),
    minLength: Match.Optional(Match.Integer),
    maxLength: Match.Optional(Match.Integer),
    re: Match.Optional(RegExp),
    func: Match.Optional(Match.Where(_.isFunction)),
    errStr: Match.Optional(String),

    // Client-side Validation
    continuousValidation: Match.Optional(Boolean),
    negativeFeedback: Match.Optional(Boolean),
    negativeValidation: Match.Optional(Boolean),
    positiveValidation: Match.Optional(Boolean),
    positiveFeedback: Match.Optional(Boolean),

    // Transforms
    trim: Match.Optional(Boolean),
    lowercase: Match.Optional(Boolean),
    uppercase: Match.Optional(Boolean),
};

// Route configuration pattern to be checked with check
var ROUTE_PAT = {
    name: Match.Optional(String),
    path: Match.Optional(String),
    template: Match.Optional(String),
    layoutTemplate: Match.Optional(String),
    redirect: Match.Optional(Match.OneOf(String, Match.Where(_.isFunction))),
};




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




/*
    Each field object is represented by the following properties:
        _id:         String   (required)  // A unique field"s id / name
        type:        String   (required)  // Displayed input type
        required:    Boolean  (optional)  // Specifies Whether to fail or not when field is left empty
        displayName: String   (optional)  // The field"s name to be displayed as a label above the input element
        placeholder: String   (optional)  // The placeholder text to be displayed inside the input element
        minLength:   Integer  (optional)  // Possibly specifies the minimum allowed length
        maxLength:   Integer  (optional)  // Possibly specifies the maximum allowed length
        re:          RegExp   (optional)  // Regular expression for validation
        func:        Function (optional)  // Custom function for validation
        errStr:      String   (optional)  // Error message to be displayed in case re validation fails
*/



/*
    Routes configuration can be done by calling AccountsTemplates.configureRoute with the route name and the
    following options in a separate object. E.g. AccountsTemplates.configureRoute("gingIn", option);
        name:           String (optional). A unique route"s name to be passed to iron-router
        path:           String (optional). A unique route"s path to be passed to iron-router
        template:       String (optional). The name of the template to be rendered
        layoutTemplate: String (optional). The name of the layout to be used
        redirect:       String (optional). The name of the route (or its path) where to redirect after form submit
*/


// Allowed routes along with theirs default configuration values
AT.prototype.ROUTE_DEFAULT = {
    changePwd:     { name: "atChangePwd",     path: "change-password"},
    enrollAccount: { name: "atEnrollAccount", path: "enroll-account"},
    forgotPwd:     { name: "atForgotPwd",     path: "forgot-password"},
    resetPwd:      { name: "atResetPwd",      path: "reset-password"},
    signIn:        { name: "atSignIn",        path: "signin"},
    signUp:        { name: "atSignUp",        path: "signup"},
    verifyEmail:   { name: "atVerifyEmail",   path: "verify-email"},
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
    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: false,
    showLabels: true,
    showPlaceholders: true,

    // Behaviour
    confirmPassword: true,
    enablePasswordChange: false,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,

    // Client-side Validation
    //continuousValidation: false,
    //negativeFeedback: false,
    //negativeValidation: false,
    //positiveValidation: true,
    //positiveFeedback: true,

    // Privacy Policy and Terms of Use
    privacyUrl: undefined,
    termsUrl: undefined,

    // Redirects
    homeRoutePath: "/",
    redirectTimeout: 2000, // 2 seconds
};

AT.prototype.SPECIAL_FIELDS = [
    "current_password",
    "new_password",
    "new_password_again",
    "password_again",
    "username_and_email",
];

// SignIn / SignUp fields
AT.prototype._fields = [{
    _id: "email",
    type: "email",
    required: true,
    lowercase: true,
    trim: true,
}, {
    _id: "password",
    type: "password",
    required: true,
    minLength: 6
}];

// Configured routes
AT.prototype._routes = {};

AT.prototype._initialized = false;

// Input type validation
AT.prototype._isValidInputType = function(value) {
    return _.indexOf(this.INPUT_TYPES, value) !== -1;
};

AT.prototype.addField = function(field) {
    // Fields can be added only before initialization
    if (this._initialized)
        throw new Error("AccountsTemplates.addField should strictly be called before AccountsTemplates.init!");
    check(field, FIELD_PAT);
    // Checks there"s currently no field called field._id
    if (_.indexOf(_.pluck(this._fields, "_id"), field._id) !== -1)
        throw new Error("A field called " + field._id + " already exists!");
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
    
    if (!(Meteor.isServer && _.contains(this.SPECIAL_FIELDS, field._id)))
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
    check(config, CONFIG_PAT);
    // Configuration options can be set only before initialization
    if (this._initialized)
        throw new Error("Configuration options must be set before AccountsTemplates.init!");

    // Updates the current configuration
    var normal_options = _.omit(config, "title", "buttonText");
    this._config = _.defaults(normal_options, this._config);

    if (Meteor.isClient){
        if (config.buttonText)
            // Updates the current buttonTexts object
            this.buttonText = _.defaults(config.buttonText, this.buttonText);
        if (config.title)
            // Updates the current title object
            this.title = _.defaults(config.title, this.title);
    }
};

AT.prototype.configureRoute = function(route, options) {
    check(route, String);
    check(options, Match.OneOf(undefined, ROUTE_PAT));
    // Route Configuration can be done only before initialization
    if (this._initialized)
        throw new Error("Route Configuration can be done only before AccountsTemplates.init!");
    // Only allowed routes can be configured
    if (!(route in this.ROUTE_DEFAULT))
        throw new Error("Unknown Route!");

    // Updates the current configuration
    options = _.defaults(options || {}, this.ROUTE_DEFAULT[route]);
    this._routes[route] = options;
};

AT.prototype.getConfig = function(param_name) {
    return this._config[param_name];
};

AT.prototype.hasField = function(fieldId) {
    return _.contains(_.pluck(this._fields, "_id"), fieldId);
};

AT.prototype.getField = function(fieldId) {
    var index = _.indexOf(_.pluck(this._fields, "_id"), fieldId);
    if (index !== -1)
        return this._fields[index];
};

AT.prototype.getFields = function() {
    return this._fields;
};

AT.prototype.getFieldIds = function() {
    return _.pluck(this._fields, "_id");
};

AT.prototype.getRouteName = function(route) {
    if (route in this._routes)
        return this._routes[route].name;
    return null;
};

AT.prototype.getRoutePath = function(route) {
    if (route in this._routes)
        return this._routes[route].path;
    return "#";
};


AT.prototype.validateField = function(fieldId, value, strict) {
    check(fieldId, String);
    check(value, Match.OneOf(undefined, String));
    var field = this.getField(fieldId);
    if (!field)
        return null;
    if (!value){
        if (strict){
            if (field.required)
                return "Required Field";
            else
                return false;
        }
        else
            return null;
    }
    var valueLength = value.length;
    var minLength = field.minLength;
    if (minLength && valueLength < minLength)
        return "Minimum Required Length:" + minLength;
    var maxLength = field.maxLength;
    if (maxLength && valueLength > maxLength)
        return "Maximum Allowed Length:" + maxLength;
    if (field.re && valueLength && !value.match(field.re))
        return field.errStr;
    if (field.func && valueLength && !field.func(value))
        return field.errStr;
    return false;
};

AT.prototype.removeField = function(fieldId) {
    // Fields can be removed only before initialization
    if (this._initialized)
        throw new Error("AccountsTemplates.removeField should strictly be called before AccountsTemplates.init!");
    // Tries to look up the field with given _id
    var index = _.indexOf(_.pluck(this._fields, "_id"), fieldId);
    if (index !== -1)
        this._fields.splice(index, 1);
    else
        if (!(Meteor.isServer && _.contains(this.SPECIAL_FIELDS, fieldId)))
            throw new Error("A field called " + fieldId + " does not exist!");
};

AT.prototype.setupRoutes = function() {
    if (Meteor.isServer){
        // Possibly prints a warning in case showForgotPasswordLink is set to true but the route is not configured
        if (AccountsTemplates.getConfig("showForgotPasswordLink") && !("forgotPwd" in  AccountsTemplates._routes))
            console.warn("AccountsTemplates - WARNING: showForgotPasswordLink set to true, but forgotPwd route is not configured!");
        // Configures "reset password" email link
        if ("resetPwd" in AccountsTemplates._routes){
            Accounts.urls.resetPassword = function(token){
                var path = AccountsTemplates._routes["resetPwd"].path;
                return Meteor.absoluteUrl(path + "/" + token);
            };
        }
        // Configures "enroll account" email link
        if ("enrollAccount" in AccountsTemplates._routes){
            Accounts.urls.enrollAccount = function(token){
                var path = AccountsTemplates._routes["enrollAccount"].path;
                return Meteor.absoluteUrl(path + "/" + token);
            };
        }
        // Configures "verify email" email link
        if ("verifyEmail" in AccountsTemplates._routes){
            Accounts.urls.verifyEmail = function(token){
                var path = AccountsTemplates._routes["verifyEmail"].path;
                return Meteor.absoluteUrl(path + "/" + token);
            };
        }
    }

    Router.map(function() {
        _.each(AccountsTemplates._routes, function(options, route){
            if (route === "changePwd" && !AccountsTemplates.getConfig("enablePasswordChange"))
                throw new Error("changePwd route configured but enablePasswordChange set to false!");
            if (route === "forgotPwd" && !AccountsTemplates.getConfig("showForgotPasswordLink"))
                throw new Error("forgotPwd route configured but showForgotPasswordLink set to false!");
            if (route === "signUp" && AccountsTemplates.getConfig("forbidClientAccountCreation"))
                throw new Error("signUp route configured but forbidClientAccountCreation set to true!");
            // Possibly prints a warning in case the MAIL_URL environment variable was not set
            if (Meteor.isServer && route === "forgotPwd" && (!process.env.MAIL_URL || ! Package["email"])){
                console.warn("AccountsTemplates - WARNING: showForgotPasswordLink set to true, but MAIL_URL is not configured!");
            }

            var name = options.name; // Default provided...
            var path = options.path; // Default provided...
            var template = options.template || "fullPageAtForm";
            var layoutTemplate = options.layoutTemplate || Router.options.layoutTemplate;

            // Possibly adds token parameter
            if (_.contains(["enrollAccount", "resetPwd", "verifyEmail"], route)){
                path += "/:paramToken";
                if (route === "verifyEmail"){
                    this.route(name, {
                        path: path,
                        template: template,
                        layoutTemplate: layoutTemplate,
                        onAfterAction: function(pause) {
                            AccountsTemplates.setDisabled(true);
                            var token = this.params.paramToken;
                            Accounts.verifyEmail(token, function(error){
                                AccountsTemplates.setDisabled(false);
                                AccountsTemplates.submitCallback(error, undefined, function(){
                                    AccountsTemplates.setFieldError('result', 'info.emailVerified');
                                });
                            });
                        },
                        onBeforeAction: function(pause) {
                            AccountsTemplates.setState(route);
                            AccountsTemplates.clearFieldErrors();
                        },
                        onStop: function() {
                            AccountsTemplates.clearFieldErrors();
                        }
                    });
                }
                else
                    this.route(name, {
                        path: path,
                        template: template,
                        layoutTemplate: layoutTemplate,
                        onBeforeAction: function(pause) {
                            AccountsTemplates.setState(route);
                            AccountsTemplates.clearFieldErrors();
                        },
                        onRun: function() {
                            AccountsTemplates.paramToken = this.params.paramToken;
                        },
                        onStop: function() {
                            AccountsTemplates.clearFieldErrors();
                            AccountsTemplates.paramToken = null;
                        }
                    });
            }
            else
                this.route(name, {
                    path: path,
                    template: template,
                    layoutTemplate: layoutTemplate,
                    onBeforeAction: function(pause) {
                        AccountsTemplates.setState(route);
                        AccountsTemplates.clearFieldErrors();
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
        }, this);
    });
};
