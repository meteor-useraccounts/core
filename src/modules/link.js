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
	this.position = 40;
	this.template = 'uaLink';
	this.targetState = 'signIn';
}


// inherit UAModule
UALink.prototype = new UAModule();


// correct the constructor pointer because it points to UAModule
UALink.prototype.constructor = UALink;


UALink.prototype.configure = function(options) {
	UALog.trace('configure ' + this._id);
	// console.log(options);

	this.text = _.defaults(options.text || {}, this.text);
};




UALink.prototype.prefix = function() {
	return this.getText('prefix');
};


UALink.prototype.suffix = function() {
	return this.getText('suffix');
};


UALink.prototype.linkUrl = function() {
	return '#';
};


UALink.prototype.linkText = function() {
	return this.getText('text');
};


UALink.prototype.disabled = function() {
	return '';
};

var signInLink = new UALink();
signInLink._id = 'signInLink';
signInLink.targetState = 'signIn';
signInLink.position = 40;
signInLink.texts = {
	default: {
		prefix: 'If you already have an account',
		suffix: '',
		text: 'sign in',
	},
};


var signUpLink = new UALink();
signUpLink._id = 'signUpLink';
signUpLink.targetState = 'signUp';
signUpLink.position = 50;
signUpLink.texts = {
	default: {
		prefix: 'Don\'t have an account?',
		suffix: '',
		text: 'Register',
	},
};



UserAccounts._modules.signInLink = signInLink;
UserAccounts._modules.signUpLink = signUpLink;
