updateEmails = function(info) {
    // Picks up the user object
    var user = info.user;
    var toBeUpdated = false;
    // Picks up current emails field
    var current_emails = user.emails || [];
    // Updates or adds all emails found inside services
    _.map(user.services, function(service, service_name) {
        if (service_name === 'resume' || service_name === 'email' || service_name === 'password')
            return;
        // Picks up the email address from the service
        // NOTE: differente sercives use different names for the email filed!!!
        //       so far, `email` and `emailAddress` were found but it may be the
        //       new names should be added to support all 3rd-party packages!
        var email = service.email || service.emailAddress;
        var verified = false;
        // Tries to determine whether the 3rd-party email was verified
        // NOTE: so far only for the service `google` it was found a field
        //       called `verified_email`. But it may be that new names 
        //       should be atted to better support all 3rd-party packages!
        if (service_name === 'facebook')
            verified = true; // Facebook doesn't permite the use of the account unless email is confirmed!
        else if (service.verified_email)
            verified = true;

        // Look for the same email address inside current_emails
        // email_id === -1 means not found!
        var email_id = _.chain(current_emails)
            .map(function(e) {return e.address === email;})
            .indexOf(true)
            .value();
        if (email_id === -1) {
            // In case the email is not present, adds it to the array
            current_emails.push({
                address: email,
                verified: verified
            });
            toBeUpdated = true;
        } else {
            if (verified && !current_emails[email_id].verified) {
                // If the email was found but its verified state should be promoted
                // to true, updates the array element
                toBeUpdated = true;
                current_emails[email_id].verified = true;
            }
        }
    });
    // Extracts current services emails
    var services_emails = [];
    if (user.services.password)
    // If password is among services, adds the password email not to delete it...
        services_emails.push(current_emails[0].address);
    _.map(user.services, function(service, service_name) {
        if (service_name === 'resume' || service_name === 'email' || service_name === 'password')
            return;
        var email = service.email || service.emailAddress;
        if (email && _.indexOf(services_emails, email) == -1)
            services_emails.push(email);
    });
    // Keeps only emails from the current emails field which
    // also appears inside services_emails
    // ...some email address might have 
    var emails = _.reject(current_emails, function(email) {
        return _.indexOf(services_emails, email.address) == -1;
    });
    // Eventually checks whether to update the emails field
    //if (toBeUpdated)
    //    Meteor.users.update({_id: user._id}, {$set: {emails: emails}});
    Meteor.users.update({_id: user._id}, {$set: {registered_emails: emails}});
    // Updates also current user object to be later used during the same callback...
    user.registered_emails = emails;
};

// Sets up an index on registered_emails
Meteor.users._ensureIndex('registered_emails.address');
