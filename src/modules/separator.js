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
  this.position = 40;
  this.template = 'uaSep';
  this.templateClass = 'sep';
  this.visible = false;
}


// inherit UAModule
UASep.prototype = new UAModule();

_.extend(UASep.prototype, {
  // correct the constructor pointer because it points to UAModule
  constructor: UASep,

  configure: function(options) {
    UALog.trace('configure ' + this._id);
    // console.log(options);

    this.texts = _.defaults(options.texts || {}, this.texts);
  },

  texts: {
    default: {
      sep: 'or',
    },
  },

  text: function() {
    return this.getText('sep');
  },
});

UALog.trace('Adding separator module');
var separator = new UASep();
UserAccounts._modules.separator = separator;
UserAccounts.separator = separator;

UserAccounts.startup(function(){
  if (!!this.oauth && !!this.password) {
    this.separator.visible = true;
  }
});
