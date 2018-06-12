import { T9n } from 'meteor-accounts-t9n';
T9n.setLanguage('en');
import { en } from 'meteor-accounts-t9n/build/en';
T9n.map("en", en);

AT.prototype.atResultHelpers = {
    result: function() {
        var resultText = AccountsTemplates.state.form.get("result");
        if (resultText)
            return T9n.get(resultText, markIfMissing=false);
    },
};
