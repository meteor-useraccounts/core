AT.prototype.atPwdLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.isDisabled() ? 'disabled' : '';
    },
    forgotPwdLink: function(){
        return AccountsTemplates.getRoutePath('forgotPwd');
    },
};