import { T9n } from 'meteor-accounts-t9n';
T9n.setLanguage('en');
import { en } from 'meteor-accounts-t9n/build/en';
T9n.map("en", en);

AT.prototype.atMessageHelpers = {
    message: function() {
        var messageText = AccountsTemplates.state.form.get("message");
        if (messageText)
            return T9n.get(messageText, markIfMissing=false);
    },
};
