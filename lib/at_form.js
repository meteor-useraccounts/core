AT.prototype.atFormHelpers = {
    hide: function(){
        var state = this.state || AccountsTemplates.getState();
        return state === "hide";
    },
    showTitle: function(){
        var state = this.state || AccountsTemplates.getState();
        if (state === "verifyEmail" || (Meteor.user() && state === "signIn"))
            return false;
        return !(state === "signIn" && AccountsTemplates.oauthServices().length);
    },
    showSignInLink: function(){
        var state = this.state || AccountsTemplates.getState();
        return state === "signUp" || state === "forgotPwd";
    },
    showOauthServices: function(){
        var state = this.state || AccountsTemplates.getState();
        if (!(state === "signIn" || state === "signUp"))
            return false;
        var services = AccountsTemplates.oauthServices();
        if (!services.length)
            return false;
        if (Meteor.user())
            return AccountsTemplates.options.showAddRemoveServices;
        return true;
    },
    showServicesSeparator: function(){
        var pwdService = Package["accounts-password"] !== undefined;
        var state = this.state || AccountsTemplates.getState();
        var rightState = (state === "signIn" || state === "signUp");
        return rightState && !Meteor.user() && pwdService && AccountsTemplates.oauthServices().length;
    },
    showError: function() {
        return !!AccountsTemplates.state.form.get("error");
    },
    showResult: function() {
        return !!AccountsTemplates.state.form.get("result");
    },
    showPwdForm: function() {
        if (Package["accounts-password"] === undefined)
            return false;
        var state = this.state || AccountsTemplates.getState();
        if ((state === "verifyEmail") || (state === "signIn" && Meteor.user()))
            return false;
        return true;
    },
    showSignUpLink: function(){
        var state = this.state || AccountsTemplates.getState();
        return ((state === "signIn" && !Meteor.user()) || state === "forgotPwd") && !AccountsTemplates.options.forbidClientAccountCreation;
    },
    showTermsLink: function(){
        var state = this.state || AccountsTemplates.getState();
        if (state === "signUp" && (!!AccountsTemplates.options.privacyUrl || !!AccountsTemplates.options.termsUrl))
            return true;
        /*
        if (state === "signIn"){
            var pwdService = Package["accounts-password"] !== undefined;
            if (!pwdService)
                return true;
        }
        */
        return false;
    },
};