AT.prototype.atNavButtonHelpers = {
    text: function(){
        var key = Meteor.user() ? AccountsTemplates.texts.navSignOut : AccountsTemplates.texts.navSignIn;
        return AccountsTemplates.translate(key);
    }
};

AT.prototype.atNavButtonEvents = {
    'click #at-nav-button': function(event){
        if (Meteor.user())
            AccountsTemplates.logout();
        else
            Router.go('atSignIn');
    },
};