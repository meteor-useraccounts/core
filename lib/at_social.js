AT.prototype.atSocialHelpers = {
    disabled: function() {
        if (AccountsTemplates.disabled())
            return "disabled";
        var user = Meteor.user();
        if (user){
            var numServices = 0;
            if (user.services)
                numServices = _.keys(user.services).length; // including "resume"
            if (numServices === 2 && user.services[this._id])
                return "disabled";
        }
    },
    name: function(){
        return this._id;
    },
    iconClass: function() {
        return "fa fa-" + this._id;
    },
    buttonText: function() {
        var service = this;
        var serviceName = capitalize(service._id);
        if (!service.configured)
            return T9n.get("configure") + " " + serviceName;
        var showAddRemove = AccountsTemplates.options.showAddRemoveServices;
        var user = Meteor.user();
        if (user && showAddRemove){
            if (user.services && user.services[this._id]){
                var numServices = _.keys(user.services).length; // including "resume"
                if (numServices === 2)
                    return serviceName;
                else
                    return T9n.get("remove") + " " + serviceName;
            } else
                    return T9n.get("add") + " " + serviceName;
        }
        var parentData = UI._parentData(2);
        var state = AccountsTemplates.getState();
        return (state === "signIn" ? T9n.get("signIn") : T9n.get("signUp")) + " " + T9n.get("with") + " " + serviceName;
    },
};

AT.prototype.atSocialEvents = {
    "click button": function(event, t) {
        event.preventDefault();
        t.find("button").blur();
        if (AccountsTemplates.disabled())
            return;
        var user = Meteor.user();
        if (user && user.services && user.services[this._id]){
            var numServices = _.keys(user.services).length; // including "resume"
            if (numServices === 2)
                return;
            else{
                AccountsTemplates.setDisabled(true);
                Meteor.call("ATRemoveService", this._id, function(error){
                    AccountsTemplates.setDisabled(false);
                });
            }
        } else {
            AccountsTemplates.setDisabled(true);
            var serviceName = this._id;
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
            loginWithService(options, function(err) {
                AccountsTemplates.setDisabled(false);
                if (err && err instanceof Accounts.LoginCancelledError) {
                    // do nothing
                }
                else if (err && err instanceof ServiceConfiguration.ConfigError) {
                    if (Accounts._loginButtonsSession)
                        return Accounts._loginButtonsSession.configureService(serviceName);
                }
                else {
                    var state = AccountsTemplates.getState();
                    AccountsTemplates.submitCallback(err, state);
                }
            });
        }
    },
};