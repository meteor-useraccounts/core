AT.prototype.atSigninLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    text: function(){
        return T9n.get("ifYouAlreadyHaveAnAccount");
    },
    signInLink: function(){
        return AccountsTemplates.getRoutePath("signIn");
    },
    linkText: function(){
        return T9n.get("signin");
    },
};

AT.prototype.atSigninLinkEvents = {
    "click #at-signIn": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick("signIn");
    },
};