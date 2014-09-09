AT.prototype.atSignupLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.isDisabled() ? 'disabled' : '';
    },
    signUpLink: function(){
        return AccountsTemplates.getRoutePath('signUp');
    },
};
