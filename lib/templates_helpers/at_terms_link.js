import { T9n } from 'meteor-accounts-t9n';
T9n.setLanguage('en');
import { en } from 'meteor-accounts-t9n/build/en';
T9n.map("en", en);

AT.prototype.atTermsLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    text: function(){
        return T9n.get(AccountsTemplates.texts.termsPreamble, markIfMissing=false);
    },
    privacyUrl: function(){
        return AccountsTemplates.options.privacyUrl;
    },
    privacyLinkText: function(){
        return T9n.get(AccountsTemplates.texts.termsPrivacy, markIfMissing=false);
    },
    showTermsAnd: function(){
        return !!AccountsTemplates.options.privacyUrl && !!AccountsTemplates.options.termsUrl;
    },
    and: function(){
        return T9n.get(AccountsTemplates.texts.termsAnd, markIfMissing=false);
    },
    termsUrl: function(){
        return AccountsTemplates.options.termsUrl;
    },
    termsLinkText: function(){
        return T9n.get(AccountsTemplates.texts.termsTerms, markIfMissing=false);
    },
};

AT.prototype.atTermsLinkEvents = {
    "click a": function(event) {
        if (AccountsTemplates.disabled())
            event.preventDefault();
    },
};
