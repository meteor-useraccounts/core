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

UAPlugin = function _UAPlugin() {};

_.extend(UAPlugin.prototype, {

  _id: 'UAPlugin',
  texts: {},

  _configure: function _configure(options) {
    var self = self;
    var pluginOptions = options[self._id];

    UALog.trace('_configure ' + this._id);

    if (self.configure && pluginOptions) {
      self.configure(pluginOptions);
    }
    return _.omit(options, self._id);
  },

  getText: function getText(key) {
    var self = this;
    var uaTmpl = Template.currentData().instance;
    var state = uaTmpl.getState();
    var texts = self.texts[state] || self.texts.default;

    return texts[key] || '';
  },

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
