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


/*
UserAccounts.__startupHooks.push(function() {
  UALog.debug(' - Initializing');
});
*/

_.extend(UserAccounts, {

  frameworks: [],
  skins: {},
  currentFramework: 'none',
  tmplInstances: [],

  // Default initial state
  defaultState: 'signIn',

  // Allowed Internal (client-side) States
  STATES: [
    'signIn', // Sign In
    'signUp', // Sign Up
  ],

  // Apply skin to modules
  applySkin: function applySkin(framework, skin) {
    // console.log('Applying skin for framework ' + framework);
    _.each(skin, function skn(elements, moduleName) {
      var module;
      var skinObj;

      // console.log('Module: ' + moduleName);
      // console.log('Module: ' + elements);

      // Pick up current module
      if (moduleName === 'uaForm') {
        module = UserAccounts;
      } else {
        module = UserAccounts._modules[moduleName];
      }

      // In case the module exists
      if (module) {
        // Possibly initialize the object for the current framework
        if (!module.skins[framework]) {
          module.skins[framework] = {};
        }

        // Applies module's elements
        skinObj = module.skins[framework];
        _.extend(skinObj, elements);
        /*
        _.each(elements, function (value, element){
          skinObj[element] = value;
        });
        */
      }
    });
    this.frameworks.push(framework);
    this.currentFramework = framework;
  },

  initFormTemplate: function initFormTemplate(uaForm) {
    var self = this;
    var data = uaForm.data;
    var objs = _.union(_.values(self._modules), _.values(self._plugins));
    var framework = data && data.framework || self.currentFramework;
    var defaultState = data && data.defaultState || self.defaultState;

    UALog.trace('UserAccounts.initFormTemplate');

    if (!_.contains(self.STATES, defaultState)) {
      throw Error('Invalid inital state!');
    }

    _.extend(uaForm, {
      disabled: ReactiveVar(false),
      framework: framework,
      loading: ReactiveVar(false),
      state: ReactiveVar(defaultState),

      // State validation
      _isValidState: function _isValidState(value) {
        return _.contains(self.STATES, value);
      },

      // Getter for disabled state
      isDisabled: function isDisabled() {
        return this.disabled.get();
      },

      // Getter for loading state
      isLoading: function isLoading() {
        return this.loading.get();
      },

      // Getter for current state
      getState: function getState() {
        return this.state.get();
      },

      // Setter for disabled state
      setDisabled: function setDisabled(value) {
        return this.disabled.set(value);
      },

      // Setter for loading state
      setLoading: function setLoading(value) {
        return this.loading.set(value);
      },

      // Setter for current state
      setState: function setState(state, callback) {
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
      },
    });

    // Ask each module and each plugin to possibly add other stuff to the uaForm
    _.each(objs, function o(obj) {
      if (!!obj._initFormTemplate) {
        obj._initFormTemplate(uaForm);
      }
    });
  },

  setInitialState: function setInitialState(state) {
    if (!_.contains(this.STATES, state)) {
      throw Error('Invalid inital state!');
    }
    UserAccounts.defaultState = state;
  },

  t: function t() {
    // console.log('t');
    var __slice = [].slice;
    var key = arguments.length >= 1 ? arguments[0] : undefined;
    var args = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
    // console.log('key: ' + key);
    // console.log('args: ' + args);

    return UserAccounts.i18n[key] || key;
  },
});


Template.registerHelper('UserAccounts', UserAccounts);
