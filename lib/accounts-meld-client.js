Meteor.subscribe("pendingMeldActions");
MeldActions = new Meteor.Collection('meldActions');

Template.accountsMeld.helpers({
    actions: function() {
        return MeldActions.find();
    },
});

Template.meldAction.helpers({
    src_services: function(){
        return this.src_info.services;
    },
    src_emails: function(){
        return this.src_info.emails;
    },
    dst_services: function(){
        return this.dst_info.services;
    },
    dst_emails: function(){
        return this.dst_info.emails;
    },
});

Template.meldAction.events({
    'click #meldActionYes': function(){
        MeldActions.update({_id: this._id}, {$set: {meld: 'yes'}});
    },
    'click #meldActionNotNow': function(){
        MeldActions.update({_id: this._id}, {$set: {meld: 'not_now'}});
    },
    'click #meldActionNever': function(){
        MeldActions.update({_id: this._id}, {$set: {meld: 'never'}});
    },
});