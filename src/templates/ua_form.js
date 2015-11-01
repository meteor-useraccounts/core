/* global
    Template: false,
    UserAccounts: false,
    UALog: false
*/
'use strict';


/**
 * onCreated - description
 *
 * @return {type}  description
 */
Template.uaForm.onCreated(function onCreated() {
  UALog.trace('uaForm.onCreated');

  // Initializes the ua object
  UserAccounts.initFormTemplate(this);

  // register this template within UserAccounts
  UserAccounts.tmplInstances.push(this);
});


Template.uaForm.helpers({

  /**
   * mods - description
   *
   * @return {type}  description
   */
  modules() {
    UALog.trace('uaForm.modules');

    const tmplInstance = Template.instance();
    const data = this.data;
    const framework = data && data.framework || UserAccounts.currentFramework;
    const modules = _.map(UserAccounts.modules(), function m(mod) {
      // return _.extend({instance: tmplInstance}, mod);
      return {
        module: mod,
        instance: tmplInstance,
        framework: framework,
      };
    });

    // console.dir(modules);
    return modules;
  },


  /**
   * skinClasses - description
   *
   * @param  {type} element description
   * @return {type}         description
   */
  skinAttrs(element) {
    var framework = Template.instance().framework;
    var classes;

    UALog.trace('template uaForm: skinClasses - ' + element);

    if (_.has(UserAccounts.skins, framework)) {
      classes = UserAccounts.skins[framework][element];
      if (_.isFunction(classes)) {
        classes = classes();
      }
      return classes;
    }
  },
});
