/* global
    Template: false,
    UserAccounts: false,
    UALog: false
*/
'use strict';


Template.uaFullPageForm.helpers({
  /**
   * skinClasses - description
   *
   * @param  {type} element description
   * @return {type}         description
   */
  skinAttrs(element) {
    UALog.trace('template uaFullPageForm: skinClasses - ' + element);

    const framework = UserAccounts.currentFramework;
    let classes;

    if (_.has(UserAccounts.skins, framework)) {
      classes = UserAccounts.skins[framework][element];
      if (_.isFunction(classes)) {
        classes = classes();
      }
      console.dir(classes);
      return classes;
    }
  },
});
