/* global
    ReactiveVar: false,
    UserAccounts: false,
    UALog: false
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading client.js');


var __slice = [].slice;

UserAccounts.t = function() {
  console.log('t');
  var args, key;
  key = arguments.length >= 2 ? arguments[0] : undefined;
  args = arguments.length >= 2 ? __slice.call(arguments, 1) : [];

  return UserAccounts.i18n[key] || key;
};


UserAccounts.frameworks = [];
UserAccounts.skins = {};
UserAccounts.currentFramework = 'none';


// Allowed Internal (client-side) States
UserAccounts.STATES = [
  'signIn', // Sign In
  'signUp', // Sign Up
];


// Initial default state
UserAccounts.defaultState = 'signIn';



UserAccounts.getTemplateObject = function(data) {
  UALog.trace('UserAccounts.getTemplateObject');
  var
    self = this,
    objs = _.union(_.values(self._modules), _.values(self._plugins)),
    defaultState = (data && data.defaultState) || self.defaultState;

  if (!_.contains(self.STATES, defaultState)) {
    throw Error('Invalid inital state!');
  }

  var tmplObj = {
    state: ReactiveVar(defaultState)
  };

  // State validation
  tmplObj._isValidState = function(value) {
    return _.contains(self.STATES, value);
  };


  // Getter for current state
  tmplObj.getState = function() {
    return this.state.get();
  };


  // Setter for current state
  tmplObj.setState = function(state, callback) {
    check(state, String);
    if (!this._isValidState(state)) {
      throw new Meteor.Error(
        500,
        'Internal server error',
        'accounts-templates-core package got an invalid state value!'
      );
    }
    this.state.set(state);
    // this.clearState();
    if (_.isFunction(callback)) {
      callback();
    }
  };

  // Ask each module and each plugin to possibly add other fields to the tmplObj
  tmplObj = _.reduce(objs, function(tmplObj, obj) {
    console.dir(obj);
    if (obj._getTemplateObject !== undefined) {
      tmplObj = _.extend(tmplObj, obj._getTemplateObject(data));
    }
    return tmplObj;
  }, tmplObj);

  return tmplObj;
};


UserAccounts.__startupHooks.push(function() {
  UALog.debug(' - Initializing');
});


Template.registerHelper('UserAccounts', function() {
  return UserAccounts;
});
