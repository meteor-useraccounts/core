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
  _modules: {},
  _plugins: {},
  events: [],
  helpers: [],
  tmplInstances: [],
};


UserAccounts.__startup = function() {
  var self = this;

  // run the startup hooks. other calls to startup() during this can still
  // add hooks to the end.
  while (self.__startupHooks.length) {
    var hook = self.__startupHooks.shift();
    hook.call(self);
  }
  // Setting this to null tells Meteor.startup to call hooks immediately.
  self.__startupHooks = null;
};


UserAccounts.configure = function(options) {
  UALog.trace('configure');

  var
    self = this,
    objs = _.union(_.values(self._modules), _.values(self._plugins));

  // Ask each module and each plugin to consume its own configuration options
  options = _.reduce(objs, function(options, obj) {
    if (obj._configure !== undefined) {
      options = obj._configure(options);
    }
    return options;
  }, options);

  // Deal with remaining options
  // TODO: core configuration here
};


UserAccounts.modules = function() {
  var self = this;

  return _.sortBy(_.values(self._modules), 'position');
};


UserAccounts.setLogLevel = function(name, logger) {

};


UserAccounts.registerModule = function(module) {
  check(module, UAModule);
  var moduleName = module._id;

  if (this._modules[moduleName] || this[moduleName]) {
    throw new Error('A module called ' + moduleName + ' is already in use!');
  }

  this._modules[moduleName] = module;
  this[moduleName] = module;

  if (module.init) {
    module.init(this);
  }
};


UserAccounts.removeModule = function(moduleName) {
  check(moduleName, String);

  if (!this._modules[moduleName]) {
    throw new Error('Module ' + moduleName + ' not in use!');
  }

  var module = this._modules[moduleName];
  delete this._modules[moduleName];
  delete this[moduleName];

  if (module.uninit) {
    module.uninit(this);
  }
};


UserAccounts.registerPlugin = function(plugin) {
  check(plugin, UAPlugin);
  var pluginName = plugin._id;

  if (this._plugins[pluginName] || this[pluginName]) {
    throw new Error('A plugin called ' + pluginName + ' is already in use!');
  }

  this._plugins[pluginName] = plugin;
  this[pluginName] = plugin;

  if (plugin.init) {
    plugin.init(this);
  }
};


UserAccounts.removePlugin = function(pluginName) {
  // TODO: check plugin is a subclass of UAPlugin
  check(pluginName, String);

  if (!this._plugins[pluginName]) {
    throw new Error('Plugin ' + pluginName + ' not in use!');
  }

  var plugin = this._plugins[pluginName];
  delete this._plugins[pluginName];
  delete this[pluginName];

  if (plugin.uninit) {
    plugin.uninit(this);
  }
};


UserAccounts.startup = function(callback) {
  var self = this;

  if (self.__startupHooks) {
    self.__startupHooks.push(callback);
  } else {
    // We already started up. Just call it now.
    callback();
  }
};
