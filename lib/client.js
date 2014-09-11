// Allowed Internal (client-side) States
AT.prototype.STATES = [
    "changePwd", // Change Password
    "enrollAccount", // Account Enrollment
    "forgotPwd", // Forgot Password
    "hide", // Nothing displayed
    "resetPwd", // Reset Password
    "signIn", // Sign In
    "signUp", // Sign Up
    "verifyEmail", // Email verification
];

AT.prototype.FIELD_ORDER = [
    "username_and_email",
    "username",
    "email",
    "password",
    "password_again",
    "current_password",
    "new_password",
    "new_password_again",
];

// Reactivity Stuff
AT.prototype._deps = {};

AT.prototype._loginType = '';

// Previous path used for redirect after form submit
AT.prototype._prevPath = '/';

// Flag telling whether the whole form should appear disabled
AT.prototype._disabled = false;

// Flag used to avoid redirecting to previous route when signing in/up
// as a results of a call to ensureSignedIn
AT.prototype.avoidRedirect = false;

AT.prototype.buttonText = {
    changePwd: 'updateYourPassword',
    enrollAccount: 'createAccount',
    forgotPwd: 'emailResetLink',
    resetPwd: 'setPassword',
    signIn: 'signIn',
    signUp: 'signUp',
};

// Current Errors (to be among allowed ones, see STATES)
AT.prototype.errors = {};

// Known routes used to filter out previous path for redirects...
AT.prototype.knownRoutes = [];

// Token provided for routes like reset-password and enroll-account
AT.prototype.paramToken = null;

// Current Internal (client-side) State (to be among allowed ones, see STATES)
AT.prototype.state = "signIn";

AT.prototype.title = {
    changePwd: 'changePassword',
    enrollAccount: 'createAccount',
    forgotPwd: 'resetYourPassword',
    resetPwd: 'resetYourPassword',
    signIn: 'signIn',
    signUp: 'createAccount',
};

