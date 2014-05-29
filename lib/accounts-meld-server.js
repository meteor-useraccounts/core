function AM() {}
// Reference to the callback used to meld user objects
AM.prototype.meldUserCallback = null;
// Reference to the callback used to meld collections' objects
AM.prototype.meldDBCallback = null;

AccountsMeld = new AM();


// -----------------------------------------
// Collection to keep meld actions document
// -----------------------------------------

// Each document is composed as follow:
//   -  src_user_id: user_id associated to the account to be deleted
//   -  

MeldActions = new Meteor.Collection('meldActions');

MeldActions.allow({
    insert: function(userId, doc) {
        // no insertions!
        return false;
    },
    update: function(userId, doc, fieldNames, modifier) {
        // Only the field action can be modified...
        if (fieldNames.length > 1)
            return false;
        if (fieldNames[0] != "meld")
            return false;
        if (!_.contains(['ask', 'yes', 'not_now', 'never'], doc.meld))
            return false;
        // ...and only by the destination user!
        return doc.dst_user_id === userId;
    },
    remove: function(userId, doc) {
        // no removals!
        return false;
    }
});

// Publish any meld action registered for the current user
Meteor.publish("pendingMeldActions", function() {
    return MeldActions.find({
        dst_user_id: this.userId,
        meld: "ask"
    });
});


MeldActions.find().observeChanges({
    changed: function(id, fields) {
        if (fields.meld === "never")
            MeldActions.update({
                _id: id
            }, {
                $set: {
                    src_info: null,
                    dst_info: null
                }
            });
        else if (fields.meld === "yes") {
            // Retrieves the meld action document
            var meldAction = MeldActions.findOne({_id: id});
            // Proceeds with actual merging of the two accounts...
            meldUsers(meldAction);
        }
    }
});


var meldUsers = function(meldAction) {
    // Check whether a callback for users objects meld was specified
    if (AccountsMeld.meldUserCallback)
        AccountsMeld.meldUserCallback(meldAction.src_user_id, meldAction.dst_user_id);
    else
        defaultUsersObjectsMeld(meldAction);
    // Check whether a callback for DB document migration was specified
    if (AccountsMeld.meldDBCallback)
        AccountsMeld.meldDBCallback(meldAction.src_user_id, meldAction.dst_user_id);
    // Removes the meld action
    MeldActions.remove(meldAction);

    // TODO: check/remove possible meld actions involving the same two accounts but with
    //       exchanged _ids
};


var defaultUsersObjectsMeld = function(meldAction) {
    // Retrieves the source account
    var src_user = Meteor.users.findOne(meldAction.src_user_id);
    if (!src_user)
        throw new Meteor.Error(403, "Source account was not found!");
    // Retrieves the destination account
    var dst_user = Meteor.users.findOne(meldAction.dst_user_id);
    if (!dst_user)
        throw new Meteor.Error(403, "Destination account was not found!");
    // createdAt: keeps the oldest between the two
    if (src_user.createdAt < dst_user.createdAt)
        dst_user.createdAt = src_user.createdAt;
    // Profile
    if (!src_user.profile)
        src_user.profile = {};
    if (!dst_user.profile)
        dst_user.profile = {};
    _.defaults(dst_user.profile, src_user.profile);
    // services: adds services appearing inside the src user which
    //           do not appear inside the destination user
    if (!src_user.services)
        src_user.services = {};
    if (!dst_user.services)
        dst_user.services = {};
    _.defaults(dst_user.services, src_user.services);
    // TODO: check there are no overlapping services which have different ids!!!
    // emails: fuses the two emails fields, giving precedence to verified ones...
    var src_emails = src_user.emails || [];
    var dst_emails = dst_user.emails || [];
    _.each(src_emails, function(src_email) {
        // Look for the same email address inside dst_emails
        // email_id === -1 means not found!
        var email_id = _.chain(dst_emails)
            .map(function(dst_email) {
                return src_email.address === dst_email.address;
            })
            .indexOf(true)
            .value();
        if (email_id === -1) {
            // In case the email is not present, adds it to the array
            dst_emails.push(src_email);
        } else {
            if (src_email.verified && !dst_emails[email_id].verified) {
                // If the email was found but its verified state should be promoted
                // to true, updates the array element
                dst_emails[email_id].verified = true;
            }
        }
    });
    dst_user.emails = dst_emails;
    // registered_emails: fuses the two emails fields, giving precedence to verified ones...
    src_emails = src_user.registered_emails || [];
    dst_emails = dst_user.registered_emails || [];
    _.each(src_emails, function(src_email) {
        // Look for the same email address inside dst_emails
        // email_id === -1 means not found!
        var email_id = _.chain(dst_emails)
            .map(function(dst_email) {
                return src_email.address === dst_email.address;
            })
            .indexOf(true)
            .value();
        if (email_id === -1) {
            // In case the email is not present, adds it to the array
            dst_emails.push(src_email);
        } else {
            if (src_email.verified && !dst_emails[email_id].verified) {
                // If the email was found but its verified state should be promoted
                // to true, updates the array element
                dst_emails[email_id].verified = true;
            }
        }
    });
    dst_user.registered_emails = dst_emails;
    // Removes the old user
    Meteor.users.remove({
        _id: src_user._id
    });
    // Updates the current user
    Meteor.users.update({
        _id: dst_user._id
    }, {
        $set: _.omit(dst_user, '_id')
    });
};

