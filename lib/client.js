// Allowed Internal (client-side) States
AT.prototype.STATES = [
    "cpwd", // Change Password
    "enro", // Account Enrollment
    "fpwd", // Forgot Password
    "hide", // Nothing displayed
    "rpwd", // Reset Password
    "sgin", // Sign In
    "sgup", // Sign Up
];

// Reactivity Stuff
AT.prototype._deps = {};

AT.prototype._loginType = '';

AT.prototype._prevPath = '/';

AT.prototype._disabled = false;

// Flag used to avoid redirecting to previous route when signing in/up
// as a results of a call to ensureSignedIn
AT.prototype.avoidRedirect = false;

// Current Errors (to be among allowed ones, see STATES)
AT.prototype.errors = {};

AT.prototype.knownRoutes = [];

AT.prototype.paramToken = '';

// Current Internal (client-side) State (to be among allowed ones, see STATES)
AT.prototype.state = "sgin";

// State validation
AT.prototype._isValidState = function(value) {
    var user = Meteor.user();
    if (user && _.contains(['enro', 'fpwd', 'rpwd', 'sgup'], value))
        return false;
    if (value === "cpwd" && (!user || !this.getConfig('enablePasswordChange')))
        return false;
    if (value === "sgup" && this.getConfig('forbidClientAccountCreation'))
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

// Initialization
AT.prototype.init = function() {
    if (this._initialized)
        return;

    var field_names = this.getFieldsNames();

    // TODO: XXX fix it to became 'username', 'email', 'username_and_email'
    var usernamePresent = _.contains(field_names, 'username');
    var emailPresent = _.contains(field_names, 'email');
    if (usernamePresent && emailPresent){
        this._loginType = 'username_and_email';
    }
    else{
        if (usernamePresent)
            this._loginType = 'username';
        else
            this._loginType = 'email';
    }

    if (this._loginType === 'username_and_email'){
        // Possibly adds the field username_and_email in case
        // it was not configured
        if (!_.contains(field_names, 'username_and_email')){
            this._fields.splice(0, 0, {
                name: "username_and_email",
                type: "text",
                displayName: "usernameOrEmail",
                required: true,
            });
        }
    }
    // Possibly updates field names after automatic field insertions
    field_names = this.getFieldsNames();

    // Possibly adds the field password_again in case
    // it was not configured
    var pwdAgainPresent = _.contains(field_names, 'password_again');
    if (this.getConfig('confirmPassword')){
        if (!pwdAgainPresent){
            var pwdId = _.indexOf(field_names, 'password');
            var pwdAgain = _.clone(this._fields[pwdId]);
            pwdAgain.name = 'password_again';
            pwdAgain.displayName = "passwordAgain";
            this._fields.splice(pwdId+1, 0, pwdAgain);
        }
    }
    else{
        if (pwdAgainPresent)
            throw new Error("AccountsTemplates field password_again cannot be used when confirmPassword is False!");
    }
    // Possibly updates field names after automatic field insertions
    field_names = this.getFieldsNames();

    // Possibly adds the field new_password_again in case
    // it was not configured
    var newPasswordAgainPresent = _.contains(field_names, 'new_password_again');
    if (this.getConfig('enablePasswordChange')){
        if (!newPasswordAgainPresent){
            var pwdId = _.indexOf(field_names, 'password');
            var newPasswordAgain = _.clone(this._fields[pwdId]);
            newPasswordAgain.name = 'new_password_again';
            newPasswordAgain.displayName = "newPasswordAgain";
            this._fields.splice(0, 0, newPasswordAgain);
        }
    }
    else{
        if (newPasswordAgainPresent)
            throw new Error("AccountsTemplates field new_password_again cannot be used when enablePasswordChange is False!");
    }
    // Possibly updates field names after automatic field insertions
    field_names = this.getFieldsNames();
    // Possibly adds the field new_password in case
    // it was not configured
    var newPasswordPresent = _.contains(field_names, 'new_password');
    if (this.getConfig('enablePasswordChange')){
        if (!newPasswordPresent){
            var pwdId = _.indexOf(field_names, 'password');
            var newPassword = _.clone(this._fields[pwdId]);
            newPassword.name = 'new_password';
            newPassword.displayName = "newPassword";
            this._fields.splice(0, 0, newPassword);
        }
    }
    else{
        if (newPasswordPresent)
            throw new Error("AccountsTemplates field new_password cannot be used when enablePasswordChange is False!");
    }
    // Possibly updates field names after automatic field insertions
    field_names = this.getFieldsNames();

    // Possibly adds the field current_password in case
    // it was not configured
    var currentPwdPresent = _.contains(field_names, 'current_password');
    if (this.getConfig('enablePasswordChange')){
        if (!currentPwdPresent){
            this._fields.splice(0, 0, {
                name: "current_password",
                type: "password",
                displayName: "currentPassword",
                required: true,
            });
        }
    }
    else{
        if (currentPwdPresent)
            throw new Error("AccountsTemplates field current_password cannot be used when enablePasswordChange is False!");
    }
    // Possibly updates field names after automatic field insertions
    field_names = this.getFieldsNames();

    // Sets visibility condition for each field
    _.each(this._fields, function(field){
        switch(field.name) {
            case 'current_password':
                field.visible = ['cpwd'];
                break;
            case 'email':
                field.visible = ['fpwd', 'sgup'];
                if (AccountsTemplates.loginType() === 'email')
                    field.visible.push('sgin');
                break;
            case 'new_password':
                field.visible = ['cpwd', 'rpwd'];
                break;
            case 'new_password_again':
                field.visible = ['cpwd', 'rpwd'];
                break;
            case 'password':
                field.visible = ['enro', 'sgin', 'sgup'];
                break;
            case 'password_again':
                field.visible = ['enro', 'sgup'];
                break;
            case 'username':
                field.visible = ['sgup'];
                if (AccountsTemplates.loginType() === 'username')
                    field.visible.push('sgin');
                break;
            case 'username_and_email':
                field.visible = [];
                if (AccountsTemplates.loginType() === 'username_and_email')
                    field.visible.push('sgin');
                break;
            default:
                field.visible = ['sgup'];
        }
    });


    // Initializes fields' errors dependencies
    _.map(field_names, function(fieldName){
        this._deps.errors[fieldName] = new Deps.Dependency();
        this.errors[fieldName] = false;
    }, this);

    // Possibly subscribes to extended user data (to get the list of registered services...)
    if (this.getConfig('showAddRemoveServices')){
        Meteor.subscribe('userRegisteredServices');
    }

    // ------------
    // Routing Stuff
    // ------------
    this.knownRoutes = [
        AccountsTemplates.getConfig('changePwdRoutePath'),
        AccountsTemplates.getConfig('forgotPwdRoutePath'),
        AccountsTemplates.getConfig('homeRoutePath'),
        AccountsTemplates.getConfig('signInRoutePath'),
        AccountsTemplates.getConfig('signUpRoutePath'),
    ];

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

        if (AccountsTemplates.getConfig('showForgotPasswordLink')){
            var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
            if (forgotPwdRoutePath){
                this.route( AccountsTemplates.getConfig('forgotPwdRouteName') || 'atForgotPwd', {
                    path: forgotPwdRoutePath,
                    template: AccountsTemplates.getConfig('forgotPwdRouteTemplate') || 'fullPageSigninForm',
                    layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
                    onBeforeAction: function() {
                        AccountsTemplates.setState('fpwd');
                    },
                    onStop: function() {
                        AccountsTemplates.clearFieldErrors();
                    }
                });
            }
        }

        this.route(AccountsTemplates.getConfig('resetPwdRouteName') || 'atResetPwd', {
            path: (AccountsTemplates.getConfig('resetPwdRoutePath') || 'reset-password') + '/:paramToken',
            template: AccountsTemplates.getConfig('resetPwdRouteTemplate') || 'fullPageSigninForm',
            layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
            onBeforeAction: function(){
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
            template: AccountsTemplates.getConfig('enrollAccountRouteTemplate') || 'fullPageSigninForm',
            layoutTemplate: AccountsTemplates.getConfig('layoutTemplate') || Router.options.layoutTemplate,
            onBeforeAction: function(){
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

    // Marks AccountsTemplates as initialized
    this._initialized = true;
};

AccountsTemplates = new AT();
