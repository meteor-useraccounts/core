T9n = (require('meteor-accounts-t9n')).T9n;

AT.prototype.atMessageHelpers = {
    message: function() {
        var messageText = AccountsTemplates.state.form.get("message");
        if (messageText)
            return T9n.get(messageText, markIfMissing=false);
    },
};
