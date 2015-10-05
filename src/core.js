/* global
  setLogLevel: false,
  UALog: true,
  UAModule: false,
  UAPlugin: false,
  UserAccounts: true
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading main.js');


// ------------------------
//  Base Class Declaration
// ------------------------


// Singleton Object
UserAccounts = {

  /**
   *
   */
  _startupHooks: [],

  /**
   *
   */
  _modules: {},

  /**
   *
   */
  _plugins: {},

  /**
   *
   */
  texts: {},

  /**
   * _startup - description
   *
   */
  _startup: function _startup() {
    var self = this;
    var hook;

    UALog.trace('UserAccounts._startup');

    // run the startup hooks. other calls to startup() during this can still
    // add hooks to the end.
    while (self._startupHooks.length) {
      hook = self._startupHooks.shift();
      hook.call(self);
    }
    // Setting this to null tells Meteor.startup to call hooks immediately.
    self._startupHooks = null;
  },

  /**
   * configure - description
   *
   * @param  {type} globalOptions description
   * @throws {Error} Will throw an error in case globalOptions contains invalid
   *     options or sub-objects referencing unexisting modules/plugins.
   */
  configure: function configure(globalOptions) {
    var self = this;
    var objs = _.union(_.values(self._modules), _.values(self._plugins));
    var coreOptions;

    UALog.trace('UserAccounts.configure');

    // Ask each module and each plugin to consume its own configuration options
    coreOptions = _.reduce(objs, function moduleOpts(options, obj) {
      var objName = obj._id;
      var objOptions = options[objName];

      if (objOptions) {
        if (obj.configure) {
          obj.configure(objOptions);
        } else {
          throw new Error('No configuration options expected for ' + objName);
        }
        return _.omit(options, objName);
      }
      return options;
    }, globalOptions);

    // Deal with remaining options
    // TODO: core configuration here
    coreOptions = coreOptions;
  },

  /**
   * init - description
   *
   * @return {type}  description
   */
  init: function init() {
    this._startup();
  },

  /**
   * modules - description
   *
   * @return {array}  description
   */
  modules: function modules() {
    var self = this;

    UALog.trace('UserAccounts.modules');

    return _.sortBy(_.values(self._modules), 'position');
  },

  /**
   * registerModule - description
   *
   * @param  {UAModule} module description
   * @throws {Error} Will throw an error in case a module with the same name
   *     already exists.
   */
  registerModule: function registerModule(module) {
    var moduleName;

    UALog.trace('UserAccounts.registerModule');

    check(module, UAModule);

    moduleName = module._id;

    if (this._modules[moduleName] || this[moduleName]) {
      throw new Error('A module called ' + moduleName + ' is already in use!');
    }

    this._modules[moduleName] = module;
    this[moduleName] = module;

    if (module.init) {
      module.init(this);
    }
  },

  /**
   * registerPlugin - description
   *
   * @param  {UAPlugin} plugin description
   * @throws {Error} Will throw an error in case a plugin with the same name
   *     already exists.
   */
  registerPlugin: function registerPlugin(plugin) {
    var pluginName = plugin._id;

    UALog.trace('UserAccounts.registerPlugin');

    check(plugin, UAPlugin);

    if (this._plugins[pluginName] || this[pluginName]) {
      throw new Error('A plugin called ' + pluginName + ' is already in use!');
    }

    this._plugins[pluginName] = plugin;
    this[pluginName] = plugin;

    if (plugin.init) {
      plugin.init(this);
    }
  },

  /**
   * removeModule - description
   *
   * @param  {string} moduleName description
   * @throws {Error} Will throw an error in case no module called *moduleName*
   *     exists.
   */
  removeModule: function removeModule(moduleName) {
    var module;

    UALog.trace('UserAccounts.removeModule');

    check(moduleName, String);

    if (!this._modules[moduleName]) {
      throw new Error('Module ' + moduleName + ' not in use!');
    }

    module = this._modules[moduleName];
    delete this._modules[moduleName];
    delete this[moduleName];

    if (module.uninit) {
      module.uninit(this);
    }
  },

  /**
   * removePlugin - description
   *
   * @param  {type} pluginName description
   * @throws {Error} Will throw an error in case no plugin called *pluginName*
   *     exists.
   */
  removePlugin: function removePlugin(pluginName) {
    var plugin;

    UALog.trace('UserAccounts.removePlugin');

    check(pluginName, String);

    if (!this._plugins[pluginName]) {
      throw new Error('Plugin ' + pluginName + ' not in use!');
    }

    plugin = this._plugins[pluginName];
    delete this._plugins[pluginName];
    delete this[pluginName];

    if (plugin.uninit) {
      plugin.uninit(this);
    }
  },

  /**
   *
   */
  setLogLevel: setLogLevel,

  /**
   * startup - description
   *
   * @param  {type} callback description
   */
  startup: function startup(callback) {
    var self = this;

    UALog.trace('UserAccounts.startup');

    check(callback, Function);

    if (self._startupHooks) {
      self._startupHooks.push(callback);
    } else {
      // We already started up. Just call it now.
      callback();
    }
  },
};
