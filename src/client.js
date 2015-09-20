/* global
    Match: false,
    ReactiveVar: false,
    UserAccounts: false,
    UALog: false
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading client.js');

_.extend(UserAccounts, {

  /**
   *
   */
  frameworks: [],

  /**
   *
   */
  skins: {},

  /**
   *
   */
  currentFramework: 'none',

  /**
   *
   */
  tmplInstances: [],

  /**
   * Default initial state
   */
  defaultState: 'signIn',

  /**
   * Allowed Internal (client-side) States
   */
  STATES: [
    'signIn', // Sign In
    'signUp', // Sign Up
  ],

  /**
   * applySkin - Apply skin to modules
   *
   * @param  {string} framework description
   * @param  {object} skin      description
   */
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

  /**
   * init - description
   *
   */
  init: function init() {
    this.__startup();
    Template.registerHelper('uaT', UserAccounts.t);
    Template.registerHelper('UserAccounts', UserAccounts);
  },

  /**
   * initFormTemplate - description
   *
   * @param  {type} uaForm description
   */
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
      /**
       *
       */
      disabled: new ReactiveVar(false),

      /**
       *
       */
      framework: framework,

      /**
       *
       */
      loading: new ReactiveVar(false),

      /**
       *
       */
      state: new ReactiveVar(defaultState),

      /**
       * _isValidState - State validation
       *
       * @param  {string} value description
       * @return {bool}       description
       */
      _isValidState: function _isValidState(value) {
        return _.contains(self.STATES, value);
      },

      /**
       * isDisabled - Getter for disabled state
       *
       * @return {bool}  description
       */
      isDisabled: function isDisabled() {
        return this.disabled.get();
      },

      /**
       * isLoading - Getter for loading state
       *
       * @return {bool}  description
       */
      isLoading: function isLoading() {
        return this.loading.get();
      },

      /**
       * getState - Getter for current state
       *
       * @return {string}  description
       */
      getState: function getState() {
        return this.state.get();
      },

      /**
       * setDisabled - Setter for disabled state
       *
       * @param  {bool} value description
       * @return {bool}       description
       */
      setDisabled: function setDisabled(value) {
        return this.disabled.set(value);
      },

      /**
       * setLoading - Setter for loading state
       *
       * @param  {bool} value description
       * @return {bool}       description
       */
      setLoading: function setLoading(value) {
        return this.loading.set(value);
      },

      /**
       * setState - Setter for current state
       *
       * @param  {string} state    description
       * @param  {function} callback description
       * @throws {Error} Will throw an error in case of invalid state.
       */
      setState: function setState(state, callback) {
        check(state, String);
        check(callback, Match.Optional(Function)); //eslint-disable-line
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

  /**
   * setInitialState - description
   *
   * @param  {string} state description
   * @throws {Error} Will throw an error in case of invalid initial state.
   */
  setInitialState: function setInitialState(state) {
    if (!_.contains(this.STATES, state)) {
      throw Error('Invalid inital state!');
    }
    UserAccounts.defaultState = state;
  },

  /**
   * t - description
   *
   * @return {string}  description
   */
  t: function t() {
    // console.log('t');
    var __slice = [].slice;
    var key = arguments.length >= 1 ? arguments[0] : undefined;
    var args = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
    // console.log('key: ' + key);
    // console.log('args: ' + args);

    return UserAccounts.texts[key] || key;
  },
});
