AT.prototype.atSigninLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    signInLink: function(){
        return AccountsTemplates.getRoutePath('signIn');
    },
};