
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

    // Privacy Policy and Terms of Use
    privacyUrl: Match.Optional(String),
    termsUrl: Match.Optional(String),

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
        name:        String               // A unique field's name
        type:        String               // Displayed input type
        required:    Boolean  (optional)  // Specifies Whether to fail or not when field is left empty
        displayName: String   (optional)  // The field's name to be displayed as a label above the input element
        placeholder: String   (optional)  // The placeholder text to be displayed inside the input element
        minLength:   Integer  (optional)  // Possibly specifies the minimum allowed length
        maxLength:   Integer  (optional)  // Possibly specifies the maximum allowed length
        re:          RegExp   (optional)  // Regular expression for validation
        func:        Function (optional)  // Custom function for validation
        errStr:      String   (optional)  // Error message to be displayed in case re validation fails
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
    re: Match.Optional(RegExp),
    func: Match.Optional(Match.Where(_.isFunction)),
    errStr: Match.Optional(String),
};

/*
    Routes configuration can be done by calling AccountsTemplates.configureRoute with the route name and the
    following options in a separate object. E.g. AccountsTemplates.configureRoute('gingIn', option);
        name:           String (optional). A unique route's name to be passed to iron-router
        path:           String (optional). A unique route's path to be passed to iron-router
        template:       String (optional). The name of the template to be rendered
        layoutTemplate: String (optional). The name of the layout to be used
        redirect:       String (optional). The name of the route (or its path) where to redirect after form submit
*/

// Route configuration pattern to be checked with check
AT.prototype.ROUTE_PAT = {
    name: Match.Optional(String),
    path: Match.Optional(String),
    template: Match.Optional(String),
    layoutTemplate: Match.Optional(String),
    redirect: Match.Optional(String),
};

// Allowed routes along with theirs default configuration values
AT.prototype.ROUTE_DEFAULT = {
    changePwd:     { name: "atChangePwd",     path: "change-password"},
    enrollAccount: { name: "atEnrollAccount", path: "enroll-account"},
    forgotPwd:     { name: "atForgotPwd",     path: "forgot-password"},
    resetPwd:      { name: "atResetPwd",      path: "reset-password"},
    signIn:        { name: "atSignIn",        path: "signin"},
    signUp:        { name: "atSignUp",        path: "signup"},
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

AT.prototype.configureRoute = function(route, options) {
    check(route, String);
    check(options, Match.OneOf(undefined, this.ROUTE_PAT));
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

AT.prototype.getRouteName = function(route) {
    if (route in this._routes)
        return this._routes[route].name;
    return null;
};

AT.prototype.getRoutePath = function(route) {
    if (route in this._routes)
        return this._routes[route].path;
    return '#';
};

AT.prototype.postSubmitRedirect = function(route){
    var nextPath = AccountsTemplates._routes[route].redirect;
    if (nextPath)
        Router.go(nextPath);
    else{
        var previousPath = AccountsTemplates.getPrevPath();
        if (previousPath)
            Router.go(previousPath);
        else{
            var homeRoutePath = AccountsTemplates.getConfig('homeRoutePath');
            if (homeRoutePath)
                Router.go(homeRoutePath);
        }
    }
};

AT.prototype.validateField = function(fieldName, value, strict) {
    check(fieldName, String);
    check(value, Match.OneOf(undefined, String));
    var field = this.getField(fieldName);
    if (!field)
        return null;
    if (!strict && !value)
        return null;
    if (strict && !field.required && !value)
        return false;
    var valueLength = value.length;
    // Required fields are required on server side!    
    if (strict && field.required && !valueLength)
        return 'Required Field';
    var minLength = field.minLength;
    if (minLength && valueLength < minLength)
        return 'Minimum Required Length:' + minLength;
    var maxLength = field.maxLength;
    if (maxLength && valueLength > maxLength)
        return 'Maximum Allowed Length:' + maxLength;
    if (field.re && valueLength && !value.match(field.re))
        return field.errStr;
    if (field.func && valueLength && !field.func(value))
        return field.errStr;
    return false;
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

AT.prototype.setupRoutes = function() {
    if (Meteor.isServer){
        // Possibly prints a warning in case showForgotPasswordLink is set to true but the route is not configured
        if (AccountsTemplates.getConfig('showForgotPasswordLink') && !('forgotPwd' in  AccountsTemplates._routes))
            console.log('AccountsTemplates - WARNING: showForgotPasswordLink set to true, but forgotPwd route is not configured!');
        // Configures reset password email link
        if ('resetPwd' in AccountsTemplates._routes){
            Accounts.urls.resetPassword = function(token){
                var path = AccountsTemplates._routes['resetPwd'].path;
                return Meteor.absoluteUrl(path + '/' + token);
            };
        }
        // Configures enroll account email link
        if ('enrollAccount' in AccountsTemplates._routes){
            Accounts.urls.enrollAccount = function(token){
                var path = AccountsTemplates._routes['enrollAccount'].path;
                return Meteor.absoluteUrl(path + '/' + token);
            };
        }
    }

    Router.map(function() {
        _.each(AccountsTemplates._routes, function(options, route){
            if (route === 'changePwd' && !AccountsTemplates.getConfig('enablePasswordChange'))
                throw new Error("changePwd route configured but enablePasswordChange set to false!");
            if (route === 'forgotPwd' && !AccountsTemplates.getConfig('showForgotPasswordLink'))
                throw new Error("forgotPwd route configured but showForgotPasswordLink set to false!");
            if (route === 'signUp' && AccountsTemplates.getConfig('forbidClientAccountCreation'))
                throw new Error("signUp route configured but forbidClientAccountCreation set to true!");
            // Possibly prints a warning in case the MAIL_URL environment variable was not set
            if (Meteor.isServer && route === 'forgotPwd' && (!process.env.MAIL_URL || ! Package['email'])){
                console.log('AccountsTemplates - WARNING: showForgotPasswordLink set to true, but MAIL_URL is not configured!');
            }

            var name = options.name; // Default provided...
            var path = options.path; // Default provided...
            // Possibly adds token parameter 
            if (_.contains(['enrollAccount', 'resetPwd'], route))
                path += '/:paramToken';
            var template = options.template || 'fullPageAtForm';
            var layoutTemplate = options.layout || Router.options.layoutTemplate;

            this.route(name, {
                path: path,
                template: template,
                layoutTemplate: layoutTemplate,
                onBeforeAction: function(pause) {
                    var user = Meteor.user();
                    // Change password works only with logged in user...
                    if (route === 'changePwd')
                        user = !user;
                    if (user){
                        pause();
                        AccountsTemplates.postSubmitRedirect(route);
                        return;
                    }
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
        }, this);
    });
};