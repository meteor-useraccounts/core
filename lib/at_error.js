AT.prototype.atErrorHelpers = {
    error: function() {
        return AccountsTemplates.state.form.get("error");
    },
    errorText: function(){
        if (this.field){
            var err = T9n.get(this.err, markIfMissing=false);
            // Possibly removes initial prefix in case the key in not found inside t9n
            if (err.substring(0, 15) === "error.accounts.")
                err = err.substring(15);
            return T9n.get(this.field, markIfMissing=false) + ": " + err;
        }
        return T9n.get(this.valueOf(), markIfMissing=false);
    },
};