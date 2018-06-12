import { T9n } from 'meteor-accounts-t9n';
T9n.setLanguage('en');
import { en } from 'meteor-accounts-t9n/build/en';
T9n.map("en", en);

AT.prototype.atTitleHelpers = {
  title: function() {
    var parentData = Template.currentData();
    var state = (parentData && parentData.state) || AccountsTemplates.getState();
    return T9n.get(AccountsTemplates.texts.title[state], markIfMissing = false);
  },
};
