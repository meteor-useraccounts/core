AT.prototype.atErrorHelpers = {
    error: function() {
        return AccountsTemplates.getFieldError('overall');
    },
    errorText: function(){
        return T9n.get(this.valueOf(), markIfMissing=false);
    },
};