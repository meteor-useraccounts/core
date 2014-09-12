AT.prototype.atTermsLinkHelpers = {
    disabled: function() {
        return AccountsTemplates.disabled();
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

AT.prototype.atTermsLinkEvents = {
    // Click forgot password, sign in, or sign up link
    'click a': function(event) {
        console.log('click');
        if (AccountsTemplates.disabled())
            event.preventDefault();
    },
};