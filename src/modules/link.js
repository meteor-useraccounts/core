/* global
    UALog: false,
    UAModule: false,
    UserAccounts: false
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading link.js');


// define the Student class
function UALink() {
  // Call the parent constructor
  UAModule.call(this);

  this._id = 'link';
  this.position = 60;
  this.template = 'uaLink';
  this.templateClass = 'link';
  this.targetState = 'signIn';
}


// inherit UAModule
UALink.prototype = new UAModule();


_.extend(UALink.prototype, {
  // correct the constructor pointer because it points to UAModule
  constructor: UALink,

  configure: function(options) {
    UALog.trace('configure ' + this._id);
    // console.log(options);

    this.text = _.defaults(options.text || {}, this.text);
  },

  prefix: function() {
    return this.getText('prefix');
  },

  suffix: function() {
    return this.getText('suffix');
  },

  linkUrl: function() {
    return '#';
  },

  linkText: function() {
    return this.getText('text');
  },

  disabled: function() {
    return '';
  },
});

UALog.trace('Adding signInLink module');
var signInLink = new UALink();
signInLink._id = 'signInLink';
signInLink.templateClass = 'sign-in-link';
signInLink.targetState = 'signIn';
signInLink.position = 60;
signInLink.texts = {
  default: {
    prefix: 'If you already have an account',
    suffix: '',
    text: 'sign in',
  },
};
UserAccounts._modules.signInLink = signInLink;
UserAccounts.signInLink = signInLink;

UALog.trace('Adding signUpLink module');
var signUpLink = new UALink();
signUpLink._id = 'signUpLink';
signUpLink.templateClass = 'sign-up-link';
signUpLink.targetState = 'signUp';
signUpLink.position = 70;
signUpLink.texts = {
  default: {
    prefix: 'Don\'t have an account?',
    suffix: '',
    text: 'Register',
  },
};
UserAccounts._modules.signUpLink = signUpLink;
UserAccounts.signUpLink = signUpLink;
