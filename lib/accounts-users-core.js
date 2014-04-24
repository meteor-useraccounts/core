// ---------------------------------------------------------------------------------

// AUFieldsCollection

// ---------------------------------------------------------------------------------

/*
    Each field object is represented by a document in the AUFieldsCollection collection:
        name:      String              // A unique field's name
        type:      String              // Displayed input type
        maxLength: Integer (optional)  // Possibly specifies the maximum allowed length
        minLength: Integer (optional)  // Possibly specifies the minimum allowed length
        required:  Boolean (optional)  // Specifies Whether to fail or not when field is left empty
        re:        String  (optional)  // Regular expression for validation
        order:     Integer (optional)  // Possibly used to specify display order
*/

AUFieldsCollection = new Meteor.Collection("auFieldsCollection");


// No AUFieldsCollection.allow nor AUFieldsCollection.deny to prevent client-side modifications

// Publish all fields to the client
if (Meteor.isServer){
    Meteor.publish('auFields', function() {
        return AUFieldsCollection.find();
    });
}


// ---------------------------------------------------------------------------------

// AccountsUsers object

// ---------------------------------------------------------------------------------



// -------------------
// Client/Server stuff
// -------------------

// Constructor
function AU() {
    if (Meteor.isClient) {
        this._deps["state"] = new Deps.Dependency();
        this._deps.errors = {};
    }
}

// Allowed Login State
AU.prototype.STATES = [
    "sgin", // Sign In
    "sgup", // Sign Up
    "fpwd", // Forgot Password
    "cpwd", // Change Password
];


AU.prototype.getFields = function() {
    return AUFieldsCollection.find();
};

AU.prototype.getFieldsNames = function() {
    var names = [];
    var fields = AUFieldsCollection.find({}, {field: {name:1}});
    fields.forEach(function(field){
        names.push(field.name);
    });
    return names;
};


// Initialization
AU.prototype.init = function() {
    if (Meteor.isServer){
        // A password field is strictly required
        if (typeof this._fields.password === "undefined")
            throw Error("A password field is strictly required!");
        if (this._fields.password.type !== "password")
            throw Error("The type of password field should be password!");
        // Then we need at least one "username" or one "email"
        // ...having both of them is fine
        if (typeof this._fields.username === "undefined" && typeof this._fields.email === "undefined")
            throw Error("At least one 'username' or one 'email' field is required! Having themboth is also fine...");
        // Possibly checks 'username'
        if (typeof this._fields.username !== "undefined" && this._fields.username.type !== "text")
                throw Error("The type of username field should be text!");
        // Possibly checks 'email'
        if (typeof this._fields.email !== "undefined" && this._fields.email.type !== "email")
                throw Error("The type of email field should be email!");
        // Drops the AUFieldsCollection content
        AUFieldsCollection.remove({});
        // Insert fields into AUFieldsCollection
        for (var f in this._fields)
            AUFieldsCollection.insert(this._fields[f]);
        // Marks AccountsUsers as initialized
        this._initialized = true;
    }

    if (Meteor.isClient){
        // Marks AccountsUsers as initialized
        this._deps.ready = new Deps.Dependency();
        var self = this;
        // Subscribes the client to all fields data
        Meteor.subscribe('auFields', function(){
            // Initializes fields' errors dependencies
            var field_names = self.getFieldsNames();
            var i = field_names.length;
            while (i--){
                self._deps.errors[field_names[i]] = new Deps.Dependency();
            }
            self._ready = true;
            self._deps.ready.changed();
        });
    }
};


// -----------------
// Server-only stuff
// -----------------

