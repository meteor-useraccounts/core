import { T9n } from 'meteor-accounts-t9n';
T9n.setLanguage('en');
import { en } from 'meteor-accounts-t9n/build/en';
T9n.map("en", en);

AT.prototype.atSignupLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    signUpLink: function(){
        return AccountsTemplates.getRoutePath("signUp");
    },
    preText: function(){
        return T9n.get(AccountsTemplates.texts.signUpLink_pre, markIfMissing=false);
    },
    linkText: function(){
        return T9n.get(AccountsTemplates.texts.signUpLink_link, markIfMissing=false);
    },
    suffText: function(){
        return T9n.get(AccountsTemplates.texts.signUpLink_suff, markIfMissing=false);
    },
};

AT.prototype.atSignupLinkEvents = {
    "click #at-signUp": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick('signUp');
    },
};
