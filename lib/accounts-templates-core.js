
// ---------------------------------------------------------------------------------

// AccountsTemplates object

// ---------------------------------------------------------------------------------



// -------------------
// Client/Server stuff
// -------------------

// Constructor
function AT() {
    if (Meteor.isClient) {
        this._deps.state = new Deps.Dependency();
        this._deps.disabled = new Deps.Dependency();
        this._deps.ready = new Deps.Dependency();
        this._deps.errors = {};
        this._deps.errors.overall = new Deps.Dependency();
        this._deps.errors.result = new Deps.Dependency();
        this.errors.overall = false;
        this.errors.result = false;
    }
}

// Configuration pattern to be checked with check
AT.prototype.CONFIG_PAT = {
    showPlaceholders: Match.Optional(Boolean),
    displayFormLabels: Match.Optional(Boolean),
    formValidationFeedback: Match.Optional(Boolean),
    continuousValidation: Match.Optional(Boolean),
    showAddRemoveServices: Match.Optional(Boolean),
    forbidClientAccountCreation: Match.Optional(Boolean),

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
    showPlaceholders: true,
    displayFormLabels: true,
    formValidationFeedback: true,
    continuousValidation: true,
    showAddRemoveServices: false,
    forbidClientAccountCreation: false,
    homeRoute: '/',
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

// Initialization
AT.prototype.init = function() {
    if (this._initialized)
        return;

    if (Meteor.isServer) {
        // A password field is strictly required
        var password = this.getField('password');
        if (!password)
            throw Error("A password field is strictly required!");
        if (password.type !== "password")
            throw Error("The type of password field should be password!");

        // Then we can have 'username' or 'email' or even both of them
        // but at least one of the two is strictly required
        var username = this.getField('username');
        var email = this.getField('email');
        if (!username && !email)
            throw Error("At least one field out of 'username' and 'email' is strictly required!");
        if (username && !username.required)
            throw Error("The username field should be required!");
        if (email){
            if (email.type !== "email")
                throw Error("The type of email field should be email!");
            if (username){
                // username and email
                if (username.type !== "text")
                    throw Error("The type of username field should be text when email field is present!");
            }else{
                // email only
                if (!email.required)
                    throw Error("The email field should be required when username is not present!");
            }
        }
        else{
            // username only
            if (username.type !== "email" && username.type !== "text")
                throw Error("The type of username field should be email or text!");
        }

        // Possibly publish more user data in order to be able to show add/remove
        // buttons for 3rd-party services
        if (this.getConfig('showAddRemoveServices')){
            // Publish additional current user info to get the list of registered services
            // XXX TODO:
            // ...adds only user.services.*.id
            Meteor.publish("userRegisteredServices", function() {
                var userId = this.userId;
                return Meteor.users.find(userId, {fields: {services: 1}});
                /*
                if (userId){
                    var user = Meteor.users.findOne(userId);
                    var services_id = _.chain(user.services)
                        .keys()
                        .reject(function(service){return service === "resume";})
                        .map(function(service){return 'services.' + service + '.id';})
                        .value();
                    var projection = {};
                    _.each(services_id, function(key){projection[key] = 1;});
                    return Meteor.users.find(userId, {fields: projection});
                }
                */
            });
        }
        // ------------
        // Server-Side Routes Definition
        //
        //   this allows for server-side iron-router usage, like, e.g.
        //   Router.map(function(){
        //       this.route('atResetPassword', {
        //           path: '*',
        //           where: 'server'
        //           action: function() {
        //               this.response.statusCode = 404;
        //               return this.response.end(Handlebars.templates['404']());
        //           }
        //       });
        //   })
        // ------------
        Router.map(function() {
            this.route('atResetPassword', {
                path: 'reset-password/:paramToken',
            });
            this.route('atEnrollAccount', {
                path: 'enroll-account/:paramToken',
            });

            // Possibly sets up sign in route
            var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
            if (signInRoutePath){
                this.route( AccountsTemplates.getConfig('signInRouteName') || 'signIn', {
                    path: signInRoutePath,
                });
            }

            // Possibly sets up sign up route
            var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
            if (signUpRoutePath){
                this.route( AccountsTemplates.getConfig('signUpRouteName') || 'signUp', {
                    path: signUpRoutePath,
                });
            }

            // Possibly sets up forgot password route
            var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
            if (forgotPwdRoutePath){
                this.route( AccountsTemplates.getConfig('forgotPwdRouteName') || 'forgotPwd', {
                    path: forgotPwdRoutePath,
                });
            }
        });
    }

    if (Meteor.isClient) {
        // Initializes fields' errors dependencies
        var field_names = this.getFieldsNames();
        _.map(field_names, function(fieldName){
            this._deps.errors[fieldName] = new Deps.Dependency();
            this.errors[fieldName] = false;
        }, this);

        this.knownRoutes = [
            AccountsTemplates.getConfig('changePwdRoutePath'),
            AccountsTemplates.getConfig('forgotPwdRoutePath'),
            AccountsTemplates.getConfig('homeRoutePath'),
            AccountsTemplates.getConfig('signInRoutePath'),
            AccountsTemplates.getConfig('signUpRoutePath'),
        ];

        var usernamePresent = _.contains(field_names, 'username');
        if (usernamePresent)
            this._loginType = 'username';
        else
            this._loginType = 'email';

        // Possibly subscribes to extended user data (to get the list of registered services...)
        if (this.getConfig('showAddRemoveServices')){
            Meteor.subscribe('userRegisteredServices');
        }

        // ------------
        // Routing Stuff
        // ------------

        // Stores previous path on path change...
        Router.onStop(function() {
            var currPath = this.path;
            if (!_.contains(AccountsTemplates.knownRoutes, currPath))
                AccountsTemplates.setPrevPath(this.path);
        });

        Router.map(function() {
            // Possibly sets up sign in route
            var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
            if (signInRoutePath){
                this.route( AccountsTemplates.getConfig('signInRouteName') || 'signIn', {
                    path: signInRoutePath,
                    template: AccountsTemplates.getConfig('signInRouteTemplate') || 'fullPageSigninForm',
                    layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
                    onBeforeAction: function() {
                        AccountsTemplates.setState('sgin');
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
            }

            // Possibly sets up sign up route
            var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
            if (signUpRoutePath){
                this.route( AccountsTemplates.getConfig('signUpRouteName') || 'signUp', {
                    path: signUpRoutePath,
                    template: AccountsTemplates.getConfig('signUpRouteTemplate') || 'fullPageSigninForm',
                    layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
                    onBeforeAction: function() {
                        AccountsTemplates.setState('sgup');
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
            }

            var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
            if (forgotPwdRoutePath){
                this.route( AccountsTemplates.getConfig('forgotPwdRouteName') || 'atForgotPwd', {
                    path: forgotPwdRoutePath,
                    template: AccountsTemplates.getConfig('forgotPwdRouteTemplate') || 'fullPageSigninForm',
                    layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
                    onBeforeAction: function() {
                        Meteor.call('ATEmailConfigured', function(err, emailConfigured) {
                            if (!err && !emailConfigured)
                                Router.go('/');
                        });
                        AccountsTemplates.setState('fpwd');
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
            }
            // FIXME: try to do the following mappings only if email is configured
            //        at the moment the problem is calling the method ATEmailConfigured to discover
            //        to set it up or not. The delay introduced by the method call seems to cause
            //        route set-up to be late: when the link on the email is clicked and the page loaded
            //        there is no /reset-password route and we get a 404!

            this.route(AccountsTemplates.getConfig('resetPwdRouteName') || 'atResetPwd', {
                path: (AccountsTemplates.getConfig('resetPwdRoutePath') || 'reset-password') + '/:paramToken',
                template: AccountsTemplates.getConfig('resetPwdRouteTemplate') || 'fullPageResetPassword',
                layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
                onBeforeAction: function(){
                    Meteor.call('ATEmailConfigured', function(err, emailConfigured) {
                        if (!err && !emailConfigured)
                            Router.go('/');
                    });
                    AccountsTemplates.setState('rpwd');
                },
                onRun: function() {
                    AccountsTemplates.paramToken = this.params.paramToken;
                },
                onStop: function() {
                    AccountsTemplates.clearFieldErrors();
                    AccountsTemplates.paramToken = '';
                }
            });

            this.route(AccountsTemplates.getConfig('enrollAccountRouteName') || 'atEnrollAccount', {
                path: (AccountsTemplates.getConfig('enrollAccountRoutePath') || 'enroll-account') + '/:paramToken',
                template: AccountsTemplates.getConfig('enrollAccountRouteTemplate') || 'fullPageResetPassword',
                layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
                onBeforeAction: function(){
                    Meteor.call('ATEmailConfigured', function(err, emailConfigured) {
                        if (!err && !emailConfigured)
                            return Router.go('/');
                    });
                    AccountsTemplates.setState('enro');
                },
                onRun: function() {
                    AccountsTemplates.paramToken = this.params.paramToken;
                },
                onStop: function() {
                    AccountsTemplates.clearFieldErrors();
                    AccountsTemplates.paramToken = '';
                }
            });
        });

        // Determines whether the email is configured to, possibly prevent showing 'Forgot Password?' link
        var self = this;
        Meteor.call("ATEmailConfigured", function(err, result) {
            if (!err){
                self.emailConfigured = result;
            }
            self._ready = true;
            self._deps.ready.changed();
        });

        //this._ready = true;
        //this._deps.ready.changed();
    }
    // Marks AccountsTemplates as initialized
    this._initialized = true;
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

// -----------------
// Client-only stuff
// -----------------

if (Meteor.isClient) {

    // Allowed Internal (client-side) States
    AT.prototype.STATES = [
        "sgin", // Sign In
        "sgup", // Sign Up
        "fpwd", // Forgot Password
        //"cpwd", // Change Password
        "rpwd", // Reset Password
        "enro", // Account Enrollment
    ];

    // Reactivity Stuff
    AT.prototype._deps = {};

    AT.prototype._loginType = '';

    AT.prototype._prevPath = '/';

    AT.prototype._ready = false;

    AT.prototype._disabled = false;

    // Flag used to avoid redirecting to previous route when signing in/up
    // as a results of a call to ensureSignedIn
    AT.prototype.avoidRedirect = false;

    // Current Errors (to be among allowed ones, see STATES)
    AT.prototype.errors = {};

    AT.prototype.emailConfigured = false;

    AT.prototype.knownRoutes = [];

    AT.prototype.paramToken = '';

    // Current Internal (client-side) State (to be among allowed ones, see STATES)
    AT.prototype.state = "sgin";

    // State validation
    AT.prototype._isValidState = function(value) {
        if (this.getConfig('forbidClientAccountCreation') && value === "sgup")
            return false;
        return _.indexOf(this.STATES, value) !== -1;
    };

    AT.prototype.loginType = function () {
        return this._loginType;
    };

    // Getter for previous route's path
    AT.prototype.getPrevPath = function() {
        return this._prevPath;
    };

    // Setter for previous route's path
    AT.prototype.setPrevPath = function(newPath) {
        check(newPath, String);
        this._prevPath = newPath;
    };

    // Getter for current state
    AT.prototype.getState = function() {
        this._deps.state.depend();
        return this.state;
    };

    // Getter for disabled state
    AT.prototype.isDisabled = function() {
        this._deps.disabled.depend();
        return this._disabled;
    };

    // Setter for disabled state
    AT.prototype.setDisabled = function(value) {
        check(value, Boolean);
        if (this._disabled === value)
            return;
        this._disabled = value;
        return this._deps.disabled.changed();
    };

    // Setter for current state
    AT.prototype.setState = function(value) {
        check(value, String);
        if (value === this.state)
            return;
        if (!this._isValidState(value))
            throw new Meteor.Error(500, "Internal server error", "accounts-templates-core package got an invalid state value!");
        this.state = value;
        this.clearFieldErrors();
        return this._deps.state.changed();
    };

    // Getter for current error of field *field_name*
    AT.prototype.getFieldError = function(field_name) {
        check(field_name, String);
        this._deps.errors[field_name].depend();
        return this.errors[field_name];
    };

    // Setter for current error of field *field_name*
    AT.prototype.setFieldError = function(field_name, error_text) {
        check(field_name, String);
        if (error_text === this.errors[field_name])
            return;
        this.errors[field_name] = error_text;
        return this._deps.errors[field_name].changed();
    };

    AT.prototype.clearFieldErrors = function() {
        var field_names = this.getFieldsNames();
        var errors = this.errors;
        var deps_errors = this._deps.errors;
        _.map(field_names, function(fieldName){
            if (errors[fieldName]) {
                errors[fieldName] = false;
                deps_errors[fieldName].changed();
            }
        });
        if (errors.overall){
            errors.overall = false;
            deps_errors.overall.changed();
        }
        if (errors.result){
            errors.result = false;
            deps_errors.result.changed();
        }
    };

    AT.prototype.ensureSignedIn = function(pause) {
        if (!Meteor.user()) {
            if (Meteor.loggingIn())
                return pause();
            AccountsTemplates.setPrevPath(this.path);
            AccountsTemplates.setState('sgin');
            AccountsTemplates.setFieldError('overall', "Must be logged in");
            AccountsTemplates.avoidRedirect = true;
            // render the login template but keep the url in the browser the same
            var signInRouteTemplate = AccountsTemplates.getConfig('signInRouteTemplate');
            this.render(signInRouteTemplate || 'fullPageSigninForm');
            this.renderRegions();
            // pause the rest of the before hooks and the action function
            return pause();
        }
    };

    AT.prototype.ready = function() {
        this._deps.ready.depend();
        return this._ready;
    };

    var capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    AT.prototype.signinFormHelpers = {
        buttonText: function() {
            var label = {
                sgin: 'signIn',
                sgup: 'signUp',
                fpwd: 'emailResetLink',
                cpwd: 'updateYourPassword',
            };
            return T9n.get(label[AccountsTemplates.getState()]);
        },
        disabled: function() {
            if (AccountsTemplates.isDisabled())
                return 'disabled';
            return '';
        },
        displayField: function() {
            var name = this.name;
            if (name === 'username'){
                if (AccountsTemplates.getState() === 'fpwd')
                    return false;
                return true;
            }
            if (name === 'email'){
                if (AccountsTemplates.loginType() === 'username' && AccountsTemplates.getState() === 'sgin')
                    return false;
                return true;
            }
            if (name == 'password' && AccountsTemplates.getState() !== 'fpwd')
                return true;
            return AccountsTemplates.getState() === 'sgup';
        },
        fields: function() {
            return AccountsTemplates.getFields();
        },
        forgotPwdLink: function(){
            var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
            return forgotPwdRoutePath || '#';
        },
        loginServices: function() {
            return Accounts.oauth && Accounts.oauth.serviceNames().sort();
        },
        otherLoginServices: function() {
            return Accounts.oauth && Accounts.oauth.serviceNames().length > 0;
        },
        overallError: function() {
            if (AccountsTemplates.ready()) {
                var errorText = AccountsTemplates.getFieldError('overall');
                if (errorText)
                    return T9n.get('error.accounts.' + errorText);
            }
        },
        result: function() {
            if (AccountsTemplates.ready()) {
                var resultText = AccountsTemplates.getFieldError('result');
                if (resultText)
                    return T9n.get(resultText);
            }
        },
        showAddRemoveServices: function() {
            return AccountsTemplates.getConfig('showAddRemoveServices');
        },
        showForgotPassword: function() {
            return AccountsTemplates.ready() && AccountsTemplates.emailConfigured && AccountsTemplates.getState() !== 'fpwd';
        },
        showSignUpLink: function(){
            return AccountsTemplates.ready() && !AccountsTemplates.getConfig('forbidClientAccountCreation');
        },
        signedInAs: function() {
            var user = Meteor.user();
            if (user) {
                if (user.username) {
                    return user.username;
                } else if (user.profile && user.profile.name) {
                    return user.profile.name;
                } else if (user.emails && user.emails[0]) {
                    return user.emails[0].address;
                } else {
                    return "Signed In";
                }
            }
        },
        signInLink: function(){
            var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
            return signInRoutePath || '#';
        },
        signUpLink: function(){
            var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
            return signUpRoutePath || '#';
        },
        stateIs: function(state) {
            return AccountsTemplates.getState() === state;
        },
        submitDisabled: function(){
            var errors = _.map(AccountsTemplates.getFieldsNames(), function(name){
                return AccountsTemplates.getFieldError(name);
            });
            if (_.some(errors))
                return 'disabled';
        },
        passwordLoginService: function() {
            return !!Package['accounts-password'];
        },
    };

    AT.prototype.atInputHelpers = {
        disabled: function() {
            if (AccountsTemplates.isDisabled())
                return 'disabled';
            return '';
        },
        displayFormLabels: function() {
            return AccountsTemplates.getConfig('displayFormLabels');
        },
        displayName: function() {
            return T9n.get(this.displayName || this.name, markIfMissing=false);
        },
        errorText: function() {
            if (AccountsTemplates.ready())
                return T9n.get(AccountsTemplates.getFieldError(this.name), markIfMissing=false);
        },
        hasError: function() {
            return AccountsTemplates.ready() && AccountsTemplates.getFieldError(this.name);
        },
        hasFeedback: function() {
            return AccountsTemplates.getConfig('formValidationFeedback');
        },
        placeholder: function() {
            if (AccountsTemplates.getConfig('showPlaceholders')) {
                var placeholder = this.placeholder || this.displayName || this.name;
                return T9n.get(placeholder, markIfMissing=false);
            }
        },
    };

    AT.prototype.atResetPasswordHelpers = {
        disabled: function() {
            if (AccountsTemplates.isDisabled())
                return 'disabled';
            return '';
        },
        overallError: function() {
            if (AccountsTemplates.ready()) {
                var errorText = AccountsTemplates.getFieldError('overall');
                if (errorText)
                    return T9n.get('error.accounts.' + errorText);
            }
        },
        pwdField: function() {
            return AccountsTemplates.getField('password');
        },
        stateIs: function(state) {
            return AccountsTemplates.getState() === state;
        }
    };

    AT.prototype.atSocialHelpers = {
        buttonText: function() {
            var service = capitalize(this);
            var unconfigured = Accounts.loginServiceConfiguration.find({
                service: this.toString()
            }).fetch().length === 0;
            if (unconfigured)
                return T9n.get('configure') + ' ' + service;
            var showAddRemove = AccountsTemplates.getConfig('showAddRemoveServices');
            var user = Meteor.user();
            if (user && showAddRemove){
                if (user.services && user.services[this.toString()]){
                    var numServices = _.keys(user.services).length; // including 'resume'
                    if (numServices === 2)
                        return service;
                    else
                        return T9n.get('remove') + ' ' + service;
                } else
                        return T9n.get('add') + ' ' + service;
            }
            return T9n.get('signIn') + ' ' + T9n.get('with') + ' ' + service;
        },
        disabled: function() {
            if (AccountsTemplates.isDisabled())
                return 'disabled';
            var user = Meteor.user();
            if (user){
                var numServices = 0;
                if (user.services)
                    numServices = _.keys(user.services).length; // including 'resume'
                if (numServices === 2 && user.services[this])
                    return 'disabled';
            }
        },
        iconClass: function() {
            var classStr = 'fa fa-' + this.toString();
            return classStr;
        },
        show: function() {
            var serviceName = this.toString();
            var unconfigured = Accounts.loginServiceConfiguration.find({
                service: serviceName
            }).fetch().length === 0;
            if (unconfigured){
                var showUnconfigured = typeof Accounts._loginButtonsSession !== "undefined";
                return showUnconfigured;
            }
            var user = Meteor.user();
            var showAddRemove = AccountsTemplates.getConfig('showAddRemoveServices');
            return !user || showAddRemove;
        }
    };

    AT.prototype.signinFormEvents = {
        'click #at-fpwd': function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (AccountsTemplates.isDisabled())
                return;
            var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
            if (forgotPwdRoutePath)
                Router.go(forgotPwdRoutePath);
            else
                AccountsTemplates.setState('fpwd');
        },
        'click #at-sgin': function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (AccountsTemplates.isDisabled())
                return;
            var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
            if (signInRoutePath)
                Router.go(signInRoutePath);
            else
                AccountsTemplates.setState('sgin');
        },
        'click #at-sgup': function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (AccountsTemplates.isDisabled())
                return;
            var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
            if (signUpRoutePath)
                Router.go(signUpRoutePath);
            else
                AccountsTemplates.setState('sgup');
        },
        'submit #at-form-login': function(event, t) {
            event.preventDefault();
            event.stopPropagation();
            $("#at-btn").blur();

            var username;
            var email;
            var password;

            // Sign Up
            if (AccountsTemplates.getState() === 'sgup') {
                if (Meteor.userId()) {
                    throw new Meteor.Error(403, "Already signed in!", {});
                }
                AccountsTemplates.setDisabled(true);
                var signupInfo = {};
                var fields = AccountsTemplates.getFieldsNames();
                _.map(fields, function(fieldName){
                    var value = t.find('#AT_field_' + fieldName).value;
                    if (!!value)
                        signupInfo[fieldName] = value;
                });
                // Client-side pre-validation
                // Validates fields values
                // NOTE: This is the only place where password validation can be enforced!
                var someError = false;
                _.each(fields, function(fieldName){
                    var value = signupInfo[fieldName] || '';
                    var validationErr = AccountsTemplates.fullFieldValidation(fieldName, value);
                    if (validationErr) {
                        AccountsTemplates.setFieldError(fieldName, validationErr);
                        someError = true;
                    }
                });
                if (someError){
                    AccountsTemplates.setDisabled(false);
                    return;
                }
                // Extracts username, email, and pwd
                username = signupInfo.username;
                email = signupInfo.email;
                password = signupInfo.password;
                // Clears profile data removing username, email, and pwd
                delete signupInfo.username;
                delete signupInfo.email;
                delete signupInfo.password;

                var hashPassword = function (password) {
                  return {
                    digest: SHA256(password),
                    algorithm: "sha-256"
                  };
                };
                var signupData = {
                    password: hashPassword(password),
                    profile: signupInfo
                };
                // Possibly add username and/or email
                if (username)
                    signupData['username'] = username;
                if (email)
                    signupData['email'] = email;

                Meteor.call('ATCreateUserServer', signupData, function(error){
                    if (error) {
                        AccountsTemplates.setDisabled(false);
                        // If error.details is an object, we may try to set fields errors from it
                        if(typeof(error.details) === 'object'){
                            var fieldErrors = error.details;
                            for (var fieldName in fieldErrors)
                                AccountsTemplates.setFieldError(fieldName, fieldErrors[fieldName]);
                        }
                        else
                            AccountsTemplates.setFieldError('overall', error.reason || "Unknown error");
                    } else {
                        // FIXME: deal with verification email
                        AccountsTemplates.setFieldError('overall', false);
                        var login;
                        if (username)
                            login = username;
                        else
                            login = email;
                        Meteor.loginWithPassword(login, password, function(error) {
                            AccountsTemplates.setDisabled(false);
                            if (error) {
                                AccountsTemplates.setFieldError('overall', error.reason);
                            } else {
                                AccountsTemplates.setFieldError('overall', false);
                                if (AccountsTemplates.avoidRedirect)
                                    AccountsTemplates.avoidRedirect = false;
                                else{
                                    var nextPath = AccountsTemplates.getConfig('postSignUpRoutePath');
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
                                }
                            }
                        });
                    }
                });
            }
            // Sign In
            if (AccountsTemplates.getState() === 'sgin') {
                if (AccountsTemplates.loginType() === 'username')
                    login = t.find('#AT_field_username').value;
                else
                    login = t.find('#AT_field_email').value;
                password = t.find('#AT_field_password').value;
                return Meteor.loginWithPassword(login, password, function(error) {
                    AccountsTemplates.setDisabled(false);
                    if (error) {
                        AccountsTemplates.setFieldError('overall', error.reason);
                    } else {
                        AccountsTemplates.setFieldError('overall', false);
                        if (AccountsTemplates.avoidRedirect)
                            AccountsTemplates.avoidRedirect = false;
                        else{
                            var nextPath = AccountsTemplates.getConfig('postSignInRoutePath');
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
                        }
                    }
                });
            }
            // Forgot Password
            if (AccountsTemplates.getState() === 'fpwd') {
                // Sending an empty email value to Accounts.forgotPassword makes it
                // throw an error without calling the callback...
                // ...so, for now adding "|| ' '" fixes issue #26
                email = t.find('#AT_field_email').value || ' ';

                var validationErr = AccountsTemplates.fullFieldValidation('email', email);
                if (validationErr) {
                    AccountsTemplates.setFieldError('login', validationErr);
                    return;
                }
                AccountsTemplates.setDisabled(true);

                return Accounts.forgotPassword({email: email}, function(error) {
                    if (error) {
                        AccountsTemplates.setFieldError('overall', error.reason);
                        AccountsTemplates.setFieldError('result', false);
                    } else {
                        AccountsTemplates.setFieldError('overall', false);
                        AccountsTemplates.setFieldError('result', 'emailSent');
                        t.find('#AT_field_email').value = '';
                    }
                    AccountsTemplates.setDisabled(false);
                });
            }
        },
        'click #at-btn-logout': function(event) {
            event.preventDefault();
            event.stopPropagation();
            AccountsTemplates.clearFieldErrors();
            Meteor.logout();
        }
    };

    AT.prototype.atInputEvents = {
        'focusout input': function(event){
            if (AccountsTemplates.getState() === "sgin")
                return;
            // Client-side only validation
            var currTarg = event.currentTarget;
            var value = currTarg.value;
            var fieldName = currTarg.id.slice(9); // Skips 'AT_field_'
            AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));
        },
        'keyup input': function(event){
            if (AccountsTemplates.getState() === "sgin")
                return;
            var currTarg = event.currentTarget;
            var value = currTarg.value;
            var fieldName = currTarg.id.slice(9); // Skips 'AT_field_'
            if (AccountsTemplates.getConfig('continuousValidation'))
                // Client-side only validation
                AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));
            else
                AccountsTemplates.setFieldError(fieldName, false);
        }
    };

    AT.prototype.atResetPasswordEvents = {
        'submit #at-form-pwd': function(event, t) {
            event.preventDefault();
            event.stopPropagation();
            $("#at-btn").blur();
            AccountsTemplates.setDisabled(true);
            var paramToken = AccountsTemplates.paramToken;
            var password = t.find('#AT_field_password').value;
            check(paramToken, String);
            check(password, String);
            // NOTE: This is the only place where password validation can be enforced!
            var validationErr = AccountsTemplates.fullFieldValidation('password', password);
            if (validationErr) {
                AccountsTemplates.setFieldError('password', validationErr);
                AccountsTemplates.setDisabled(false);
                return;
            }
            return Accounts.resetPassword(paramToken, password, function(error) {
                if (error) {
                    AccountsTemplates.setFieldError('overall', error.reason);
                } else {
                    AccountsTemplates.setFieldError('overall', false);
                    var nextPath = AccountsTemplates.getConfig('postSignUpRoutePath') || AccountsTemplates.getConfig('homeRoutePath');
                    if (nextPath)
                        Router.go(nextPath);
                }
                AccountsTemplates.setDisabled(false);
            });
        },
    };

    AT.prototype.atSocialEvents = {
        'click button': function(event, t) {
            event.preventDefault();
            event.stopPropagation();
            t.find('button').blur();
            if (AccountsTemplates.isDisabled())
                return;
            var user = Meteor.user();
            if (user && user.services && user.services[this.toString()]){
                var numServices = _.keys(user.services).length; // including 'resume'
                if (numServices === 2)
                    return;
                else{
                    AccountsTemplates.setDisabled(true);
                    Meteor.call('ATRemoveService', this.toString(), function(error){
                        AccountsTemplates.setDisabled(false);
                    });
                }
            } else {
                AccountsTemplates.setDisabled(true);
                var serviceName = button.id.split('-')[1];
                var loginWithService = Meteor["loginWith" + capitalize(serviceName)];
                options = {};
                if (Accounts.ui) {
                    if (Accounts.ui._options.requestPermissions[serviceName]) {
                        options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
                    }
                    if (Accounts.ui._options.requestOfflineToken[serviceName]) {
                        options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
                    }
                }
                loginWithService(options, function(err, melddUsers) {
                    AccountsTemplates.setDisabled(false);
                    if (!err) {
                        var previousPath = AccountsTemplates.getPrevPath();
                        if (previousPath)
                            return Router.go(previousPath);
                    } else if (err instanceof Accounts.LoginCancelledError) {
                        // do nothing
                    } else if (err instanceof ServiceConfiguration.ConfigError) {
                        if (Accounts._loginButtonsSession)
                            return Accounts._loginButtonsSession.configureService(serviceName);
                    } else {
                        console.log('error', err);
                        //return loginButtonsSession.errorMessage(err.reason || "Unknown error");
                        //Accounts._loginButtonsSession.errorMessage(err.reason || i18n("error.unknown"))
                    }
                });
            }
        },
    };
}


AccountsTemplates = new AT();


if (Meteor.isServer) {
    // Client side account creation is disabled by default:
    // the methos ATCreateUserServer is used instead!
    // to actually disable client side account creation use:
    //
    //    AccountsTemplates.config({
    //        forbidClientAccountCreation: true
    //    });
    Accounts.config({
        forbidClientAccountCreation: true
    });

    Accounts.urls.resetPassword = function(token){
        return Meteor.absoluteUrl('reset-password/' + token);
    };
    Accounts.urls.enrollAccount = function(token){
        return Meteor.absoluteUrl('enroll-account/' + token);
    };
}
