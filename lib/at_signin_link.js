AT.prototype.atSigninLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.isDisabled() ? 'disabled' : '';
    },
    signInLink: function(){
        return AccountsTemplates.getRoutePath('signIn');
    },
};