checkForMelds = function(dst_user) {
    console.log('checkForMelds');
    // Updates all possibly pending meld actions...
    MeldActions.update({dst_user_id: dst_user._id, meld: "not_now"}, {$set: {meld: "ask"}}, {multi: true});
    // Picks up verified email addresses and creates a list like
    // [{$elemMatch: {"address": addr1, "verified": true}}, {$elemMatch: {"address": addr2, "verified": true}}, ...]
    var queryEmails = _.chain(dst_user.registered_emails)
        .filter(function(email) {return email.verified;})
        .map(function(email) {return {"registered_emails": {$elemMatch: email}};})
        .value();
    // In case there is at least one registered address
    if (queryEmails.length) {
        // Finds users with at least one registered email address matching the above list
        if (queryEmails.length > 1)
            queryEmails = {$or: queryEmails};
        else
            queryEmails = queryEmails[0];
        // Excludes current user...
        queryEmails['_id'] = {$ne: dst_user._id};
        var users = Meteor.users.find(queryEmails);
        console.log('Found ' + users.count() + ' users!');
        users.forEach(function(user) {
            // Checks if there is already a document about this meld action
            var meldAction = MeldActions.findOne({
                src_user_id: user._id,
                dst_user_id: dst_user._id
            });
            if (meldAction) {
                console.log('Old Meld action found!');
                // If the last time the answer was 'Not now', ask again...
                if (meldAction.meld === 'not_now'){
                    MeldActions.update({_id: meldAction._id}, {$set: {meld: 'ask'}});
                    console.log('Old Meld action updated!');
                }
            } else {
                console.log('Creating Meld action...');
                // Creates a new meld action
                MeldActions.insert({
                    src_user_id: user._id,
                    dst_user_id: dst_user._id,
                    meld: "ask",
                    src_info: {
                        emails: user.registered_emails,
                        services: _.reject(_.keys(user.services), function(service){return service === "resume"})
                    },
                    dst_info: {
                        emails: dst_user.registered_emails,
                        services: _.reject(_.keys(dst_user.services), function(service){return service === "resume"})
                    }
                });
                console.log('Meld action created!');
            }
        });
    }
};


var orig_updateOrCreateUserFromExternalService = Accounts.updateOrCreateUserFromExternalService;
updateOrCreateUserFromExternalService = function(serviceName, serviceData, options) {
    var currentUser = Meteor.user();
    if (currentUser) {
        // The user was already logged in with a different account
        // Checks if the service is already registered with this same account
        if (!currentUser.services[serviceName]) {
            // It may be that the same service is already used with a different account
            // Checks is there is already an account with this service
            var selector = {};
            selector["services." + serviceName + ".id"] = serviceData.id;
            var user = Meteor.users.findOne(selector);
            if (!user) {
                // This service is being used for the first time!
                // Simply add the service data to the current user, and that's it!
                var setAttr = {};
                setAttr['services.' + serviceName] = serviceData;
                Meteor.users.update({_id: currentUser._id}, {"$set": setAttr});
            }
            /*
            else{
                // This service was already registered for 'user'
                console.log('Creating Meld action...');
                // Creates a new meld action
                MeldActions.insert({
                    src_user_id: user._id,
                    dst_user_id: currentUser._id,
                    meld: "ask",
                    src_info: {
                        emails: user.registered_emails,
                        services: _.reject(_.keys(user.services), function(service){return service === "resume"})
                    },
                    dst_info: {
                        emails: currentUser.registered_emails,
                        services: _.reject(_.keys(currentUser.services), function(service){return service === "resume"})
                    }
                });
                console.log('Meld action created!');
                // Exits signalling the currentUser so not to login 'user'
                return {
                    type: serviceName,
                    userId: currentUser._id
                };
            }
            */
        }
    }
    // Let the user in!
    return orig_updateOrCreateUserFromExternalService.apply(this, arguments);
};


/*
    --------------------------------
    OLD STUFF to be later considered
    --------------------------------
*/

// Handle guest users.
// When a user with a (one or more) login service(s) is meldd with a guest, then the guest is not a guest anymore!
// + Remove the guest flag (so it's not deleted by the guest clean up script)
// + Remove the password service (will need look into making accounts-meld compatible with accounts-password later...)
//try {
//  Meteor.users.update (oldAccountId, {
//    $unset: {
//      "profile.guest": "", 
//      "services.password": "", 
//      "username": ""
//    }
//  })