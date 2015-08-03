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


UserAccounts.__startupHooks.push(function() {
  UALog.debug(' - Initializing');
});


UserAccounts.t = function() {
  // console.log('t');
  var
    key = arguments.length >= 1 ? arguments[0] : undefined,
    args = arguments.length >= 2 ? __slice.call(arguments, 1) : []
  ;
  // console.log('key: ' + key);
  // console.log('args: ' + args);

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


// Apply skin to modules
UserAccounts.applySkin = function(framework, skin){
  // console.log('Applying skin for framework ' + framework);
  _.each(skin, function(elements, moduleName){
      //console.log('Module: ' + moduleName);
      //console.log('Module: ' + elements);

      // Pick up current module
      var module;
      if (moduleName === 'uaForm') {
        module = UserAccounts;
      }
      else {
        module = UserAccounts._modules[moduleName];
      }

      // In case the module exists
      if (module) {
        // Possibly initialize the object for the current framework
        if (!module.skins[framework]) {
          module.skins[framework] = {};
        }

        //Applies module's elements
        var skinObj = module.skins[framework];
        _.each(elements, function(value, element){
          skinObj[element] = value;
        });
      }
  });
  this.frameworks.push(framework);
  this.currentFramework = framework;
};

// Initial default state
UserAccounts.defaultState = 'signIn';



UserAccounts.initFormTemplate = function(uaForm) {
  UALog.trace('UserAccounts.initFormTemplate');
  var
    self = this,
    data = uaForm.data,
    objs = _.union(_.values(self._modules), _.values(self._plugins)),
    framework = (data && data.framework) || self.currentFramework,
    defaultState = (data && data.defaultState) || self.defaultState
  ;

  if (!_.contains(self.STATES, defaultState)) {
    throw Error('Invalid inital state!');
  }

  uaForm.disabled = ReactiveVar(false);
  uaForm.framework = framework;
  uaForm.loading = ReactiveVar(false);
  uaForm.state = ReactiveVar(defaultState);

  // State validation
  uaForm._isValidState = function(value) {
    return _.contains(self.STATES, value);
  };


  // Getter for disabled state
  uaForm.isDisabled = function() {
    return this.disabled.get();
  };

  // Getter for loading state
  uaForm.isLoading = function() {
    return this.loading.get();
  };

  // Getter for current state
  uaForm.getState = function() {
    return this.state.get();
  };

  // Setter for disabled state
  uaForm.setDisabled = function(value) {
    return this.disabled.set(value);
  };

  // Setter for loading state
  uaForm.setLoading = function(value) {
    return this.loading.set(value);
  };

  // Setter for current state
  uaForm.setState = function(state, callback) {
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

  // Ask each module and each plugin to possibly add other stuff to the uaForm
  _.each(objs, function(obj) {
    if (!!obj._initFormTemplate) {
      obj._initFormTemplate(uaForm);
    }
  });
};

UserAccounts.linkClick = function(uaTmpl, targetState) {
  uaTmpl.setState(targetState);
};



Template.registerHelper('UserAccounts', function() {
  return UserAccounts;
});
