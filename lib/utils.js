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

otherLoginServices = function(){
    return !!Accounts.oauth && Accounts.oauth.serviceNames().length > 0;
};

isEmail = function(email){
    var format = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    return (email.match(format));
}
