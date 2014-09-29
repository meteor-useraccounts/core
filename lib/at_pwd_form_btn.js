AT.prototype.atPwdFormBtnHelpers = {
    submitDisabled: function(){
        var errors = _.map(AccountsTemplates.getFieldIds(), function(name){
            return AccountsTemplates.state.fields.get(name);
        });
        if (_.some(errors))
            return "disabled";
    },
    buttonText: function() {
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return T9n.get(AccountsTemplates.buttonText[state], markIfMissing=false);
    },
};