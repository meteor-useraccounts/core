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

AT.prototype._loginType = "";

// Previous path used for redirect after form submit
AT.prototype._prevPath = null;

// Flag telling whether the whole form should appear disabled
AT.prototype._disabled = false;

// Flag used to avoid redirecting to previous route when signing in/up
// as a results of a call to ensureSignedIn
AT.prototype.avoidRedirect = false;

AT.prototype.texts = {
    button: {
        changePwd: "updateYourPassword",
        enrollAccount: "createAccount",
        forgotPwd: "emailResetLink",
        resetPwd: "setPassword",
        signIn: "signIn",
        signUp: "signUp",
    },
    errors: {
        mustBeLoggedIn: "error.accounts.Must be logged in",
        pwdMismatch: "error.pwdsDontMatch",
    },
    info: {
        emailSent: "info.emailSent",
        pwdChanged: "info.passwordChanged",
        pwdReset: "info.passwordReset",
        pwdSet: "Password Set",
        singUpVerifyEmail: "Registration Successful! Please check your email and follow the instructions.",
    },
    optionalField: "optional",
    pwdLink_pre: "",
    pwdLink_link: "forgotPassword",
    pwdLink_suff: "",
    sep: "OR",
    signInLink_pre: "ifYouAlreadyHaveAnAccount",
    signInLink_link: "signin",
    signInLink_suff: "",
    signUpLink_pre: "dontHaveAnAccount",
    signUpLink_link: "signUp",
    signUpLink_suff: "",
    socialAdd: "add",
    socialConfigure: "configure",
    socialRemove: "remove",
    socialSignIn: "signIn",
    socialSignUp: "signUp",
    socialWith: "with",
    termsPreamble: "clickAgree",
    termsPrivacy: "privacyPolicy",
    termsAnd: "and",
    termsTerms: "terms",
    title: {
        changePwd: "changePassword",
        enrollAccount: "createAccount",
        forgotPwd: "resetYourPassword",
        resetPwd: "resetYourPassword",
        signIn: "signIn",
        signUp: "createAccount",
    },
};

// Known routes used to filter out previous path for redirects...
AT.prototype.knownRoutes = [];

// Token provided for routes like reset-password and enroll-account
AT.prototype.paramToken = null;

// Current Internal (client-side) State (to be among allowed ones, see STATES)
//AT.prototype.state = "signIn";

// State validation
AT.prototype._isValidState = function(value) {
    return _.contains(this.STATES, value);
};

AT.prototype.loginType = function () {
    return this._loginType;
};

// Getter for previous route"s path
AT.prototype.getPrevPath = function() {
    return this._prevPath;
};

// Setter for previous route"s path
AT.prototype.setPrevPath = function(newPath) {
    check(newPath, String);
    this._prevPath = newPath;
};

// Getter for current state
AT.prototype.getState = function() {
    return this.state.form.get("state");
};

// Handy function to compute Hash for passwords
AT.prototype.hashPassword = function (password) {
  return {
    digest: SHA256(password),
    algorithm: "sha-256"
  };
};

// Getter for disabled state
AT.prototype.disabled = function() {
    return this.state.form.equals("disabled", true) ? "disabled" : undefined;
};

// Setter for disabled state
AT.prototype.setDisabled = function(value) {
    check(value, Boolean);
    return this.state.form.set("disabled", value);
};

// Setter for current state
AT.prototype.setState = function(state, callback) {
    check(state, String);
    if (!this._isValidState(state))
        throw new Meteor.Error(500, "Internal server error", "accounts-templates-core package got an invalid state value!");
    this.state.form.set("state", state);
    this.clearState();
    if (_.isFunction(callback))
        callback();
};

AT.prototype.clearState = function() {
    var fieldIds = this.getFieldIds();
    var fields = this.state.fields;
    _.each(fieldIds, function(fieldId){
        fields.set(fieldId, null);
    });
    var form = this.state.form;
    form.set("error", null);
    form.set("result", null);
};

AT.prototype.ensureSignedIn = function() {
    if (!Meteor.user()) {
        AccountsTemplates.setPrevPath(Router.current().route._path);
        AccountsTemplates.setState(AccountsTemplates.options.defaultState, function(){
            var err = T9n.get(AccountsTemplates.texts.errors.mustBeLoggedIn, markIfMissing=false);
            AccountsTemplates.state.form.set("error", [err]);
        });
        AccountsTemplates.avoidRedirect = true;
        // render the login template but keep the url in the browser the same
        var signInRouteTemplate = AccountsTemplates.routes.signIn && AccountsTemplates.routes.signIn.template;
        this.render(signInRouteTemplate || "fullPageAtForm");
        this.renderRegions();
    } else {
        this.next();
    }
};

