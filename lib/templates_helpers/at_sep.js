import { T9n } from 'meteor-accounts-t9n';
T9n.setLanguage('en');
import { en } from 'meteor-accounts-t9n/build/en';
T9n.map("en", en);

AT.prototype.atSepHelpers = {
    sepText: function(){
        return T9n.get(AccountsTemplates.texts.sep, markIfMissing=false);
    },
};
