AT.prototype.atTermsLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.isDisabled() ? 'disabled' : '';
    },
    privacyUrl: function(){
        return AccountsTemplates.getConfig('privacyUrl');
    },
    showTermsAnd: function(){
        return !!AccountsTemplates.getConfig('privacyUrl') && !!AccountsTemplates.getConfig('termsUrl');
    },
    termsUrl: function(){
        return AccountsTemplates.getConfig('termsUrl');
    },
};
