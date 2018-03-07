T9n = (require('meteor-accounts-t9n')).T9n;

AT.prototype.atSepHelpers = {
    sepText: function(){
        return T9n.get(AccountsTemplates.texts.sep, markIfMissing=false);
    },
};
