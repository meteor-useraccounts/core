
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

    // Routes' path
    forgotPwdRoutePath: Match.Optional(String),
    homeRoutePath: Match.Optional(String),
    postSignUpRoutePath: Match.Optional(String),
    signInRoutePath: Match.Optional(String),
    signUpRoutePath: Match.Optional(String),

    // Routes' name
    signInRouteName: Match.Optional(String),
    signUpRouteName: Match.Optional(String),
    forgotPwdRouteName: Match.Optional(String),

    // Templates
    forgotPwdRouteTemplate: Match.Optional(String),
    signInRouteTemplate: Match.Optional(String),
    signUpRouteTemplate: Match.Optional(String),
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
    homeRoute: '/',
    postSignUpRoutePath: '/',
};

// SignIn / SignUp fields
AT.prototype._fields = [{
    name: "login",
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
    /*
    var i = this.INPUT_TYPES.length;
    while (i--)
        if (this.INPUT_TYPES[i] === value) return true;
    return false;
    */
};

AT.prototype.addField = function(field) {
    // Fields can be added only before initialization
    if (this._initialized)
        throw new Error("AccountsTemplates.addField should strictly be called before AccountsTemplates.init!");
    check(field, this.FIELD_PAT);
    // Checks there"s currently no field called field.name
    if (_.indexOf(_.pluck(this._fields, 'name'), field.name) !== -1)
        throw new Error("A field called " + field.name + " already exists!");
    /*
    var i = this._fields.length;
    while (i--) {
        if (this._fields[i].name === field.name)
            throw new Error("A field called " + field.name + " already exists!");
    }
    */
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
        /*
        var i = fields.length;
        while (i--)
            this.addField(fields[i]);
        */
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
    /*
    var index = -1;
    var i = this._fields.length;
    while (i--) {
        if (this._fields[i].name === fieldName) {
            index = i;
            break;
        }
    }
    */
    if (index !== -1)
        return this._fields[index];
};

AT.prototype.getFields = function() {
    return this._fields;
};

AT.prototype.getFieldsNames = function() {
    return _.pluck(this._fields, 'name');
    /*
    var names = [];
    var i = this._fields.length;
    while (i--) {
        names.push(this._fields[i].name);
    }
    return names;
    */
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
        // A login field is strictly required
        var login = this.getField('login');
        if (!login)
            throw Error("A login field is strictly required!");
        if (login.type !== "email" && login.type !== "text")
            throw Error("The type of login field should be email or text!");
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
    }

    if (Meteor.isClient) {
        // Initializes fields' errors dependencies
        var field_names = this.getFieldsNames();
        _.map(field_names, function(fieldName){
            this._deps.errors[fieldName] = new Deps.Dependency();
            this.errors[fieldName] = false;
        })
        /*
        var i = field_names.length;
        while (i--) {
            this._deps.errors[field_names[i]] = new Deps.Dependency();
            this.errors[field_names[i]] = false;
        }
        */

        // Determines whether the email is configured to, possibly prevent showing 'Forgot Password?' link
        var self = this;
        Meteor.call("ATEmailConfigured", function(err, result) {
            if (!err)
                self.emailConfigured = result;
            self._ready = true;
            self._deps.ready.changed();
        });

        // Possibly subscribes to extended user data (to get the list of registered services...)
        if (this.getConfig('showAddRemoveServices')){
            Meteor.subscribe('userRegisteredServices');
        }

    }
    // Marks AccountsTemplates as initialized
    this._initialized = true;
};

AT.prototype.validateField = function(fieldName, value) {
    check(fieldName, String);
    check(value, String);
    var field = this.getField(fieldName);
    if (!field || value === '')
        return;
    if (field.minLength && value.length < field.minLength)
        return 'Minimum Required Length:' + field.minLength;
    if (field.maxLength && value.length > field.maxLength)
        return 'Maximum Allowed Length:' + field.maxLength;
    if (field.re && value.length && !value.match(field.re))
        return field.errStr;
};

