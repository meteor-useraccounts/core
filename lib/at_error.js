AT.prototype.atErrorHelpers = {
    error: function() {
        return AccountsTemplates.state.form.get('error');
    },
    errorText: function(){
        return T9n.get(this.valueOf(), markIfMissing=false);
    },
};