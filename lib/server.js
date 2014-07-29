// Initialization
AT.prototype.init = function() {
    if (this._initialized)
        return;

    // A password field is strictly required
    var password = this.getField('password');
    if (!password)
        throw Error("A password field is strictly required!");
    if (password.type !== "password")
        throw Error("The type of password field should be password!");

    // Then we can have 'username' or 'email' or even both of them
    // but at least one of the two is strictly required
    var username = this.getField('username');
    var email = this.getField('email');
    if (!username && !email)
        throw Error("At least one field out of 'username' and 'email' is strictly required!");
    if (username && !username.required)
        throw Error("The username field should be required!");
    if (email){
        if (email.type !== "email")
            throw Error("The type of email field should be email!");
        if (username){
            // username and email
            if (username.type !== "text")
                throw Error("The type of username field should be text when email field is present!");
        }else{
            // email only
            if (!email.required)
                throw Error("The email field should be required when username is not present!");
        }
    }
    else{
        // username only
        if (username.type !== "email" && username.type !== "text")
            throw Error("The type of username field should be email or text!");
    }

    // Possibly publish more user data in order to be able to show add/remove
    // buttons for 3rd-party services
    if (this.getConfig('showAddRemoveServices')){
        // Publish additional current user info to get the list of registered services
        // XXX TODO:
        // ...adds only user.services.*.id
        Meteor.publish("userRegisteredServices", function() {
            var userId = this.userId;
            return Meteor.users.find(userId, {fields: {services: 1}});
            /*
            if (userId){
                var user = Meteor.users.findOne(userId);
                var services_id = _.chain(user.services)
                    .keys()
                    .reject(function(service){return service === "resume";})
                    .map(function(service){return 'services.' + service + '.id';})
                    .value();
                var projection = {};
                _.each(services_id, function(key){projection[key] = 1;});
                return Meteor.users.find(userId, {fields: projection});
            }
            */
        });
    }
    // ------------
    // Server-Side Routes Definition
    //
    //   this allows for server-side iron-router usage, like, e.g.
    //   Router.map(function(){
    //       this.route('fullPageSigninForm', {
    //           path: '*',
    //           where: 'server'
    //           action: function() {
    //               this.response.statusCode = 404;
    //               return this.response.end(Handlebars.templates['404']());
    //           }
    //       });
    //   })
    // ------------
    Router.map(function() {
        this.route(AccountsTemplates.getConfig('resetPwdRouteName') || 'atResetPwd', {
            path: 'reset-password/:paramToken',
        });
        this.route(AccountsTemplates.getConfig('enrollAccountRouteName') || 'atEnrollAccount', {
            path: 'enroll-account/:paramToken',
        });

        // Possibly sets up sign in route
        var signInRoutePath = AccountsTemplates.getConfig('signInRoutePath');
        if (signInRoutePath){
            this.route( AccountsTemplates.getConfig('signInRouteName') || 'signIn', {
                path: signInRoutePath,
            });
        }

        // Possibly sets up sign up route
        var signUpRoutePath = AccountsTemplates.getConfig('signUpRoutePath');
        if (signUpRoutePath){
            this.route( AccountsTemplates.getConfig('signUpRouteName') || 'signUp', {
                path: signUpRoutePath,
            });
        }

        if (AccountsTemplates.getConfig('showForgotPasswordLink')){
            // Possibly prints a warning in case the MAIL_URL environment variable was not set
            if (!process.env.MAIL_URL || ! Package['email'])
                console.log('AccountsTemplates - WARNING: showForgotPasswordLink set to true, but MAIL_URL is not configured!');

            // Possibly sets up forgot password route
            var forgotPwdRoutePath = AccountsTemplates.getConfig('forgotPwdRoutePath');
            if (forgotPwdRoutePath){
                this.route( AccountsTemplates.getConfig('forgotPwdRouteName') || 'forgotPwd', {
                    path: forgotPwdRoutePath,
                });
            }
        }
    });

    // Marks AccountsTemplates as initialized
    this._initialized = true;
};

AccountsTemplates = new AT();


// Client side account creation is disabled by default:
// the methos ATCreateUserServer is used instead!
// to actually disable client side account creation use:
//
//    AccountsTemplates.config({
//        forbidClientAccountCreation: true
//    });
Accounts.config({
    forbidClientAccountCreation: true
});

Accounts.urls.resetPassword = function(token){
    return Meteor.absoluteUrl('reset-password/' + token);
};
Accounts.urls.enrollAccount = function(token){
    return Meteor.absoluteUrl('enroll-account/' + token);
};