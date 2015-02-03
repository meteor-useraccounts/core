AT.prototype.atCancelButtonHelpers = {
    buttonText: function(){
        return T9n.get(AccountsTemplates.texts.button.cancel, markIfMissing=false);
    }
};

AT.prototype.atCancelButtonEvents = {
    'click #at-cancel-btn': function(event){
        Router.go(AccountsTemplates.getRouteName('signIn'))
    },
};