AT.prototype.atTermsLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    text: function(){
        return T9n.get(AccountsTemplates.texts.termsPreamble);
    },
    privacyUrl: function(){
        return AccountsTemplates.options.privacyUrl;
    },
    privacyLinkText: function(){
        return T9n.get(AccountsTemplates.texts.termsPrivacy);
    },
    showTermsAnd: function(){
        return !!AccountsTemplates.options.privacyUrl && !!AccountsTemplates.options.termsUrl;
    },
    and: function(){
        return T9n.get(AccountsTemplates.texts.termsAnd);
    },
    termsUrl: function(){
        return AccountsTemplates.options.termsUrl;
    },
    termsLinkText: function(){
        return T9n.get(AccountsTemplates.texts.termsTerms);
    },
};

AT.prototype.atTermsLinkEvents = {
    "click a": function(event) {
        if (AccountsTemplates.disabled())
            event.preventDefault();
    },
};