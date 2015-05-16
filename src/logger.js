/* global
  Logger: false,
  UALog: true
*/
'use strict';


// ------------------------------------
//  Create the logger for this package
// ------------------------------------
UALog = new Logger('useraccounts:core');

UALog.trace('Initializing logger options');


// ----------------------------------
//  Pick up settings for this logger
// ----------------------------------

var
  publicSettings = Meteor.settings &&
                   Meteor.settings.public &&
                   Meteor.settings.public.useraccounts,
  settings = Meteor.settings &&
             Meteor.settings &&
             Meteor.settings.useraccounts
;

var uaLogLevelSettings;
if (publicSettings) {
  uaLogLevelSettings = publicSettings.logLevel;
} else if (settings) {
  uaLogLevelSettings = settings.logLevel;
}

if (uaLogLevelSettings && uaLogLevelSettings.core) {
  Logger.setLevel('useraccounts:core', uaLogLevelSettings.core);
}

if (Meteor.isServer && process.env.USERACCOUNTS_CORE_LOGLEVEL) {
  Logger.setLevel('useraccounts:core', process.env.USERACCOUNTS_CORE_LOGLEVEL);
}