AT.prototype.fullFieldValidation = function(fieldName, value) {
    check(fieldName, String);
    check(value, String);
    var field = this.getField(fieldName);
    if (!field || (!field.required && value === ''))
        return;
    if (field.required && !value.length)
        return 'Required Field';
    if (field.minLength && value.length < field.minLength)
        return 'Minimum Required Length:' + field.minLength;
    if (field.maxLength && value.length > field.maxLength)
        return 'Maximum Allowed Length:' + field.maxLength;
    if (field.re && value.length && !value.match(field.re))
        return field.errStr;
};

AT.prototype.removeField = function(fieldName) {
    // Fields can be removed only before initialization
    if (this._initialized)
        throw new Error("AccountsTemplates.removeField should strictly be called before AccountsTemplates.init!");
    // Tries to look up the field with given name
    var index = _.indexOf(_.pluck(this._fields, 'name'), fieldName);
    /*
    var index = -1;
    var i = this._fields.length;
    while (i--) {
        if (this._fields[i].name == field_name) {
            index = i;
            break;
        }
    }
    */
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

    AT.prototype._prevPath = '/';

    AT.prototype._ready = false;

    AT.prototype._disabled = false;

    // Current Errors (to be among allowed ones, see STATES)
    AT.prototype.errors = {};

    AT.prototype.emailConfigured = false;

    AT.prototype.resetToken = '';

    // Current Internal (client-side) State (to be among allowed ones, see STATES)
    AT.prototype.state = "sgin";

    // State validation
    AT.prototype._isValidState = function(value) {
        return _.indexOf(this.STATES, value) !== -1;
        /*
        var i = this.STATES.length;
        while (i--)
            if (this.STATES[i] === value) return true;
        return false;
        */
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
        })
        /*
        var i = field_names.length;
        while (i--) {
            var name = field_names[i];
            if (errors[name]) {
                errors[name] = false;
                deps_errors[name].changed();
            }
        }
        */
        errors.overall = false;
        deps_errors.overall.changed();
        errors.result = false;
        deps_errors.result.changed();
    };

    AT.prototype.ensureSignedIn = function(pause) {
        if (!Meteor.user()) {
            if (Meteor.loggingIn())
                return pause();
            AccountsTemplates.setPrevPath(this.path);
            AccountsTemplates.setState('sgin');
            AccountsTemplates.setFieldError('overall', "Must be logged in");
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
        showAddRemoveServices: function() {
            return AccountsTemplates.getConfig('showAddRemoveServices');
        },
        stateIs: function(state) {
            return AccountsTemplates.getState() === state;
        },
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
            if (name === 'login')
                return true;
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
            return Accounts.oauth.serviceNames();
        },
        otherLoginServices: function() {
            if (typeof Accounts._loginButtonsSession !== "undefined")
                return Accounts.oauth && Accounts.oauth.serviceNames().length > 0;
            else
                return Accounts.loginServiceConfiguration.find().count();
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
        showForgotPassword: function() {
            return AccountsTemplates.ready() && AccountsTemplates.emailConfigured && AccountsTemplates.getState() !== 'fpwd';
        },
        signedInAs: function() {
            if (Meteor.user().username) {
                return Meteor.user().username;
            } else if (Meteor.user().profile.name) {
                return Meteor.user().profile.name;
            } else if (Meteor.user().emails && Meteor.user().emails[0]) {
                return Meteor.user().emails[0].address;
            } else {
                return "Signed In";
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
            var classStr = 'fa fa-';
            classStr += this.toString();
            if (this[0] === 'g' && this[1] === 'o')
                classStr += '-plus';
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

    var validateField = function(event) {
        // Client-side only validation
        var currTarg = event.currentTarget;
        var value = currTarg.value;
        var fieldName = currTarg.id.slice(9); // Skips 'AT_field_'
        if (AccountsTemplates.getConfig('continuousValidation'))
            AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));
        else
            AccountsTemplates.setFieldError(fieldName, false);
    };

    AT.prototype.signinFormEvents = {
        'click #at-fpwd': function(event) {
            event.preventDefault();
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
            if (AccountsTemplates.isDisabled())
                return;
            // Sign Up
            if (AccountsTemplates.getState() === 'sgup') {
                AccountsTemplates.setDisabled(true);
                var sgupInfo = {};
                var fields = AccountsTemplates.getFieldsNames();
                _.map(fields, function(fieldName){
                    sgupInfo[fieldName] = t.find('#AT_field_' + fieldName).value;
                })
                /*
                var i = fields.length;
                while (i--) {
                    var fieldName = fields[i];
                    sgupInfo[fieldName] = t.find('#AT_field_' + fieldName).value;
                }
                */
                return Meteor.call('ATSignup', sgupInfo, function(error, result) {
                    AccountsTemplates.setDisabled(false);
                    if (error) {
                        // If error.details is an object, we may try to set fields errors from it
                        if(typeof(error.details) === 'object'){
                            var fieldErrors = error.details;
                            for (var fieldName in fieldErrors)
                                AccountsTemplates.setFieldError(fieldName, fieldErrors[fieldName]);
                        }
                        
                        AccountsTemplates.setFieldError('overall', error.reason);
                    } else {
                        // FIXME: deal with verification email
                        AccountsTemplates.setFieldError('overall', false);
                        Meteor.loginWithPassword(sgupInfo.login, sgupInfo.password);

                        var previousPath = AccountsTemplates.getPrevPath();
                        if (previousPath)
                            return Router.go(previousPath);
                        //var postSignInRoute = AccountsTemplates.getConfig('postSignInRoute');
                        //if (postSignInRoute)
                        //    return Router.go(postSignInRoute);
                    }
                });
            }
            var login;
            // Sign In
            if (AccountsTemplates.getState() === 'sgin') {
                login = t.find('#AT_field_login').value;
                var pwd = t.find('#AT_field_password').value;
                return Meteor.loginWithPassword(login, pwd, function(error) {
                    AccountsTemplates.setDisabled(false);
                    if (error) {
                        AccountsTemplates.setFieldError('overall', error.reason);
                    } else {
                        AccountsTemplates.setFieldError('overall', false);
                        var previousPath = AccountsTemplates.getPrevPath();
                        if (previousPath)
                            return Router.go(previousPath);
                    }
                });
            }
            // Forgot Password
            if (AccountsTemplates.getState() === 'fpwd') {
                login = t.find('#AT_field_login').value;
                AccountsTemplates.setDisabled(true);
                return Meteor.call('ATValidateField', 'login', login, function(error, result) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    AccountsTemplates.setFieldError('login', result);
                    if (!result) // All Ok
                        return Accounts.forgotPassword({
                            email: login
                        }, function(error) {
                            AccountsTemplates.setDisabled(false);
                            if (error) {
                                console.log(error.reason);
                                AccountsTemplates.setFieldError('overall', error.reason);
                                AccountsTemplates.setFieldError('result', false);
                            } else {
                                AccountsTemplates.setFieldError('overall', false);
                                AccountsTemplates.setFieldError('result', 'emailSent');
                                t.find('#AT_field_login').value = '';
                            }
                        });
                    else
                        AccountsTemplates.setDisabled(false);
                });
            }
        },
        'click #at-btn-logout': function(event) {
            event.preventDefault();
            if (AccountsTemplates.isDisabled())
                return;
            AccountsTemplates.clearFieldErrors();
            Meteor.logout();
        }
    };

    AT.prototype.atInputEvents = {
        'keyup input': validateField,
        'focusout input': validateField,
    };

    AT.prototype.atResetPasswordEvents = {
        'submit #at-form-pwd': function(event, t) {
            event.preventDefault();
            event.stopPropagation();
            $("#at-btn").blur();

            if (AccountsTemplates.isDisabled())
                return;
            var resetToken = AccountsTemplates.resetToken;
            var password = t.find('#AT_field_password').value;
            check(resetToken, String);
            check(password, String);
            return Meteor.call('ATValidateField', 'password', password, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                }
                AccountsTemplates.setFieldError('password', result);
                if (!result) // All Ok
                    return Accounts.resetPassword(resetToken, password, function(error) {
                        if (error) {
                            console.log(error.reason);
                            AccountsTemplates.setFieldError('overall', error.reason);
                        } else {
                            AccountsTemplates.setFieldError('overall', false);
                            var nextPath = AccountsTemplates.getConfig('postSignUpRoutePath') || AccountsTemplates.getConfig('homeRoutePath');
                            if (nextPath)
                                return Router.go(nextPath);
                        }
                    });
            });
        },
    };

    AT.prototype.atSocialEvents = {
        'click button': function(event, t) {
            event.preventDefault();
            event.stopPropagation();
            var button = t.find('button');
            button.blur();
            if (AccountsTemplates.isDisabled())
                return;

            var user = Meteor.user();
            if (user && user.services && user.services[this.toString()]){
                var numServices = _.keys(user.services).length; // including 'resume'
                if (numServices === 2)
                    return;
                else
                    Meteor.call('ATRemoveService', this.toString());
            } else {
                AccountsTemplates.setDisabled(true);
                var serviceName = button.id.split('-')[1];
                var loginWithService = Meteor["loginWith" + capitalize(serviceName)];
                var callback = function(err, melddUsers) {
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
                };
                options = {};
                if (Accounts.ui) {
                    if (Accounts.ui._options.requestPermissions[serviceName]) {
                        options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
                    }
                    if (Accounts.ui._options.requestOfflineToken[serviceName]) {
                        options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
                    }
                }
                loginWithService(options, callback);
            }
        },
    };
}


