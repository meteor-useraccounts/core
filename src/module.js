/* global
    Spacebars: false,
    UALog: false,
    UAModule: true,
    UserAccounts: false
*/
'use strict';

// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading module.js');


// ------------------------
//  Module Base Class Declaration
// ------------------------

/**
 * UAModule - description
 *
 * @return {type}  description
 */
UAModule = function _UAModule() {};

_.extend(UAModule.prototype, {

  /**
   *
   */
  _id: 'UAModule',

  /**
   *
   */
  skins: {},

  /**
   *
   */
  template: null,

  /**
   *
   */
  texts: {},

  /**
   *
   */
  textTransforms: {},

  /**
   *
   */
  visible: true,

  /**
   * getTextTransform - description
   *
   * @param  {type} key description
   * @return {type}     description
   */
  _getTextTransform: function _getTextTransform(key) {
    var self = this;

    UALog.trace('UAModule._getTextTransform (' + self._id + ')');

    return self.textTransforms[key] || self.textTransforms.default;
  },

  /**
   * getText - description
   *
   * @param  {type} key description
   * @return {type}     description
   */
  getText: function getText() {
    var self = this;
    var uaTmpl = Template.currentData().instance;
    var state = uaTmpl.getState();
    var texts = self.texts[state] || self.texts.default;
    var text;
    var transform;
    var element;
    var key;
    var options;

    UALog.trace('UAModule.getText (' + self._id + ')');

    // Check there is at least one parameter
    // NOTE: you might get one more parameter which is an instance of
    //       Spacebars.kw providing access to keyword arguments, so we
    //       need to remove it not to pass it on to next function calls...
    options = _.filter(arguments, function omitSpacebarsKw(param) {
      return !(param instanceof Spacebars.kw);
    });

    // In case no option remains, there's nothing to do here...
    if (options.length < 1) {
      return '';
    }

    // Retrieve the requested element
    element = options[0];
    // Retrieve the key for requested element
    key = texts[element] || element;
    // Put the retrieved text back in first position
    options[0] = key;

    // Retrieve the text associated with the key
    text = UserAccounts.t.apply(UserAccounts, options);

    // Retrieve the transform for the requested element
    transform = self._getTextTransform(element);
    // Possibly apply the configured transform to the text
    if (transform) {
      text = transform(text);
    }

    return text;
  },

  /**
   * skinClasses - description
   *
   * @param  {type} element description
   * @return {type}         description
   */
  skinClasses: function skinClasses(element) {
    var self = this;
    var classes;
    var framework = Template.currentData().instance.framework;

    UALog.trace('UAModule.skinClasses (' + self._id + ')');

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
