AT.prototype.atSocialHelpers = {
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
    name: function(){
        return this._id;
    },
    buttonText: function() {
        var service = this;
        var serviceName = capitalize(service._id);
        if (!service.configured)
            return T9n.get('configure') + ' ' + serviceName;
        var showAddRemove = AccountsTemplates.getConfig('showAddRemoveServices');
        var user = Meteor.user();
        if (user && showAddRemove){
            if (user.services && user.services[this.toString()]){
                var numServices = _.keys(user.services).length; // including 'resume'
                if (numServices === 2)
                    return serviceName;
                else
                    return T9n.get('remove') + ' ' + serviceName;
            } else
                    return T9n.get('add') + ' ' + serviceName;
        }
        var parentData = UI._parentData(1);
        var state = (parentData && parentData.state) || AccountsTemplates.getState();
        return (state === "signIn" ? T9n.get('signIn') : T9n.get('signUp')) + ' ' + T9n.get('with') + ' ' + serviceName;
    },
    iconClass: function() {
        return 'fa fa-' + this._id;
    },
};

AT.prototype.atSocialEvents = {
    'click button': function(event, t) {
        event.preventDefault();
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