if (Meteor.isServer){
    // Field pattern to be checked with check
    AU.prototype.FIELD_PAT = {
        name: String,
        type: String,
        minLength: Match.Optional(Match.Integer),
        maxLength: Match.Optional(Match.Integer),
        required: Match.Optional(Boolean),
        re: Match.Optional(String), // Regular expression for validation
        order: Match.Optional(Match.Integer),
    };

    // Allowed input types
    AU.prototype.INPUT_TYPES = [
        "password",
        "email",
        "text", // Forgot Password
        "tel", // Change Password
    ];

    // SignIn / SignUp fields
    AU.prototype._fields = {
        email: {
            name: "email",
            type: "email",
            //re: "/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/";
            //re: "[a-z0-9!#$%&"*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&"*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
            // Extracted from RFC 5322
        },
        password: {
            name: "password",
            type: "password",
            minLength: 6
        }
    };

    AU.prototype._initialized = false;

    // Input type validation
    AU.prototype._isValidInputType = function(value) {
        var i = this.INPUT_TYPES.length;
        while (i--)
            if (this.INPUT_TYPES[i] === value) return true;
        return false;
    };

    AU.prototype.addFields = function(fields) {
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

    AU.prototype.addField = function(field) {
        // Fields can be added only before initialization
        if (this._initialized)
            throw new Error("AccountsUsers.addField should strictly be called before AccountsUsers.init!");
        check(field, this.FIELD_PAT);
        // Checks there"s currently no field called field.name
        if (typeof this._fields[field.name] !== "undefined")
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
        this._fields[field.name] = field;
        return this._fields;
    };

    AU.prototype.removeField = function(field_name) {
        // Fields can be removed only before initialization
        if (this._initialized)
            throw new Error("AccountsUsers.removeField should strictly be called before AccountsUsers.init!");
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

if (Meteor.isClient){

    // Reactivity Stuff
    AU.prototype._deps = {};
    
    AU.prototype._ready = false;

    // Current Errors (to be among allowed ones, see STATES)
    AU.prototype.errors = {};

    // Current Login State (to be among allowed ones, see STATES)
    AU.prototype.state = "sgin";

    // State validation
    AU.prototype._isValidState = function(value) {
        var i = this.STATES.length;
        while (i--)
            if (this.STATES[i] === value) return true;
        return false;
    };

    // Getter for current state
    AU.prototype.getState = function() {
        this._deps["state"].depend();
        return this.state;
    };

    // Setter for current state
    AU.prototype.setState = function(value) {
        if (value === this.state)
            return;
        if (!this._isValidState(value))
            throw new Meteor.Error(500, "Internal server error", "accounts-users package got an invalid state value!");
        this.state = value;
        return this._deps["state"].changed();
    };

    // Getter for current error of field *field_name*
    AU.prototype.getFieldError = function(field_name) {
        this._deps.errors[field_name].depend();
        return this.errors[field_name];
    };

    // Setter for current error of field *field_name*
    AU.prototype.setFieldError = function(field_name, error_text) {
        if (error_text === this.errors[field_name])
            return;
        /*
        if (!this._isValidState(value)) {
            throw new Meteor.Error(500, "Internal server error", "accounts-users package got an invalid state value!");
        }
        */
        this.errors[field_name] = error_text;
        return this._deps.errors[field_name].changed();
    };


    AU.prototype.ready = function() {
        this._deps.ready.depend();
        return this._ready;
    };

    /*
    AU.prototype.loginFormHelpers = {
        fields: function() {
            var AUFields = AccountsUsers.getFields();
            var fields = [];
            for (var f in AUFields) {
                fields.push(AUFields[f]);
            }
            return fields;
        },
        name: function() {
            return this.name;
        },
        Name: function() {
            return this.name.replace('_', ' ');
        },
        type: function() {
            return this.type;
        },
        buttonText: function() {
            if (AccountsUsers.getState() === 'sgin') {
                return 'Sign In';
            } else if (AccountsUsers.getState() === 'sgup') {
                return 'Sign Up';
            } else if (AccountsUsers.getState() === 'fpwd') {
                return 'Send Password';
            } else if (AccountsUsers.getState() === 'cpwd') {
                return 'Change Password';
            }
        }
    };

    AU.prototype.loginFormEvents = {};
    */
}


AccountsUsers = new AU();