// Initialization
AT.prototype.init = function() {
    if (this._initialized)
        return;

    var fieldIds = this.getFieldIds();
    var fieldId;

    var usernamePresent = this.hasField("username");
    var emailPresent = this.hasField("email");
    if (usernamePresent && emailPresent){
        this._loginType = "username_and_email";
    }
    else{
        if (usernamePresent)
            this._loginType = "username";
        else
            this._loginType = "email";
    }

    if (this._loginType === "username_and_email"){
        // Possibly adds the field username_and_email in case
        // it was not configured
        if (!this.hasField("username_and_email"))
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
    if (!this.hasField("new_password")){
        var newPassword = _.clone(this.getField("password"));
        newPassword._id = "new_password";
        newPassword.displayName = "newPassword";
        newPassword.placeholder = "newPassword";
        this.addField(newPassword);
    }

    // Only in case password confirmation is required
    if (this.options.confirmPassword){
        // Possibly adds the field password_again in case
        // it was not configured
        if (!this.hasField("password_again")){
            var pwdAgain = _.clone(this.getField("password"));
            pwdAgain._id = "password_again";
            pwdAgain.displayName = "passwordAgain";
            pwdAgain.placeholder = "passwordAgain";
            this.addField(pwdAgain);
        }

        // Possibly adds the field new_password_again in case
        // it was not configured
        if (!this.hasField("new_password_again")){
            var newPasswordAgain = _.clone(this.getField("new_password"));
            newPasswordAgain._id = "new_password_again";
            newPasswordAgain.displayName = "newPasswordAgain";
            newPasswordAgain.placeholder = "newPasswordAgain";
            this.addField(newPasswordAgain);
        }
    }
    else{
        if (this.hasField("password_again"))
            throw new Error("AccountsTemplates: a field password_again was added but confirmPassword is set to false!");
        if (this.hasField("new_password_again"))
            throw new Error("AccountsTemplates: a field new_password_again was added but confirmPassword is set to false!");
    }

    // Possibly adds the field current_password in case
    // it was not configured
    if (this.options.enablePasswordChange){
        if (!this.hasField("current_password"))
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
            case "current_password":
                field.visible = ["changePwd"];
                break;
            case "email":
                field.visible = ["forgotPwd", "signUp"];
                if (AccountsTemplates.loginType() === "email")
                    field.visible.push("signIn");
                break;
            case "new_password":
                field.visible = ["changePwd", "resetPwd"];
                break;
            case "new_password_again":
                field.visible = ["changePwd", "resetPwd"];
                break;
            case "password":
                field.visible = ["enrollAccount", "signIn", "signUp"];
                break;
            case "password_again":
                field.visible = ["enrollAccount", "signUp"];
                break;
            case "username":
                field.visible = ["signUp"];
                if (AccountsTemplates.loginType() === "username")
                    field.visible.push("signIn");
                break;
            case "username_and_email":
                field.visible = [];
                if (AccountsTemplates.loginType() === "username_and_email")
                    field.visible.push("signIn");
                break;
            default:
                field.visible = ["signUp"];
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

    // Initializes reactive states
    fields = new ReactiveDict();
    _.each(this.getFieldIds(), function(fieldId){
        fields.set(fieldId, null);
    });
    form = new ReactiveDict();
    form.set("disabled", false);
    form.set("state", "signIn");
    form.set("result", null);
    form.set("error", null);
    this.state = {
        fields: fields,
        form: form,
    };

    // Possibly subscribes to extended user data (to get the list of registered services...)
    if (this.options.showAddRemoveServices){
        Meteor.subscribe("userRegisteredServices");
    }

    // ------------
    // Routing Stuff
    // ------------

    // Known routes are used to filter out previous path for redirects...
    this.knownRoutes = _.pluck(_.values(this.routes), "path");

    // Stores previous path on path change...
    Router.onStop(function() {
        Tracker.nonreactive(function () {
            var currentPath = Router.current().url;
            if (!_.contains(AccountsTemplates.knownRoutes, currentPath))
                AccountsTemplates.setPrevPath(currentPath);
            AccountsTemplates.avoidRedirect = false;
        });
    });

    // Sets up configured routes
    AccountsTemplates.setupRoutes();

    // Marks AccountsTemplates as initialized
    this._initialized = true;
};

AT.prototype.linkClick = function(route){
    if (AccountsTemplates.disabled())
        return;
    if (AccountsTemplates.avoidRedirect || AccountsTemplates.getRoutePath(route) === "#")
        AccountsTemplates.setState(route);
    else
        Meteor.defer(function(){
            Router.go(AccountsTemplates.getRouteName(route));
        });
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
                AccountsTemplates.state.fields.set(fieldId, error);
            });
        else{
            var err = error.reason ? "error.accounts." + error.reason : "error.accounts.Unknown error";
            AccountsTemplates.state.form.set("error", [err]);
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
