// ---------------------------------------------------------------------------------

// ATFieldsCollection

// ---------------------------------------------------------------------------------

/*
    Each field object is represented by a document in the ATFieldsCollection collection:
        name:        String              // A unique field's name
        displayName: String              // A unique field's name
        type:        String              // Displayed input type
        maxLength:   Integer (optional)  // Possibly specifies the maximum allowed length
        minLength:   Integer (optional)  // Possibly specifies the minimum allowed length
        required:    Boolean (optional)  // Specifies Whether to fail or not when field is left empty
        re:          String  (optional)  // Regular expression for validation
*/

ATFieldsCollection = new Meteor.Collection("atFieldsCollection");


// No ATFieldsCollection.allow nor ATFieldsCollection.deny to prevent client-side modifications

// Publish all fields to the client
if (Meteor.isServer) {
    Meteor.publish('atFields', function() {
        return ATFieldsCollection.find();
    });
}


// ---------------------------------------------------------------------------------

// AccountsTemplates object

// ---------------------------------------------------------------------------------



// -------------------
// Client/Server stuff
// -------------------

// Constructor
function AT() {
    if (Meteor.isClient) {
        this._deps["state"] = new Deps.Dependency();
        this._deps.errors = {};
    }
}

// Allowed Internal (client-side) States
AT.prototype.STATES = [
    "sgin", // Sign In
    "sgup", // Sign Up
    "fpwd", // Forgot Password
    "cpwd", // Change Password
];

AT.prototype.getConfig = function(param_name) {
    return ATFieldsCollection.findOne({
        name: 'config'
    })[param_name];
};

AT.prototype.getFields = function() {
    return ATFieldsCollection.find({
        name: {
            '$ne': 'config'
        }
    }, {
        sort: {
            rowOrder: 1,
            colOrder: 1,
            name: 1
        }
    });
};

AT.prototype.getFieldsNames = function() {
    var names = [];
    var fields = ATFieldsCollection.find({}, {
        field: {
            name: 1
        }
    });
    fields.forEach(function(field) {
        if (field.name !== 'config')
            names.push(field.name);
    });
    return names;
};


// Initialization
AT.prototype.init = function() {
    if (Meteor.isServer) {
        // A password field is strictly required
        if (typeof this._fields.password === "undefined")
            throw Error("A password field is strictly required!");
        if (this._fields.password.type !== "password")
            throw Error("The type of password field should be password!");
        // Then we need at least one "username" or one "email"
        // ...having both of them is fine
        if (typeof this._fields.login === "undefined")
            throw Error("A login field is strictly required!");
        // Possibly checks 'username'
        if (this._fields.login.type !== "email" && this._fields.login.type !== "text")
            throw Error("The type of login field should be text or email!");
        // Drops the ATFieldsCollection content
        ATFieldsCollection.remove({});
        // Insert fields into ATFieldsCollection
        for (var f in this._fields)
            ATFieldsCollection.insert(this._fields[f]);
        // Insert the configuration document
        ATFieldsCollection.insert(this.CONFIG);

        // Marks AccountsTemplates as initialized
        this._initialized = true;
    }

    if (Meteor.isClient) {
        // Marks AccountsTemplates as initialized
        this._deps.ready = new Deps.Dependency();
        var self = this;
        // Subscribes the client to all fields data
        Meteor.subscribe('atFields', function() {
            // Initializes fields' errors dependencies
            var field_names = self.getFieldsNames();
            var i = field_names.length;
            while (i--) {
                self._deps.errors[field_names[i]] = new Deps.Dependency();
                self.errors[field_names[i]] = false;
            }
            self._deps.errors['overall'] = new Deps.Dependency();
            self.errors['overall'] = false;
            self._deps.errors['result'] = new Deps.Dependency();
            self.errors['result'] = false;

            self._ready = true;
            self._deps.ready.changed();
        });
    }
};

AT.prototype.validateField = function(fieldName, value) {
    check(fieldName, String);
    check(value, String);
    var field = ATFieldsCollection.findOne({
        name: fieldName
    });
    if (!field || (!field.required && value === ''))
        return;
    if (field.required && !value.length)
        return 'Required Field';
    if (field.minLength && value.length < field.minLength)
        return 'Minimum Required Length:' + field.minLength;
    if (field.maxLength && value.length > field.maxLength)
        return 'Maximum Allowed Length:' + field.maxLength;
    if (field.re && value.length && !value.match(RegExp(field.re)))
        return field.errStr;
};

