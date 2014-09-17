AT.prototype.atTermsLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    text: function(){
        return T9n.get("clickAgree");
    },
    privacyUrl: function(){
        return AccountsTemplates.options.privacyUrl;
    },
    privacyLinkText: function(){
        return T9n.get("privacyPolicy");
    },
    showTermsAnd: function(){
        return !!AccountsTemplates.options.privacyUrl && !!AccountsTemplates.options.termsUrl;
    },
    and: function(){
        return T9n.get("and");
    },
    termsUrl: function(){
        return AccountsTemplates.options.termsUrl;
    },
    termsLinkText: function(){
        return T9n.get("terms");
    },
};

AT.prototype.atTermsLinkEvents = {
    "click a": function(event) {
        if (AccountsTemplates.disabled())
            event.preventDefault();
    },
};