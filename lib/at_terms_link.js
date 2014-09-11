AT.prototype.atTermsLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.isDisabled() ? 'disabled' : '';
    },
    privacyUrl: function(){
        return AccountsTemplates.options.privacyUrl;
    },
    showTermsAnd: function(){
        return !!AccountsTemplates.options.privacyUrl && !!AccountsTemplates.options.termsUrl;
    },
    termsUrl: function(){
        return AccountsTemplates.options.termsUrl;
    },
};