AccountsTemplates = new AT();


if (Meteor.isServer) {

    /*
    Accounts.validateNewUser(function(user){
        console.log('Validating new User!!!');
        console.dir(user);

        if (user.services.password){
            
        }
        return true;
    });
    */

    Accounts.urls.resetPassword = function(token){
        return Meteor.absoluteUrl('reset-password/' + token);
    };
    Accounts.urls.enrollAccount = function(token){
        return Meteor.absoluteUrl('enroll-account/' + token);
    };
}

if (Meteor.isClient) {
    // Stores previous path on path change...
    Router.onStop(function() {
        AccountsTemplates.clearFieldErrors();
        AccountsTemplates.setPrevPath(this.path);
    });

    // FIXME: try to do this only if email is configured
    //        at the moment the problem is calling the method ATEmailConfigured to discover
    //        to set it up or not. The delay introduced by the method call seems to cause 
    //        route set-up to be late: whe the link on the email is clicked and the page loaded
    //        there is no /reset-password route and we get a 404! 
    Router.map(function() {
        this.route('atResetPassword', {
            path: 'reset-password/:resetToken',
            template: 'fullPageResetPassword',
            onBeforeAction: function(){
                AccountsTemplates.setState('rpwd');
            },
            onRun: function() {
                AccountsTemplates.resetToken = this.params.resetToken;
            },
            onStop: function() {
                AccountsTemplates.resetToken = '';
            }
        });
    });

    Router.map(function() {
        this.route('atEnrollAccount', {
            path: 'enroll-account/:resetToken',
            template: 'fullPageResetPassword',
            onBeforeAction: function(){
                AccountsTemplates.setState('enro');
            },
            onRun: function() {
                AccountsTemplates.resetToken = this.params.resetToken;
            },
            onStop: function() {
                AccountsTemplates.resetToken = '';
            }
        });
    });


    Meteor.startup(function(){
        Router.map(function() {
            // Possibly sets up sign in route
            var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
            if (signInRoutePath){
                this.route( AccountsTemplates.getConfig('signInRouteName') || 'signIn', {
                    path: signInRoutePath,
                    template: AccountsTemplates.getConfig('signInRouteTemplate') || 'fullPageSigninForm',
                    onBeforeAction: function() {
                        AccountsTemplates.setState('sgin');
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
            }

            // Possibly sets up sign in route
            var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
            if (signUpRoutePath){
                this.route( AccountsTemplates.getConfig('signUpRouteName') || 'signUp', {
                    path: signUpRoutePath,
                    template: AccountsTemplates.getConfig('signUpRouteTemplate') || 'fullPageSigninForm',
                    onBeforeAction: function() {
                        AccountsTemplates.setState('sgup');
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
            }

            // Possibly sets up forgot password route
            var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
            if (forgotPwdRoutePath){
                this.route( AccountsTemplates.getConfig('forgotPwdRouteName') || 'forgotPwd', {
                    path: forgotPwdRoutePath,
                    template: AccountsTemplates.getConfig('forgotPwdRouteTemplate') || 'fullPageSigninForm',
                    onBeforeAction: function() {
                        AccountsTemplates.setState('fpwd');
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
            }
        });
    });
}
