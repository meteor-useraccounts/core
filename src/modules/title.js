/* global
    UALog: false,
    UAModule: false,
    UserAccounts: false
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading title.js');


// define the Student class
function UATitle() {
  // Call the parent constructor
  UAModule.call(this);

  this._id = 'title';
  this.position = 10;
  this.template = 'uaTitle';
  this.templateClass = 'title';
}


// inherit UAModule
UATitle.prototype = new UAModule();


_.extend(UATitle.prototype, {

  // correct the constructor pointer because it points to UAModule
  constructor: UATitle,

  configure: function(options) {
    UALog.trace('configure ' + this._id);
    // console.log(options);

    this.texts = _.defaults(options.texts || {}, this.texts);
  },

  texts: {
    default: {
      title: 'useraccounts',
    },
    signIn: {
      title: 'sign_in',
    },
    signUp: {
      title: 'register',
    },
  },

  title: function() {
    return this.getText('title');
  },
});


UALog.trace('Adding title module');
var title = new UATitle();
UserAccounts._modules.title = title;
UserAccounts.title = title;
