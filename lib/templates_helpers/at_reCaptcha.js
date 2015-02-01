AT.prototype.atReCaptchaRendered = function() {
    $.getScript('https://www.google.com/recaptcha/api.js');
};

AT.prototype.atReCaptchaHelpers = {
    key: function() {
        if (Meteor.settings.public.reCaptcha && Meteor.settings.public.reCaptcha.siteKey)
            return Meteor.settings.public.reCaptcha.siteKey;
        return AccountsTemplates.options.reCaptcha.siteKey;
    },

    theme: function() {
        return AccountsTemplates.options.reCaptcha.theme;
    },

    data_type: function() {
        return AccountsTemplates.options.reCaptcha.data_type;
    },
};
