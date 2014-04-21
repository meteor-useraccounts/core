var AccountsUsers;

AccountsUsers = (function() {

  // Allowed Login State
  AccountsUsers.STATES = [
    'sgin', // Sign In
    'sgup', // Sign Up
    'fpwd', // Forgot Password
    'cpwd', // Change Password
  ];


  // Allowed input types
  AccountsUsers.INPUT_TYPES = [
    'password',
    'email',
    'text', // Forgot Password
    'tel', // Change Password
  ];

  // Field pattern to be checked with check
  AccountsUsers.FIELD_PAT = {
    name: String,
    type: String,
    minLength: Match.Optional(Match.Integer),
    maxLength: Match.Optional(Match.Integer),
    re: Match.Optional(String), // Regular expression for validation
  };

  // Reactivity Stuff
  AccountsUsers.prototype._deps = {};

  // SignIn / SignUp fields
  AccountsUsers.prototype._fields = {
    email: {
      name: 'email',
      type: 'email',
      //re: '/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/';
      re: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
      // Extracted from RFC 5322
    },
    password: {
      name: 'password',
      type: 'password',
      minLength: 6
    }
  };

  // Current Login State (to be among allowed ones, see STATES)
  AccountsUsers.prototype.state = 'sgin';

  // Constructor
  function AccountsUsers() {
    this._deps['state'] = new Deps.Dependency();
    console.log('AccountsUsers object created!!!');
  }

  // State validation
  AccountsUsers.prototype.isValidState = function(value) {
    var i = this.STATES.length;
    while (i--) {
      if (this.STATES[i] === value) return true;
    }
    return false;
  };

  // Input type validation
  AccountsUsers.prototype.isValidInputType = function(value) {
    var i = this.INPUT_TYPES.length;
    while (i--) {
      if (this.INPUT_TYPES[i] === value) return true;
    }
    return false;
  };

  // Getter for current state
  AccountsUsers.prototype.getState = function() {
    this._deps['state'].depend();
    return this.state;
  };

  // Setter for current state
  AccountsUsers.prototype.setState = function(value) {
    if (value === this.state) {
      return;
    }
    if (!this.isValidState(value)) {
      //throw new Error('accounts-users package got an invalid state value!');
      throw new Meteor.Error(500, 'Internal server error', 'accounts-users package got an invalid state value!');
    }
    this.state = value;
    return this._deps['state'].changed();
  };

  AccountsUsers.prototype.addFields = function(fields) {
    var ok;
    try { // don't bother with `typeof` - just access `length` and `catch`
      ok = obj.length > 0 && '0' in Object(obj);
    } catch (e) {
      throw new Error('field argument should be an array of valid field objects!');
    }
    if (ok){
      _.each(fields, this.addField);
    }
  };

  AccountsUsers.prototype.addField = function(field) {
    check(field, this.FIELD_PAT);
    this._fields[field.name] = field;
    return this._fields;
  };

  AccountsUsers.prototype.removeField = function(field) {
    this._fields[field.name] = field;
    return this._fields;
  };

  AccountsUsers.prototype.getFields = function() {
    return this._fields;
  };

  return AccountsUsers;

})();

this.AU = new AccountsUsers();