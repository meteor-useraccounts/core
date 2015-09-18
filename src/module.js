/* global
    UALog: false,
    UAModule: true
*/
'use strict';

// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading module.js');


// ------------------------
//  Module Base Class Declaration
// ------------------------

UAModule = function _UAModule() {};

_.extend(UAModule.prototype, {

  _id: 'UAModule',

  skins: {},

  template: null,

  texts: {},

  visible: true,

  getText: function getText(key) {
    var self = this;
    var uaTmpl = Template.currentData().instance;
    var state = uaTmpl.getState();
    var texts = self.texts[state] || self.texts.default;

    return texts[key] || '';
  },

  skinClasses: function skinClasses(element) {
    var self = this;
    var classes;
    var framework = Template.currentData().instance.framework;

    UALog.trace('module ' + this._id + ': skinClasses - ' + element);

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
