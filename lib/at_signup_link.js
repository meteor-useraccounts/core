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
    linkText: function(){
        return T9n.get("signUp");
    },
};

AT.prototype.atSignupLinkEvents = {
    "click #at-signUp": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick('signUp');
    },
};