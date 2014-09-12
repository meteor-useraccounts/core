AT.prototype.atPwdLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    forgotPwdLink: function(){
        return AccountsTemplates.getRoutePath('forgotPwd');
    },
};