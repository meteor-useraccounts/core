AT.prototype.atSocialHelpers = {
    buttonText: function() {
        var service = capitalize(this);
        var unconfigured = Accounts.loginServiceConfiguration.find({
            service: this.toString()
        }).fetch().length === 0;
        if (unconfigured)
            return T9n.get('configure') + ' ' + service;
        var showAddRemove = AccountsTemplates.getConfig('showAddRemoveServices');
        var user = Meteor.user();
        if (user && showAddRemove){
            if (user.services && user.services[this.toString()]){
                var numServices = _.keys(user.services).length; // including 'resume'
                if (numServices === 2)
                    return service;
                else
                    return T9n.get('remove') + ' ' + service;
            } else
                    return T9n.get('add') + ' ' + service;
        }
        return T9n.get('signIn') + ' ' + T9n.get('with') + ' ' + service;
    },
    disabled: function() {
        if (AccountsTemplates.isDisabled())
            return 'disabled';
        var user = Meteor.user();
        if (user){
            var numServices = 0;
            if (user.services)
                numServices = _.keys(user.services).length; // including 'resume'
            if (numServices === 2 && user.services[this])
                return 'disabled';
        }
    },
    iconClass: function() {
        var classStr = 'fa fa-' + this.toString();
        return classStr;
    },
    show: function() {
        var serviceName = this.toString();
        var unconfigured = Accounts.loginServiceConfiguration.find({
            service: serviceName
        }).fetch().length === 0;
        if (unconfigured){
            var showUnconfigured = typeof Accounts._loginButtonsSession !== "undefined";
            return showUnconfigured;
        }
        var user = Meteor.user();
        var showAddRemove = AccountsTemplates.getConfig('showAddRemoveServices');
        return !user || showAddRemove;
    }
};

AT.prototype.atSocialEvents = {
    'click button': function(event, t) {
        event.preventDefault();
        event.stopPropagation();
        t.find('button').blur();
        if (AccountsTemplates.isDisabled())
            return;
        var user = Meteor.user();
        if (user && user.services && user.services[this.toString()]){
            var numServices = _.keys(user.services).length; // including 'resume'
            if (numServices === 2)
                return;
            else{
                AccountsTemplates.setDisabled(true);
                Meteor.call('ATRemoveService', this.toString(), function(error){
                    AccountsTemplates.setDisabled(false);
                });
            }
        } else {
            AccountsTemplates.setDisabled(true);
            var serviceName = this.toString();
            var loginWithService = Meteor["loginWith" + capitalize(serviceName)];
            options = {};
            if (Accounts.ui) {
                if (Accounts.ui._options.requestPermissions[serviceName]) {
                    options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
                }
                if (Accounts.ui._options.requestOfflineToken[serviceName]) {
                    options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
                }
            }
            loginWithService(options, function(err, melddUsers) {
                AccountsTemplates.setDisabled(false);
                if (!err) {
                    var previousPath = AccountsTemplates.getPrevPath();
                    if (previousPath)
                        return Router.go(previousPath);
                } else if (err instanceof Accounts.LoginCancelledError) {
                    // do nothing
                } else if (err instanceof ServiceConfiguration.ConfigError) {
                    if (Accounts._loginButtonsSession)
                        return Accounts._loginButtonsSession.configureService(serviceName);
                } else {
                    console.log('error', err);
                    //return loginButtonsSession.errorMessage(err.reason || "Unknown error");
                    //Accounts._loginButtonsSession.errorMessage(err.reason || i18n("error.unknown"))
                }
            });
        }
    },
};