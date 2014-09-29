AT.prototype.atTitleHelpers = {
    title: function(){
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return T9n.get(AccountsTemplates.title[state], markIfMissing=false);
    },
};