// State validation
AT.prototype._isValidState = function(value) {
    return _.contains(this.STATES, value);
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

// Handy function to compute Hash for passwords
AT.prototype.hashPassword = function (password) {
  return {
    digest: SHA256(password),
    algorithm: "sha-256"
  };
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

// Getter for current error of field *field_id*
AT.prototype.getFieldError = function(field_id) {
    check(field_id, String);
    this._deps.errors[field_id].depend();
    return this.errors[field_id];
};

// Setter for current error of field *field_id*
AT.prototype.setFieldError = function(field_id, error_text) {
    check(field_id, String);
    if (error_text === this.errors[field_id])
        return;
    this.errors[field_id] = error_text;
    return this._deps.errors[field_id].changed();
};

AT.prototype.clearFieldErrors = function() {
    var fieldIds = this.getFieldIds();
    var errors = this.errors;
    var deps_errors = this._deps.errors;
    _.map(fieldIds, function(fieldId){
        if (errors[fieldId] !== null) {
            errors[fieldId] = null;
            deps_errors[fieldId].changed();
        }
    });
    if (errors.overall !== null){
        errors.overall = null;
        deps_errors.overall.changed();
    }
    if (errors.result !== null){
        errors.result = null;
        deps_errors.result.changed();
    }
};

AT.prototype.ensureSignedIn = function(pause) {
    if (!Meteor.user()) {
        if (Meteor.loggingIn())
            return pause();
        AccountsTemplates.setPrevPath(this.path);
        AccountsTemplates.setState('signIn');
        var err = T9n.get("error.accounts.Must be logged in");
        AccountsTemplates.setFieldError('overall', [err]);
        AccountsTemplates.avoidRedirect = true;
        // render the login template but keep the url in the browser the same
        var signInRouteTemplate = AccountsTemplates.options.signInRouteTemplate;
        this.render(signInRouteTemplate || 'fullPageAtForm');
        this.renderRegions();
        // pause the rest of the before hooks and the action function
        return pause();
    }
};

// Initialization
AT.prototype.init = function() {
    if (this._initialized)
        return;

    // Checks there is at least one account service installed
    if (!Package['accounts-password'] && !(oauthServices().length))
        throw Error("AccountsTemplates: You must add at least one account service!");

    var fieldIds = this.getFieldIds();
    var fieldId;

    var usernamePresent = this.hasField('username');
    var emailPresent = this.hasField('email');
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
        if (!this.hasField('username_and_email'))
            this.addField({
                _id: "username_and_email",
                type: "text",
                displayName: "usernameOrEmail",
                placeholder: "usernameOrEmail",
                required: true,
            });
    }

    // Possibly adds the field new_password in case
    // it was not configured
    if (!this.hasField('new_password')){
        var newPassword = _.clone(this.getField('password'));
        newPassword._id = 'new_password';
        newPassword.displayName = "newPassword";
        newPassword.placeholder = "newPassword";
        this.addField(newPassword);
    }

    // Only in case password confirmation is required
    if (this.options.confirmPassword){
        // Possibly adds the field password_again in case
        // it was not configured
        if (!this.hasField('password_again')){
            var pwdAgain = _.clone(this.getField('password'));
            pwdAgain._id = 'password_again';
            pwdAgain.displayName = "passwordAgain";
            pwdAgain.placeholder = "passwordAgain";
            this.addField(pwdAgain);
        }

        // Possibly adds the field new_password_again in case
        // it was not configured
        if (!this.hasField('new_password_again')){
            var newPasswordAgain = _.clone(this.getField('new_password'));
            newPasswordAgain._id = 'new_password_again';
            newPasswordAgain.displayName = "newPasswordAgain";
            newPasswordAgain.placeholder = "newPasswordAgain";
            this.addField(newPasswordAgain);
        }
    }
    else{
        if (this.hasField('password_again'))
            throw new Error("AccountsTemplates: a field password_again was added but confirmPassword is set to false!");
        if (this.hasField('new_password_again'))
            throw new Error("AccountsTemplates: a field new_password_again was added but confirmPassword is set to false!");
    }

    // Possibly adds the field current_password in case
    // it was not configured
    if (this.options.enablePasswordChange){
        if (!this.hasField('current_password'))
            this.addField({
                _id: "current_password",
                type: "password",
                displayName: "currentPassword",
                placeholder: "currentPassword",
                required: true,
            });
    }

    // Sorts fields to get them in correct order
    var sortedFields = [];
    _.map(this.FIELD_ORDER, function(fieldId){
        var field = this.getField(fieldId);
        if (field)
            sortedFields.push(field);
    }, this);
    _.map(this.getFields(), function(field){
        if (!_.contains(this.FIELD_ORDER, field._id))
            sortedFields.push(field);
    }, this);
    this._fields = _.map(sortedFields, function(field){
        return new Field(field);
    });

    // Sets visibility condition and validation flags for each field
    var gPositiveValidation = !!AccountsTemplates.options.positiveValidation;
    var gNegativeValidation = !!AccountsTemplates.options.negativeValidation;
    var gContinuousValidation = !!AccountsTemplates.options.continuousValidation;
    var gNegativeFeedback = !!AccountsTemplates.options.negativeFeedback;
    var gPositiveFeedback = !!AccountsTemplates.options.positiveFeedback;
    _.each(this._fields, function(field){
        // Visibility
        switch(field._id) {
            case 'current_password':
                field.visible = ['changePwd'];
                break;
            case 'email':
                field.visible = ['forgotPwd', 'signUp'];
                if (AccountsTemplates.loginType() === 'email')
                    field.visible.push('signIn');
                break;
            case 'new_password':
                field.visible = ['changePwd', 'resetPwd'];
                break;
            case 'new_password_again':
                field.visible = ['changePwd', 'resetPwd'];
                break;
            case 'password':
                field.visible = ['enrollAccount', 'signIn', 'signUp'];
                break;
            case 'password_again':
                field.visible = ['enrollAccount', 'signUp'];
                break;
            case 'username':
                field.visible = ['signUp'];
                if (AccountsTemplates.loginType() === 'username')
                    field.visible.push('signIn');
                break;
            case 'username_and_email':
                field.visible = [];
                if (AccountsTemplates.loginType() === 'username_and_email')
                    field.visible.push('signIn');
                break;
            default:
                field.visible = ['signUp'];
        }

        // Validation
        var positiveValidation = field.positiveValidation;
        if (positiveValidation === undefined)
            field.positiveValidation = gPositiveValidation;
        var negativeValidation = field.negativeValidation;
        if (negativeValidation === undefined)
            field.negativeValidation = gNegativeValidation;
        field.validation = field.positiveValidation || field.negativeValidation;
        if (field.continuousValidation === undefined)
            field.continuousValidation = gContinuousValidation;
        field.continuousValidation = field.validation && field.continuousValidation;
        if (field.negativeFeedback === undefined)
            field.negativeFeedback = gNegativeFeedback;
        if (field.positiveFeedback === undefined)
            field.positiveFeedback = gPositiveFeedback;
        field.feedback = field.negativeFeedback || field.positiveFeedback;
    });

    // Initializes fields' errors dependencies
    _.map(this.getFieldIds(), function(fieldId){
        this._deps.errors[fieldId] = new Deps.Dependency();
        this.errors[fieldId] = null;
    }, this);

    // Possibly subscribes to extended user data (to get the list of registered services...)
    if (this.options.showAddRemoveServices){
        Meteor.subscribe('userRegisteredServices');
    }

    // ------------
    // Routing Stuff
    // ------------

    // Known routes are used to filter out previous path for redirects...
    this.knownRoutes = _.pluck(_.values(this.routes), 'path');

    // Stores previous path on path change...
    Router.onStop(function() {
        if (!_.contains(AccountsTemplates.knownRoutes, this.path))
            AccountsTemplates.setPrevPath(this.path);
    });

    // Sets up configured routes
    AccountsTemplates.setupRoutes();

    // Marks AccountsTemplates as initialized
    this._initialized = true;
};

AT.prototype.linkClick = function(route){
    if (AccountsTemplates.isDisabled())
        return;
    if (AccountsTemplates.avoidRedirect || AccountsTemplates.getRoutePath(route) === '#')
        AccountsTemplates.setState(route);
    else
        Router.go(AccountsTemplates.getRouteName(route));
};


AT.prototype.postSubmitRedirect = function(route){
    if (AccountsTemplates.avoidRedirect)
        AccountsTemplates.avoidRedirect = false;
    else{
        var nextPath = AccountsTemplates.routes[route] && AccountsTemplates.routes[route].redirect;
        if (nextPath){
            if (_.isFunction(nextPath))
                nextPath();
            else
                Router.go(nextPath);
        }else{
            var previousPath = AccountsTemplates.getPrevPath();
            if (previousPath)
                Router.go(previousPath);
            else{
                var homeRoutePath = AccountsTemplates.options.homeRoutePath;
                if (homeRoutePath)
                    Router.go(homeRoutePath);
            }
        }
    }
};

AT.prototype.submitCallback = function(error, state, onSuccess){
    if (error) {
        if(_.isObject(error.details))
            // If error.details is an object, we may try to set fields errors from it
            _.each(error.details, function(error, fieldId){
                AccountsTemplates.setFieldError(fieldId, error);
            });
        else{
            var err = error.reason ? 'error.accounts.' + error.reason : "error.accounts.Unknown error";
            AccountsTemplates.setFieldError('overall', [err]);
        }
    }
    else{
        if (onSuccess)
        onSuccess();
        if (_.contains(["enrollAccount", "forgotPwd", "resetPwd", "verifyEmail"], state)){
            var redirectTimeout = AccountsTemplates.options.redirectTimeout;
            if (redirectTimeout > 0)
                Meteor.setTimeout(function(){AccountsTemplates.postSubmitRedirect(state);}, redirectTimeout);
        }
        else if (state)
            AccountsTemplates.postSubmitRedirect(state);
    }
    AccountsTemplates.setDisabled(false);
};

AccountsTemplates = new AT();
