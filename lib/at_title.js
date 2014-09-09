AT.prototype.atTitleHelpers = {
    title: function(){
        var state = this.state || AccountsTemplates.getState();
        return T9n.get(AccountsTemplates.title[state], markIfMissing=false);
    }
};