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
}


// inherit UAModule
UATitle.prototype = new UAModule();


// correct the constructor pointer because it points to UAModule
UATitle.prototype.constructor = UATitle;


UATitle.prototype.configure = function(options) {
  UALog.trace('configure ' + this._id);
  // console.log(options);

  this.text = _.defaults(options.text || {}, this.text);
};


UATitle.prototype.text = {
  signIn: "sign_in",
  signUp: "register",
};


UATitle.prototype.title = function() {
  var
    self = this,
    uaTmpl = Template.currentData().instance,
    state = uaTmpl.getState();

  return self.text[state];
};


UserAccounts._modules.title = new UATitle();
