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

    UALog.trace('configure');

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

    return _.sortBy(_.values(self._modules), 'position');
  },

  registerModule: function registerModule(module) {
    var moduleName;

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
    var name;

    UALog.trace('setLogLevel');

    check(logger, Logger);

    name = logger.name.split(':');

    if (name[0] === 'useraccounts') {
      if (name.length === 2) {
        name = name[1];
      } else {
        name = name[0];
      }

      // TODO: load options for *name* from Meteor settings or ENV variables
    }
  },

  startup: function startup(callback) {
    var self = this;

    if (self.__startupHooks) {
      self.__startupHooks.push(callback);
    } else {
      // We already started up. Just call it now.
      callback();
    }
  },

};
