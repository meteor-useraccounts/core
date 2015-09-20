/* global
  Logger: false,
  setLogLevel: true,
  UALog: true
*/
'use strict';


/**
 * _setLogLevel - description
 *
 * @param  {type} logger description
 * @throws {Error} Will throw an error in case the logger name does not start
 *     with 'useraccounts'.
 */
setLogLevel = function _setLogLevel(logger) {
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
    settings = Meteor.settings && Meteor.settings.UserAccounts;
    if (name) {
      settings = settings && settings[name];
    }
    logLevel = settings && settings.logLevel || logLevel;

    // Give precedence to the *public* settings for the client-side
    settings = Meteor.settings && Meteor.settings.public;
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
};

// ------------------------------------
//  Create the logger for this package
// ------------------------------------
UALog = new Logger('useraccounts:core');
setLogLevel(UALog);
