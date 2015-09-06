/* global
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

  __startupHooks: [],

  __startup: function __startup() {
    var self = this;
    var hook;

    UALog.trace('UserAccounts.__startup');

    // run the startup hooks. other calls to startup() during this can still
    // add hooks to the end.
    while (self.__startupHooks.length) {
      hook = self.__startupHooks.shift();
      hook.call(self);
    }
    // Setting this to null tells Meteor.startup to call hooks immediately.
    self.__startupHooks = null;
  },

  _modules: {},

  _plugins: {},

  configure: function configure(globalOptions) {
    var self = this;
    var objs = _.union(_.values(self._modules), _.values(self._plugins));
    var coreOptions;

    UALog.trace('UserAccounts.configure');

    // Ask each module and each plugin to consume its own configuration options
    coreOptions = _.reduce(objs, function moduleOpts(options, obj) {
      var opts;
      if (obj._configure !== undefined) {
        opts = obj._configure(options);
        return opts;
      }
      return options;
    }, globalOptions);

    // Deal with remaining options
    // TODO: core configuration here
    coreOptions;
  },

  modules: function modules() {
    var self = this;

    UALog.trace('UserAccounts.modules');

    return _.sortBy(_.values(self._modules), 'position');
  },

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

  setLogLevel: function setLogLevel(logger) {
    var logLevel = 'error';
    var name;
    var settings;

    UALog.trace('UserAccounts.setLogLevel');

    check(logger, Logger);

    // Try to split name in two parts since name is usually in the form
    // *root:leaf* or simply *root*.
    name = logger.name.split(':');
    // In any case We expect *root* to be equal *useraccounts*...
    if (name[0] === 'useraccounts') {
      // Pick up the second name or null
      name = name.length === 2 && name[1] || null;

      // Look for UA log level settings inside Meteor.settings
      settings = Meteor.settings.UserAccounts;
      if (name) {
        settings = settings && settings[name];
      }
      logLevel = settings && settings.logLevel || logLevel;

      // Give precedence to the *public* settings for the client-side
      settings = Meteor.settings.public;
      settings = settings && settings.UserAccounts;
      if (name) {
        settings = settings && settings[name];
      }
      logLevel = settings && settings.logLevel || logLevel;

      // TODO: load options for *name* from ENV variables
      //       for the server-side
      /*
      if (Meteor.isServer && process.env.UA_LOGLEVEL_XXX) {
      }
      */

      // Eventually set the log level for the required logger
      Logger.setLevel(logger.name, logLevel);
    } else {
      throw new Error('not a UserAccounts logger...');
    }
  },

  startup: function startup(callback) {
    var self = this;

    UALog.trace('UserAccounts.startup');

    if (self.__startupHooks) {
      self.__startupHooks.push(callback);
    } else {
      // We already started up. Just call it now.
      callback();
    }
  },

};
