AT.prototype.atFormHelpers = {
  hide: function() {
    var state = this.state || AccountsTemplates.getState();

    return state === "hide";
  },

  showTitle: function(nextState) {
    var state = nextState || this.state || AccountsTemplates.getState();

    if (Meteor.userId() && state === "signIn") {
      return false;
    }

    return !!AccountsTemplates.texts.title[state];
  },

  showOauthServices: function(nextState) {
    var state = nextState || this.state || AccountsTemplates.getState();
    var services = AccountsTemplates.oauthServices();

    if (!(state === "signIn" || state === "signUp")) {
      return false;
    }

    if (!services.length) {
      return false;
    }

    if (Meteor.userId()) {
      return AccountsTemplates.options.showAddRemoveServices;
    }

    return true;
  },

  showServicesSeparator: function(nextState) {
    var pwdService = !_.isUndefined(Package["accounts-password"]);
    var state = nextState || this.state || AccountsTemplates.getState();
    var rightState = (state === "signIn" || state === "signUp");

    return rightState && !Meteor.userId() && pwdService && AccountsTemplates.oauthServices().length;
  },

  showError: function(nextState) {
    return !!AccountsTemplates.state.form.get("error");
  },

  showResult: function(nextState) {
    return !!AccountsTemplates.state.form.get("result");
  },

  showMessage: function(nextState) {
    return !!AccountsTemplates.state.form.get("message");
  },

  showPwdForm: function(nextState) {
    var state = nextState || this.state || AccountsTemplates.getState();

    if (_.isUndefined(Package["accounts-password"])) {
      return false;
    }

    if ((state === "verifyEmail") || (state === "signIn" && Meteor.userId())) {
      return false;
    }

    return true;
  },

  showSignInLink: function(nextState) {
    var state = nextState || this.state || AccountsTemplates.getState();

    if (AccountsTemplates.options.hideSignInLink) {
      return false;
    }

    if (AccountsTemplates.options.forbidClientAccountCreation && state === "forgotPwd") {
      return true;
    }

    return state === "signUp";
  },

  showSignUpLink: function(nextState) {
    var state = nextState || this.state || AccountsTemplates.getState();

    if  (AccountsTemplates.options.hideSignUpLink) {
      return false;
    }

    return ((state === "signIn" && !Meteor.userId()) || state === "forgotPwd") && !AccountsTemplates.options.forbidClientAccountCreation;
  },

  showTermsLink: function(nextState) {
    //TODO: Add privacyRoute and termsRoute as alternatives (the point of named routes is
    // being able to change the url in one place only)
    if (!!AccountsTemplates.options.privacyUrl || !!AccountsTemplates.options.termsUrl) {
      var state = nextState || this.state || AccountsTemplates.getState();

      if (state === "signUp" || state === "enrollAccount" ) {
        return true;
      }
    }
    /*
    if (state === "signIn") {
      var pwdService = Package["accounts-password"] !== undefined;
      if (!pwdService)
        return true;
    }
    */
    return false;
  },

  showResendVerificationEmailLink: function() {
    var parentData = Template.currentData();
    var state = (parentData && parentData.state) || AccountsTemplates.getState();

    return (state === "signIn" || state === "forgotPwd") && AccountsTemplates.options.showResendVerificationEmailLink;
  },
};
