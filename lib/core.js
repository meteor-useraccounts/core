// ---------------------------------------------------------------------------------

// Patterns for methods" parameters

// ---------------------------------------------------------------------------------

STATE_PAT = {
    changePwd: Match.Optional(String),
    enrollAccount: Match.Optional(String),
    forgotPwd: Match.Optional(String),
    resetPwd: Match.Optional(String),
    signIn: Match.Optional(String),
    signUp: Match.Optional(String),
};


// Configuration pattern to be checked with check
CONFIG_PAT = {
    // Behaviour
    confirmPassword: Match.Optional(Boolean),
    enablePasswordChange: Match.Optional(Boolean),
    enforceEmailVerification: Match.Optional(Boolean),
    forbidClientAccountCreation: Match.Optional(Boolean),
    overrideLoginErrors: Match.Optional(Boolean),
    sendVerificationEmail: Match.Optional(Boolean),

    // Appearance
    defaultLayout: Match.Optional(String),
    showAddRemoveServices: Match.Optional(Boolean),
    showForgotPasswordLink: Match.Optional(Boolean),
    showLabels: Match.Optional(Boolean),
    showPlaceholders: Match.Optional(Boolean),
    hideSignInLink: Match.Optional(Boolean),
    hideSignUpLink: Match.Optional(Boolean),

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


FIELD_SUB_PAT = {
    default: Match.Optional(String),
    changePwd: Match.Optional(String),
    enrollAccount: Match.Optional(String),
    forgotPwd: Match.Optional(String),
    resetPwd: Match.Optional(String),
    signIn: Match.Optional(String),
    signUp: Match.Optional(String),
};


// Field pattern
FIELD_PAT = {
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
    changePwd:     { name: "atChangePwd",     path: "/change-password"},
    enrollAccount: { name: "atEnrollAccount", path: "/enroll-account"},
    forgotPwd:     { name: "atForgotPwd",     path: "/forgot-password"},
    resetPwd:      { name: "atResetPwd",      path: "/reset-password"},
    signIn:        { name: "atSignIn",        path: "/sign-in"},
    signUp:        { name: "atSignUp",        path: "/sign-up"},
    verifyEmail:   { name: "atVerifyEmail",   path: "/verify-email"},
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
AT.prototype.options = {
    // Appearance
    //defaultLayout: undefined,
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
AT.prototype.routes = {};

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
    this.options = _.defaults(normal_options, this.options);

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

    // Possibly adds a initial / to the provided path
    if (options && options.path && options.path[0] !== "/"){
        options = _.clone(options);
        options.path = "/" + options.path;
    }
    // Updates the current configuration
    options = _.defaults(options || {}, this.ROUTE_DEFAULT[route]);
    this.routes[route] = options;
};

AT.prototype.hasField = function(fieldId) {
    return !!this.getField(fieldId);
};

AT.prototype.getField = function(fieldId) {
    var field = _.filter(this._fields, function(field){
        return field._id == fieldId;
    });
    return (field.length === 1) ? field[0] : undefined;
};

AT.prototype.getFields = function() {
    return this._fields;
};

AT.prototype.getFieldIds = function() {
    return _.pluck(this._fields, "_id");
};

AT.prototype.getRouteName = function(route) {
    if (route in this.routes)
        return this.routes[route].name;
    return null;
};

AT.prototype.getRoutePath = function(route) {
    if (route in this.routes)
        return this.routes[route].path;
    return "#";
};

AT.prototype.oauthServices = function(){
    // Extracts names of available services
    var names;
    if (Meteor.isServer)
        names = (Accounts.oauth && Accounts.oauth.serviceNames()) || [];
    else
        names = (Accounts.oauth && Accounts.loginServicesConfigured() && Accounts.oauth.serviceNames()) || [];
    // Extracts names of configured services
    var configuredServices = [];
    if (Accounts.loginServiceConfiguration)
        configuredServices = _.pluck(Accounts.loginServiceConfiguration.find().fetch(), "service");

    // Builds a list of objects containing service name as _id and its configuration status
    var services = _.map(names, function(name){
        return {
            _id : name,
            configured: _.contains(configuredServices, name),
        };
    });

    // Checks whether there is a UI to configure services...
    // XXX: this only works with the accounts-ui package
    var showUnconfigured = typeof Accounts._loginButtonsSession !== "undefined";

    // Filters out unconfigured services in case they"re not to be displayed
    if (!showUnconfigured){
        services = _.filter(services, function(service){
            return service.configured;
        });
    }

    // Sorts services by name
    services = _.sortBy(services, function(service){
        return service._id;
    });

    return services;
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
        if (AccountsTemplates.options.showForgotPasswordLink && !("forgotPwd" in  AccountsTemplates.routes))
            console.warn("AccountsTemplates - WARNING: showForgotPasswordLink set to true, but forgotPwd route is not configured!");
        // Configures "reset password" email link
        if ("resetPwd" in AccountsTemplates.routes){
            var resetPwdPath = AccountsTemplates.routes["resetPwd"].path.substr(1);
            Accounts.urls.resetPassword = function(token){
                return Meteor.absoluteUrl(resetPwdPath + "/" + token);
            };
        }
        // Configures "enroll account" email link
        if ("enrollAccount" in AccountsTemplates.routes){
            var enrollAccountPath = AccountsTemplates.routes["enrollAccount"].path.substr(1);
            Accounts.urls.enrollAccount = function(token){
                return Meteor.absoluteUrl(enrollAccountPath + "/" + token);
            };
        }
        // Configures "verify email" email link
        if ("verifyEmail" in AccountsTemplates.routes){
            var verifyEmailPath = AccountsTemplates.routes["verifyEmail"].path.substr(1);
            Accounts.urls.verifyEmail = function(token){
                return Meteor.absoluteUrl(verifyEmailPath + "/" + token);
            };
        }
    }

    // Determines the default layout to be used in case no specific one is specified for single routes
    var defaultLayout = AccountsTemplates.options.defaultLayout || Router.options.layoutTemplate;

    Router.map(function() {
        _.each(AccountsTemplates.routes, function(options, route){
            if (route === "changePwd" && !AccountsTemplates.options.enablePasswordChange)
                throw new Error("changePwd route configured but enablePasswordChange set to false!");
            if (route === "forgotPwd" && !AccountsTemplates.options.showForgotPasswordLink)
                throw new Error("forgotPwd route configured but showForgotPasswordLink set to false!");
            if (route === "signUp" && AccountsTemplates.options.forbidClientAccountCreation)
                throw new Error("signUp route configured but forbidClientAccountCreation set to true!");
            // Possibly prints a warning in case the MAIL_URL environment variable was not set
            if (Meteor.isServer && route === "forgotPwd" && (!process.env.MAIL_URL || ! Package["email"])){
                console.warn("AccountsTemplates - WARNING: showForgotPasswordLink set to true, but MAIL_URL is not configured!");
            }

            var name = options.name; // Default provided...
            var path = options.path; // Default provided...
            var template = options.template || "fullPageAtForm";
            var layoutTemplate = options.layoutTemplate || defaultLayout;

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
                                AccountsTemplates.submitCallback(error, route, function(){
                                    AccountsTemplates.state.form.set("result", "info.emailVerified");
                                });
                            });
                        },
                        onBeforeAction: function(pause) {
                            AccountsTemplates.setState(route);
                        },
                        onStop: function() {
                            AccountsTemplates.clearState();
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
                        },
                        onRun: function() {
                            AccountsTemplates.paramToken = this.params.paramToken;
                        },
                        onStop: function() {
                            AccountsTemplates.clearState();
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
                    },
                    onStop: function() {
                        AccountsTemplates.clearState();
                    }
                });
        }, this);
    });
};
