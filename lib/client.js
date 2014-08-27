// Allowed Internal (client-side) States
AT.prototype.STATES = [
    "changePwd", // Change Password
    "enrollAccount", // Account Enrollment
    "forgotPwd", // Forgot Password
    "hide", // Nothing displayed
    "resetPwd", // Reset Password
    "signIn", // Sign In
    "signUp", // Sign Up
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

// Current Errors (to be among allowed ones, see STATES)
AT.prototype.errors = {};

// Known routes used to filter out previous path for redirects...
AT.prototype.knownRoutes = [];

// Token provided for routes like reset-password and enroll-account
AT.prototype.paramToken = null;

// Current Internal (client-side) State (to be among allowed ones, see STATES)
AT.prototype.state = "signIn";

// State validation
AT.prototype._isValidState = function(value) {
    var user = Meteor.user();
    if (user && _.contains(['enrollAccount', 'forgotPwd', 'resetPwd', 'signUp'], value))
        return false;
    if (value === "changePwd" && (!user || !this.getConfig('enablePasswordChange')))
        return false;
    if (value === "signUp" && this.getConfig('forbidClientAccountCreation'))
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
    var field_ids = this.getFieldIds();
    var errors = this.errors;
    var deps_errors = this._deps.errors;
    _.map(field_ids, function(fieldId){
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
        var signInRouteTemplate = AccountsTemplates.getConfig('signInRouteTemplate');
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
    if (!Package['accounts-password'] && !otherLoginServices())
        throw Error("AccountsTemplates: You must add at least one account service!");

    var field_ids = this.getFieldIds();

    // TODO: XXX fix it to became 'username', 'email', 'username_and_email'
    var usernamePresent = _.contains(field_ids, 'username');
    var emailPresent = _.contains(field_ids, 'email');
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
        if (!_.contains(field_ids, 'username_and_email')){
            this._fields.splice(0, 0, {
                _id: "username_and_email",
                type: "text",
                displayName: "usernameOrEmail",
                required: true,
            });
        }
    }
    // Possibly updates field ids after automatic field insertions
    field_ids = this.getFieldIds();

    // Possibly adds the field password_again in case
    // it was not configured
    var pwdId;
    var pwdAgainPresent = _.contains(field_ids, 'password_again');
    if (this.getConfig('confirmPassword')){
        if (!pwdAgainPresent){
            pwdId = _.indexOf(field_ids, 'password');
            var pwdAgain = _.clone(this._fields[pwdId]);
            pwdAgain._id = 'password_again';
            pwdAgain.displayName = "passwordAgain";
            this._fields.splice(pwdId+1, 0, pwdAgain);
        }
    }
    else{
        if (pwdAgainPresent){
            console.log("AccountsTemplates - Warning: field password_again cannot be used when confirmPassword is False!");
            this.removeField('password_again');
        }
    }
    // Possibly updates field ids after automatic field insertions
    field_ids = this.getFieldIds();

    // Possibly adds the field new_password_again in case
    // it was not configured
    var newPasswordAgainPresent = _.contains(field_ids, 'new_password_again');
    if (this.getConfig('enablePasswordChange')){
        if (!newPasswordAgainPresent){
            pwdId = _.indexOf(field_ids, 'password');
            var newPasswordAgain = _.clone(this._fields[pwdId]);
            newPasswordAgain._id = 'new_password_again';
            newPasswordAgain.displayName = "newPasswordAgain";
            this._fields.splice(0, 0, newPasswordAgain);
        }
    }
    else{
        if (newPasswordAgainPresent){
            console.log("AccountsTemplates - Warning: field new_password_again cannot be used when enablePasswordChange is False!");
            this.removeField('new_password_again');
        }
    }
    // Possibly updates field ids after automatic field insertions
    field_ids = this.getFieldIds();
    // Possibly adds the field new_password in case
    // it was not configured
    var newPasswordPresent = _.contains(field_ids, 'new_password');
    if (this.getConfig('enablePasswordChange')){
        if (!newPasswordPresent){
            pwdId = _.indexOf(field_ids, 'password');
            var newPassword = _.clone(this._fields[pwdId]);
            newPassword._id = 'new_password';
            newPassword.displayName = "newPassword";
            this._fields.splice(0, 0, newPassword);
        }
    }
    else{
        if (newPasswordPresent){
            console.log("AccountsTemplates - Warning: field new_password cannot be used when enablePasswordChange is False!");
            this.removeField('new_password');
        }
    }
    // Possibly updates field ids after automatic field insertions
    field_ids = this.getFieldIds();

    // Possibly adds the field current_password in case
    // it was not configured
    var currentPwdPresent = _.contains(field_ids, 'current_password');
    if (this.getConfig('enablePasswordChange')){
        if (!currentPwdPresent){
            this._fields.splice(0, 0, {
                _id: "current_password",
                type: "password",
                displayName: "currentPassword",
                required: true,
            });
        }
    }
    else{
        if (currentPwdPresent){
            console.log("AccountsTemplates - Warning: field current_password cannot be used when enablePasswordChange is False!");
            this.removeField('current_password');
        }
    }
    // Possibly updates field ids after automatic field insertions
    field_ids = this.getFieldIds();

    // Sets visibility condition and validation flags for each field
    var gPositiveValidation = !!AccountsTemplates.getConfig('positiveValidation');
    var gNegativeValidation = !!AccountsTemplates.getConfig('negativeValidation');
    var gContinuousValidation = !!AccountsTemplates.getConfig('continuousValidation');
    var gNegativeFeedback = !!AccountsTemplates.getConfig('negativeFeedback');
    var gPositiveFeedback = !!AccountsTemplates.getConfig('positiveFeedback');
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

        // Display Name
        if (!field.displayName)
            field.displayName = field._id;
    });

    // Initializes fields' errors dependencies
    _.map(field_ids, function(fieldId){
        this._deps.errors[fieldId] = new Deps.Dependency();
        this.errors[fieldId] = null;
    }, this);

    // Possibly subscribes to extended user data (to get the list of registered services...)
    if (this.getConfig('showAddRemoveServices')){
        Meteor.subscribe('userRegisteredServices');
    }

    // ------------
    // Routing Stuff
    // ------------

    // Known routes are used to filter out previous path for redirects...
    this.knownRoutes = _.pluck(_.values(this._routes), 'path');

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
        var nextPath = AccountsTemplates._routes[route] && AccountsTemplates._routes[route].redirect;
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
};

AccountsTemplates = new AT();
