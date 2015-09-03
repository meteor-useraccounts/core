/* global
    UserAccounts: false,
    UALog: false
*/
'use strict';


Template.uaForm.onCreated(function onCreated() {
  var self = this;

  UALog.trace('uaForm created');

  // Initializes the ua object
  UserAccounts.initFormTemplate(self);

  // register this template within UserAccounts
  UserAccounts.tmplInstances.push(self);
});


Template.uaForm.helpers({
  modules: function mods() {
    var self = this;
    var tmplInstance = Template.instance();
    var data = self.data;
    var framework = data && data.framework || UserAccounts.currentFramework;
    var modules = _.map(UserAccounts.modules(), function m(mod) {
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
  skinClasses: function skinClasses(element) {
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
