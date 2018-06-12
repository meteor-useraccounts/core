import { T9n } from 'meteor-accounts-t9n';
T9n.setLanguage('en');
import { en } from 'meteor-accounts-t9n/build/en';
T9n.map("en", en);

AT.prototype.atPwdFormBtnHelpers = {
    submitDisabled: function(){
        var disable = _.chain(AccountsTemplates.getFields())
            .map(function(field){
                return field.hasError() || field.isValidating();
            })
            .some()
            .value()
        ;
        if (disable)
            return "disabled";
    },
    buttonText: function() {
        var parentData = Template.currentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return T9n.get(AccountsTemplates.texts.button[state], markIfMissing=false);
    },
};