// -----------------
// Server-only stuff
// -----------------

if (Meteor.isServer) {
    // Field pattern to be checked with check
    AT.prototype.CONFIG = {
        name: 'config',
        showPlaceholders: true,
        displayFormLabels: true,
        formValidationFeedback: true,
        continuousValidation: true,
    };

    // Field pattern to be checked with check
    AT.prototype.CONFIG_PAT = {
        showPlaceholders: Match.Optional(Boolean),
        displayFormLabels: Match.Optional(Boolean),
        formValidationFeedback: Match.Optional(Boolean),
        continuousValidation: Match.Optional(Boolean),
    };

    // Field pattern to be checked with check
    AT.prototype.FIELD_PAT = {
        name: String,
        displayName: String,
        type: String,
        required: Match.Optional(Boolean),
        minLength: Match.Optional(Match.Integer),
        maxLength: Match.Optional(Match.Integer),
        re: Match.Optional(String), // Regular expression for validation
        errStr: Match.Optional(String),
        rowOrder: Match.Optional(Match.Integer),
        colOrder: Match.Optional(Match.Integer),
    };

    // Allowed input types
    AT.prototype.INPUT_TYPES = [
        "password",
        "email",
        "text",
        "tel",
    ];

    // SignIn / SignUp fields
    AT.prototype._fields = {
        login: {
            name: "login",
            displayName: "Email",
            type: "email",
            required: true,
        },
        password: {
            name: "password",
            displayName: "Password",
            type: "password",
            required: true,
            minLength: 6
        }
    };

    AT.prototype._initialized = false;

    // Input type validation
    AT.prototype._isValidInputType = function(value) {
        var i = this.INPUT_TYPES.length;
        while (i--)
            if (this.INPUT_TYPES[i] === value) return true;
        return false;
    };

    AT.prototype.addField = function(field) {
        // Fields can be added only before initialization
        if (this._initialized)
            throw new Error("AccountsTemplates.addField should strictly be called before AccountsTemplates.init!");
        check(field, this.FIELD_PAT);
        // Checks there"s currently no field called field.name
        if (typeof this._fields[field.name] !== "undefined")
            throw new Error("A field called " + field.name + " already exists!");
        if (field.name === "config")
            throw new Error("\'config\' is not a valid name for a field!");
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
        this._fields[field.name] = field;
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
            var i = fields.length;
            while (i--)
                this.addField(fields[i]);
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
        this.CONFIG = _.defaults(config, this.CONFIG);
    };

    AT.prototype.removeField = function(field_name) {
        // Fields can be removed only before initialization
        if (this._initialized)
            throw new Error("AccountsTemplates.removeField should strictly be called before AccountsTemplates.init!");
        // Checks there"s currently no field called field.name
        if (typeof this._fields[field_name] === "undefined")
            throw new Error("A field called " + field_name + " does not exist!");
        delete this._fields[field_name];
        return true;
    };
}

// -----------------
// Client-only stuff
// -----------------

