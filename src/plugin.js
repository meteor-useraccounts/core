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
UAPlugin = function _UAPlugin() {};

_.extend(UAPlugin.prototype, {

  /**
   *
   */
  _id: 'UAPlugin',

});
