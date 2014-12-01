AT.prototype.atResultHelpers = {
    result: function() {
        var resultText = AccountsTemplates.state.form.get("result");
        if (resultText)
            return AccountsTemplates.translate(resultText);
    },
};