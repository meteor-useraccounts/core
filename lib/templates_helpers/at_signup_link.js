AT.prototype.atSignupLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    signUpLink: function(){
        return AccountsTemplates.getRoutePath("signUp");
    },
    preText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.signUpLink_pre);
    },
    linkText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.signUpLink_link);
    },
    suffText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.signUpLink_suff);
    },
};

AT.prototype.atSignupLinkEvents = {
    "click #at-signUp": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick('signUp');
    },
};