capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

signedInAs =  function() {
    var user = Meteor.user();
    if (user) {
        if (user.username) {
            return user.username;
        } else if (user.profile && user.profile.name) {
            return user.profile.name;
        } else if (user.emails && user.emails[0]) {
            return user.emails[0].address;
        } else {
            return "Signed In";
        }
    }
};

oauthServices = function(){
    // Extracts names of available services
    var names = (Accounts.oauth && Accounts.oauth.serviceNames()) || [];

    // Extracts names of configured services
    var configuredServices = [];
    if (Accounts.loginServiceConfiguration)
        configuredServices = _.pluck(Accounts.loginServiceConfiguration.find().fetch(), 'service');
    
    // Builds a list of objects containing service name as _id and its configuration status
    var services = _.map(names, function(name){
        return {
            _id : name,
            configured: _.contains(configuredServices, name),
        };
    });

    // Checks whether there is a UI to configure services...
    // XXX: this only works with the accounts-ui package
    var showUnconfigured = typeof Accounts._loginButtonsSession !== "undefined";

    // Filters out unconfigured services in case they're not to be displayed
    if (!showUnconfigured){
        services = _.filter(services, function(service){
            return service.configured;
        });
    }

    // Sorts services by name
    services = _.sortBy(services, function(service){
        return service._id;
    });

    return services;
};