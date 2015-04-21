/* global
    UALog: false,
    UAModule: false,
    UserAccounts: false
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading state.js');


// define the Student class
function UAStatus() {
  // Call the parent constructor
  UAModule.call(this);

  this._id = 'status';
  this.position = 20;
  this.template = 'uaStatus';
}


// inherit UAModule
UAStatus.prototype = new UAModule();


// correct the constructor pointer because it points to UAModule
UAStatus.prototype.constructor = UAStatus;


UAStatus.prototype.configure = function(options) {
  UALog.trace('configure ' + this._id);
  // console.log(options);
};


UAStatus.prototype._getTemplateObject = function(data) {
  UALog.trace('_getTemplateObject');
  var
    initialError = (data && data.error) || null,
    initialMessage = (data && data.message) || null,
    initialSuccess = (data && data.success) || null;

  var tmplObj = {
    error: ReactiveVar(initialError),
    message: ReactiveVar(initialMessage),
    success: ReactiveVar(initialSuccess),
  };

  return tmplObj;
};


UAStatus.prototype.message = function() {
  UALog.trace('UAStatus:message');
  var uaTmpl = Template.currentData().instance;

  return uaTmpl.message.get();
};


UAStatus.prototype.showError = function() {
  UALog.trace('UAStatus:showError');
  var uaTmpl = Template.currentData().instance;

  return !!uaTmpl.error.get();
};


UAStatus.prototype.showMessage = function() {
  UALog.trace('UAStatus:showMessage');
  var uaTmpl = Template.currentData().instance;

  return !!uaTmpl.message.get();
};


UAStatus.prototype.showSuccess = function() {
  UALog.trace('UAStatus:showSuccess');
  var uaTmpl = Template.currentData().instance;

  return !!uaTmpl.success.get();
};


UAStatus.prototype.success = function() {
  UALog.trace('UAStatus:success');
  var uaTmpl = Template.currentData().instance;

  return uaTmpl.success.get();
};

UserAccounts._modules.status = new UAStatus();
