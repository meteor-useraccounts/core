AT.prototype.atSignupLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    signUpLink: function(){
        return AccountsTemplates.getRoutePath('signUp');
    },
};
