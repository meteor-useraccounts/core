AT.prototype.atSignupLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    text: function(){
        return T9n.get("dontHaveAnAccount");
    },
    signUpLink: function(){
        return AccountsTemplates.getRoutePath("signUp");
    },
    preText: function(){
        return T9n.get(AccountsTemplates.options.signUpLink_pre, markIfMissing=false);
    },
    linkText: function(){
        return T9n.get(AccountsTemplates.options.signUpLink_link, markIfMissing=false);
    },
    suffText: function(){
        return T9n.get(AccountsTemplates.options.signUpLink_suff, markIfMissing=false);
    },
};

AT.prototype.atSignupLinkEvents = {
    "click #at-signUp": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick('signUp');
    },
};