AT.prototype.atTitleHelpers = {
    title: function(){
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return AccountsTemplates.translate(AccountsTemplates.texts.title[state]);
    },
};