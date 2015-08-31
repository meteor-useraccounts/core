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

UAPlugin = function() {
};

_.extend(UAPlugin.prototype, {

  _id: 'UAPlugin',
  texts: {},

  _configure: function(options) {
    UALog.trace('_configure ' + this._id);
    var
      self = self,
      pluginOptions = options[self._id]
    ;

    if (self.configure && pluginOptions) {
      self.configure(pluginOptions);
    }
    return _.omit(options, self._id);
  },

  getText: function(key) {
    var
      self = this,
      uaTmpl = Template.currentData().instance,
      state = uaTmpl.getState();

    var texts = self.texts[state] || self.texts.default;
    return texts[key] || '';
  },

  skinClasses: function(element) {
    UALog.trace('plugin ' + this._id + ': skinClasses - ' + element);
    var
      self = this,
      framework = Template.currentData().instance.framework
    ;

    if (_.has(self.skins, framework)) {
      var classes = self.skins[framework][element];
      if (_.isFunction(classes)) {
        classes = classes();
      }
      return classes || '';
    }

    return '';
  },
});
