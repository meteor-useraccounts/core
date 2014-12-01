AT.prototype.atErrorHelpers = {
    error: function() {
        return AccountsTemplates.state.form.get("error");
    },
    errorText: function(){
        var field, err;
        if (this.field){
            field = AccountsTemplates.translate(this.field);
            err = AccountsTemplates.translate(this.err);
        }
        else
            err = AccountsTemplates.translate(this.valueOf());

        // Possibly removes initial prefix in case the key in not found inside t9n
        if (err.substring(0, 15) === "error.accounts.")
            err = err.substring(15);

        if (field)
            return field + ": " + err;
        return err;
    },
};
