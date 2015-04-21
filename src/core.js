/* global
  UALog: true,
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


// Constructor
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
  var
    self = this,
    objs = _.union(_.values(self._modules), _.values(self._plugins));

  // Ask each module and each plugin to extract its own configuration options
  options = _.reduce(objs, function(options, obj) {
    if (obj._configure !== undefined) {
      options = obj._configure(options);
    }
    return options;
  }, options);

  // Deal with remaining options
  // TODO: core configuration here
  UALog.trace('configure');
  // console.log(options);
};


UserAccounts.modules = function() {
  var self = this;

  return _.sortBy(_.values(self._modules), 'position');
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
