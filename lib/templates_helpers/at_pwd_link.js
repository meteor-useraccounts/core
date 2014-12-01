AT.prototype.atPwdLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    forgotPwdLink: function(){
        return AccountsTemplates.getRoutePath("forgotPwd");
    },
    preText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.pwdLink_pre);
    },
    linkText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.pwdLink_link);
    },
    suffText: function(){
        return AccountsTemplates.translate(AccountsTemplates.texts.pwdLink_suff);
    },
};

AT.prototype.atPwdLinkEvents = {
    "click #at-forgotPwd": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick("forgotPwd");
    },
};