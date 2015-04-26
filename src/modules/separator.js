/* global
    UALog: false,
    UAModule: false,
    UserAccounts: false
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading separator.js');


// define the Student class
function UASep() {
  // Call the parent constructor
  UAModule.call(this);

  this._id = 'separator';
  this.position = 30;
  this.template = 'uaSep';
}


// inherit UAModule
UASep.prototype = new UAModule();


// correct the constructor pointer because it points to UAModule
UASep.prototype.constructor = UASep;


UASep.prototype.configure = function(options) {
  UALog.trace('configure ' + this._id);
  // console.log(options);

  this.texts = _.defaults(options.texts || {}, this.texts);
};


UASep.prototype.texts = {
  default: {
    sep: 'or',
  },
};


UASep.prototype.text = function() {
  return this.getText('sep');
};


UserAccounts._modules.separator = new UASep();
