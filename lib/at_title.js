AT.prototype.atTitleHelpers = {
    title: function(){
    	var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return T9n.get(AccountsTemplates.title[state], markIfMissing=false);
    }
};