AT.prototype.atPwdFormBtnHelpers = {
    submitDisabled: function(){
        var errors = _.map(AccountsTemplates.getFields(), function(field){
            return field.hasError();
        });
        if (_.some(errors))
            return "disabled";
    },
    buttonText: function() {
        var parentData = Template.parentData();
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return AccountsTemplates.translate(AccountsTemplates.texts.button[state]);
    },
};
