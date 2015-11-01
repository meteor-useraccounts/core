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
UAModule = class UAModule {

  constructor({ moduleId, position, template, templateClass }) {
    check(moduleId, String);
    check(position, Match.Integer);
    check(template, String);
    check(templateClass, String);

    /**
     *
     */
    this._id = moduleId;

    /**
     *
     */
    this.position = position;
    /**
     *
     */
    this.skins = {};

    /**
     *
     */
    this.template = template;

    /**
     *
     */
    this.templateClass = templateClass;

    /**
     *
     */
    this.texts = {};

    /**
     *
     */
    this.textTransforms = {};

    /**
     *
     */
    this.visible = true;
  }

  /**
   * getTextTransform - description
   *
   * @param  {type} key description
   * @return {type}     description
   */
  _getTextTransform(key) {
    let self = this;

    UALog.trace('UAModule._getTextTransform (' + self._id + ')');

    return self.textTransforms[key] || self.textTransforms.default;
  }

  /**
   * getText - description
   *
   * @param  {type} key description
   * @return {type}     description
   */
  getText() {
    const self = this;
    const uaTmpl = Template.currentData().instance;
    const state = uaTmpl.getState();
    const texts = self.texts[state] || self.texts.default;

    let text;
    let transform;
    let element;
    let key;
    let options;

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
    text = UserAccounts.t(...options);

    // Retrieve the transform for the requested element
    transform = self._getTextTransform(element);
    // Possibly apply the configured transform to the text
    if (transform) {
      text = transform(text);
    }

    return text;
  }

  /**
   * skinClasses - description
   *
   * @param  {type} element description
   * @return {type}         description
   */
  skinClasses(element) {
    const self = this;
    const framework = Template.currentData().instance.framework;

    let classes;

    UALog.trace('UAModule.skinClasses (' + self._id + ')');

    if (_.has(self.skins, framework)) {
      classes = self.skins[framework][element];
      if (_.isFunction(classes)) {
        classes = classes();
      }
      return classes || '';
    }

    return '';
  }
};
