AT.prototype.atNavButtonHelpers = {
  text: function() {
    var key;

    if (Meteor.userId()) {
      key = AccountsTemplates.texts.navSignOut;
    } else {
      key = AccountsTemplates.texts.navSignIn;
    }

    return T9n.get(key, markIfMissing = false);
  }
};

AT.prototype.atNavButtonEvents = {
  'click #at-nav-button': function(event){
    event.preventDefault();

    if (Meteor.userId()){
      AccountsTemplates.logout();
    } else {
      AccountsTemplates.linkClick("signIn");
    }
  },
};
