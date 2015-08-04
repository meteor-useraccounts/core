
Meteor.methods({
  ATRemoveService: function(service_name){
    check(service_name, String);
    var userId = this.userId;
    if (userId){
      var user = Meteor.users.findOne(userId);
      var numServices = _.keys(user.services).length; // including "resume"
      if (numServices === 2) {
        throw new Meteor.Error(403, AccountsTemplates.texts.errors.cannotRemoveService, {});
      }
      var unset = {};
      unset["services." + service_name] = "";
      Meteor.users.update(userId, {$unset: unset});
    }
  },
});
