AT.prototype.atSigninLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    signInLink: function(){
        return AccountsTemplates.getRoutePath("signIn");
    },
    preText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.signInLink_pre);
    },
    linkText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.signInLink_link);
    },
    suffText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.signInLink_suff);
    },
};

AT.prototype.atSigninLinkEvents = {
    "click #at-signIn": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick("signIn");
    },
};