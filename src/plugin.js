/* global
    UALog: false,
    UAPlugin: true
*/
'use strict';

// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading plugin.js');


// ------------------------
//  Plugin Base Class Declaration
// ------------------------

/**
 * UAPlugin - description
 *
 * @return {type}  description
 */
UAPlugin = class UAPlugin {
  constructor(pluginId) {
    UALog.trace('UAPlugin.constructor');

    check(pluginId, String);

    /**
     *
     */
    this._id = pluginId;
  }
};
