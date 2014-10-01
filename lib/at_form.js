AT.prototype.atFormHelpers = {
    hide: function(){
        var state = this.state || AccountsTemplates.getState();
        return state === "hide";
    },
    showTitle: function(next_state){
        var state = next_state || this.state || AccountsTemplates.getState();
        if (state === "verifyEmail" || (Meteor.user() && state === "signIn"))
            return false;
        return true;
        //return !(state === "signIn" && AccountsTemplates.oauthServices().length);
    },
    showOauthServices: function(next_state){
        var state = next_state || this.state || AccountsTemplates.getState();
        if (!(state === "signIn" || state === "signUp"))
            return false;
        var services = AccountsTemplates.oauthServices();
        if (!services.length)
            return false;
        if (Meteor.user())
            return AccountsTemplates.options.showAddRemoveServices;
        return true;
    },
    showServicesSeparator: function(next_state){
        var pwdService = Package["accounts-password"] !== undefined;
        var state = next_state || this.state || AccountsTemplates.getState();
        var rightState = (state === "signIn" || state === "signUp");
        return rightState && !Meteor.user() && pwdService && AccountsTemplates.oauthServices().length;
    },
    showError: function(next_state) {
        return !!AccountsTemplates.state.form.get("error");
    },
    showResult: function(next_state) {
        return !!AccountsTemplates.state.form.get("result");
    },
    showPwdForm: function(next_state) {
        if (Package["accounts-password"] === undefined)
            return false;
        var state = next_state || this.state || AccountsTemplates.getState();
        if ((state === "verifyEmail") || (state === "signIn" && Meteor.user()))
            return false;
        return true;
    },
    showSignInLink: function(next_state){
        var state = next_state || this.state || AccountsTemplates.getState();
        //return state === "signUp" || state === "forgotPwd";
        return state === "signUp";
    },
    showSignUpLink: function(next_state){
        var state = next_state || this.state || AccountsTemplates.getState();
        return ((state === "signIn" && !Meteor.user()) || state === "forgotPwd") && !AccountsTemplates.options.forbidClientAccountCreation;
    },
    showTermsLink: function(next_state){
        var state = next_state || this.state || AccountsTemplates.getState();
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
