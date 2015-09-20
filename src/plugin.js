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

  /**
   *
   */
  texts: {},

  /**
   * getText - description
   *
   * @param  {type} key description
   * @return {type}     description
   */
  getText: function getText(key) {
    var self = this;
    var uaTmpl = Template.currentData().instance;
    var state = uaTmpl.getState();
    var texts = self.texts[state] || self.texts.default;

    return texts[key] || '';
  },

  /**
   * skinClasses - description
   *
   * @param  {type} element description
   * @return {type}         description
   */
  skinClasses: function skinClasses(element) {
    var self = this;
    var framework = Template.currentData().instance.framework;
    var classes;

    UALog.trace('plugin ' + this._id + ': skinClasses - ' + element);

    if (_.has(self.skins, framework)) {
      classes = self.skins[framework][element];
      if (_.isFunction(classes)) {
        classes = classes();
      }
      return classes || '';
    }

    return '';
  },
});
