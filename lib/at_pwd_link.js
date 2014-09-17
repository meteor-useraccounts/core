AT.prototype.atPwdLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
    },
    forgotPwdLink: function(){
        return AccountsTemplates.getRoutePath("forgotPwd");
    },
    linkText: function(){
        return T9n.get("forgotPassword");
    },
};

AT.prototype.atPwdLinkEvents = {
    "click #at-forgotPwd": function(event, t) {
        event.preventDefault();
        AccountsTemplates.linkClick("forgotPwd");
    },
};