if (Meteor.isClient) {

    // Reactivity Stuff
    AT.prototype._deps = {};

    AT.prototype._ready = false;

    // Current Errors (to be among allowed ones, see STATES)
    AT.prototype.errors = {};

    // Current Internal (client-side) State (to be among allowed ones, see STATES)
    AT.prototype.state = "sgin";

    // State validation
    AT.prototype._isValidState = function(value) {
        var i = this.STATES.length;
        while (i--)
            if (this.STATES[i] === value) return true;
        return false;
    };

    // Getter for current state
    AT.prototype.getState = function() {
        this._deps["state"].depend();
        return this.state;
    };

    // Setter for current state
    AT.prototype.setState = function(value) {
        if (value === this.state)
            return;
        if (!this._isValidState(value))
            throw new Meteor.Error(500, "Internal server error", "accounts-templates-core package got an invalid state value!");
        this.state = value;
        this.clearFieldErrors();
        return this._deps["state"].changed();
    };

    // Getter for current error of field *field_name*
    AT.prototype.getFieldError = function(field_name) {
        this._deps.errors[field_name].depend();
        return this.errors[field_name];
    };

    // Setter for current error of field *field_name*
    AT.prototype.setFieldError = function(field_name, error_text) {
        if (error_text === this.errors[field_name])
            return;
        this.errors[field_name] = error_text;
        return this._deps.errors[field_name].changed();
    };

    AT.prototype.clearFieldErrors = function() {
        var field_names = this.getFieldsNames();
        var i = field_names.length;
        while (i--) {
            var name = field_names[i];
            if (this.errors[name]) {
                this.errors[name] = false;
                this._deps.errors[name].changed();
            }
            this.errors['overall'] = false;
            this._deps.errors['overall'].changed();
            this.errors['result'] = false;
            this._deps.errors['result'].changed();
        }
    };

    AT.prototype.ready = function() {
        this._deps.ready.depend();
        return this._ready;
    };


    var capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    AT.prototype.loginFormHelpers = {
        overallError: function() {
            if (AccountsTemplates.ready())
                return AccountsTemplates.getFieldError('overall') || '';
            return '';
        },
        result: function() {
            if (AccountsTemplates.ready())
                return AccountsTemplates.getFieldError('result') || '';
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
        displayFormLabels: function() {
            if (AccountsTemplates.ready())
                return AccountsTemplates.getConfig('displayFormLabels');
            return false;
        },
        displayName: function(){
            var name = T9n.get(this.displayName);
            if (name.substr(0, T9n.missingPrefix.length) == T9n.missingPrefix)
                return this.displayName;
            return name;
        },
        placeholder: function() {
            if (AccountsTemplates.ready() && AccountsTemplates.getConfig('showPlaceholders'))
                return this.displayName;
            return '';
        },
        fields: function() {
            if (AccountsTemplates.ready())
                return AccountsTemplates.getFields();
            return [];
        },
        buttonText: function() {
            if (AccountsTemplates.getState() === 'sgin') {
                return T9n.get('signIn');
            } else if (AccountsTemplates.getState() === 'sgup') {
                return T9n.get('signUp');
            } else if (AccountsTemplates.getState() === 'fpwd') {
                return T9n.get('emailResetLink');
            } else if (AccountsTemplates.getState() === 'cpwd') {
                return T9n.get('updateYourPassword');
            }
        },
        hasFeedback: function() {
            return AccountsTemplates.ready() && AccountsTemplates.getConfig('formValidationFeedback')
        },
        hasError: function() {
            return AccountsTemplates.ready() && AccountsTemplates.getFieldError(this.name)
        },
        showError: function() {
            return AccountsTemplates.ready() && AccountsTemplates.getFieldError(this.name)
        },
        errorText: function() {
            if (AccountsTemplates.ready())
                return AccountsTemplates.getFieldError(this.name);
        },
        atcpwd: function() {
            return AccountsTemplates.getState() === 'cpwd';
        },
        atfpwd: function() {
            return AccountsTemplates.getState() === 'fpwd';
        },
        atsgin: function() {
            return AccountsTemplates.getState() === 'sgin';
        },
        atsgup: function() {
            return AccountsTemplates.getState() === 'sgup';
        },
        otherLoginServices: function() {
            return Accounts.oauth && Accounts.oauth.serviceNames().length > 0;
        },
        loginServices: function() {
            return Accounts.oauth.serviceNames();
        },
        passwordLoginService: function() {
            return !!Package['accounts-password'];
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
    };


    AT.prototype.atSocialHelpers = {
        capitalize: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        google: function() {
            if (this[0] === 'g' && this[1] === 'o')
                return true;
        },
        unconfigured: function() {
            return Accounts.loginServiceConfiguration.find({
                service: this.toString()
            }).fetch().length === 0;
        },
        iconClass: function() {
            var classStr = 'fa fa-';
            classStr += this.toString();
            if (this[0] === 'g' && this[1] === 'o')
                classStr += '-plus';
            return classStr;
        },
        disabled: function() {
            var user = Meteor.user();
            if (user && user.services && user.services[this])
                return 'disabled';
            return '';
        },
    };

    var validateField = function(event) {
        // Client-side only validation
        if (AccountsTemplates.ready() && AccountsTemplates.getConfig('continuousValidation')) {
            var currTarg = event.currentTarget;
            var value = currTarg.value;
            var fieldName = currTarg.id.slice(9); // Skips 'AT_field_'
            AccountsTemplates.setFieldError(fieldName, AccountsTemplates.validateField(fieldName, value));
        }
    };

    AT.prototype.loginFormEvents = {
        'keyup input': validateField,
        'focusout input': validateField,
        'click #at-fpwd': function(event) {
            event.preventDefault();
            AccountsTemplates.setState('fpwd');
        },
        'click #at-sgin': function(event) {
            event.preventDefault();
            AccountsTemplates.setState('sgin');
        },
        'click #at-sgup': function(event) {
            event.preventDefault();
            AccountsTemplates.setState('sgup');
        },
        'click #at-btn': function(event, t) {
            // Sign Up
            if (AccountsTemplates.getState() === 'sgup') {
                var sgupInfo = {};
                var fields = AccountsTemplates.getFieldsNames();
                var i = fields.length;
                while (i--) {
                    var fieldName = fields[i];
                    sgupInfo[fieldName] = t.find('#AT_field_' + fieldName).value;
                }
                return Meteor.call('ATSignup', sgupInfo, function(error, result) {
                    if (error) {
                        var fieldErrors = error.details;
                        for (var fieldName in fieldErrors)
                            AccountsTemplates.setFieldError(fieldName, fieldErrors[fieldName]);
                        AccountsTemplates.setFieldError('overall', error.reason);
                    } else {
                        AccountsTemplates.setFieldError('overall', '');
                        Meteor.loginWithPassword(sgupInfo.login, sgupInfo.password);
                        //return Router.go(somewhere);
                    }
                });
            }
            var login;
            // Sign In
            if (AccountsTemplates.getState() === 'sgin') {
                login = t.find('#AT_field_login').value;
                var pwd = t.find('#AT_field_password').value;
                return Meteor.loginWithPassword(login, pwd, function(error) {
                    if (error) {
                        AccountsTemplates.setFieldError('overall', error.reason);
                    } else {
                        AccountsTemplates.setFieldError('overall', false);
                    }
                });
            }
            // Forgot Password
            if (AccountsTemplates.getState() === 'fpwd') {
                login = t.find('#AT_field_login').value;
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
                            if (error) {
                                console.log(error.reason);
                                AccountsTemplates.setFieldError('overall', error.reason);
                                AccountsTemplates.setFieldError('result', false);
                            } else {
                                AccountsTemplates.setFieldError('overall', false);
                                AccountsTemplates.setFieldError('result', 'Email sent!');
                                //return Router.go(somewhere);
                            }
                        });
                });
            }
        },
        'click #at-btn-logout': function() {
            Meteor.logout();
        }
    };

    AT.prototype.atSocialEvents = {
        'click button': function(event, t) {
            event.preventDefault();
            var serviceName = t.firstNode.id.split('-')[1];
            //var loginWithService = Meteor["loginWith" + capitalize(serviceName)];
            var loginWithService = Meteor["signInWith" + capitalize(serviceName)];
            /*
            var callback = function(err) {
                if (!err) {
                    return; // Router.go(AccountsEntry.settings.dashboardRoute);
                } else if (err instanceof Accounts.LoginCancelledError) {
                    // do nothing
                } else if (err instanceof ServiceConfiguration.ConfigError) {
                    return loginButtonsSession.configureService(serviceName);
                } else {
                    return loginButtonsSession.errorMessage(err.reason || "Unknown error");
                }
            };
            */

            var callback = function(error, mergedUsers) {
                if (error) {
                    console.log('error', error);
                }

                // mergedUsers is set if a merge occured
                if (mergedUsers) {
                    console.log('mergedUsers', mergedUsers);

                    // TODO: Meteor.userId() can't be called here since we don't wait for the login to complete in Meteor.signInWithX, thus
                    // we have to pass along both sourceUserId and destinationUserId to this callback (mergedUsers). It would be nicer if 
                    // 'mergedUsers' was only the sourceUserId (instead of an object).

                    // The source account (mergedUsers.sourceUserId) has now been deleted, so now is your chance to deal with you application specific
                    // DB items to avoid ending up with orphans. You'd typically want to change owner on the items beloning to the deleted 
                    // user, or simply delete them.
                    /*
                Meteor.call('mergeItems', mergedUsers.sourceUserId, mergedUsers.destinationUserId, function(error, result) {
                    if (error) {
                        console.log('error', error);
                    }
                    if (result) {
                        console.log('result', result);
                    }
                });
                */
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

            /*
        return;
        return Router.go(AccountsEntry.settings.dashboardRoute);
        */
        },
    };
}


AccountsTemplates = new AT();

/*
Accounts.urls.resetPassword = function(token) {
  return Meteor.absoluteUrl('reset-password/' + token);
};
*/

if (Meteor.isServer) {
    Meteor.publish("userData", function() {
        return Meteor.users.find({
            _id: this.userId
        }, {
            fields: {
                'services': 1
            }
        });
    });
}

if (Meteor.isClient) {
    Meteor.subscribe('userData');
}