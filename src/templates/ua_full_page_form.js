/* global
    Template: false,
    UserAccounts: false,
    UALog: false
*/
'use strict';


Template.uaFullPageForm.helpers({
  /**
   * skinAttrs - description
   *
   * @param  {type} element description
   * @return {type}         description
   */
  skinAttrs(element) {
    UALog.trace('template uaFullPageForm: skinAttrs - ' + element);

    const framework = UserAccounts.currentFramework;
    let classes;

    if (_.has(UserAccounts.skins, framework)) {
      classes = UserAccounts.skins[framework][element];
      if (_.isFunction(classes)) {
        classes = classes();
      }

      return classes;
    }
  },
});
