/* global
  Logger: false,
  UA: true,
  UALog: true
*/


// ------------------------------------
//  Creates the logger for this package
// ------------------------------------
UALog = new Logger('useraccounts:core');

var uaLogLevelSettings;
if (Meteor.settings.public && Meteor.settings.public.useraccounts) {
  uaLogLevelSettings = Meteor.settings.public.useraccounts.logLevel;
}
else if (Meteor.settings && Meteor.settings.useraccounts) {
  uaLogLevelSettings = Meteor.settings.useraccounts.logLevel;
}

if (uaLogLevelSettings && uaLogLevelSettings.core) {
  Logger.setLevel('useraccounts:core', uaLogLevelSettings.core);
}

if (Meteor.isServer && process.env.USERACCOUNTS_CORE_LOGLEVEL) {
  Logger.setLevel('useraccounts:core', process.env.USERACCOUNTS_CORE_LOGLEVEL);
}


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading main.js');


// ------------------------
//  Base Class Declaration
// ------------------------


// Constructor
UA = function() {
  'use strict';
  var self = this;

  self.__startup();
};


UA.prototype.__startupHooks = [];


UA.prototype.__startup = function(){
  'use strict';
  var self = this;

  // run the startup hooks. other calls to startup() during this can still
  // add hooks to the end.
  while (self.__startupHooks.length) {
    var hook = self.__startupHooks.shift();
    hook();
  }
  // Setting this to null tells Meteor.startup to call hooks immediately.
  self.__startupHooks = null;
};


UA.prototype.startup = function (callback) {
  'use strict';
  var self = this;

  if (self.__startupHooks) {
    self.__startupHooks.push(callback);
  } else {
    // We already started up. Just call it now.
    callback();
  }
};
