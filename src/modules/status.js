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
  this.templateClass = 'status';

  this.reactiveVarName = 'status';

  this.visible = function() {
    UALog.trace('UAStatus:visible');
    var uaTmpl = Template.currentData().instance;

    return !!uaTmpl[this.reactiveVarName].get();
  };
}


// inherit UAModule
UAStatus.prototype = new UAModule();


_.extend(UAStatus.prototype, {

  // correct the constructor pointer because it points to UAModule
  constructor: UAStatus,

  configure: function(options) {
    UALog.trace('configure ' + this._id);
    // console.log(options);
  },

  _initFormTemplate: function(uaForm) {
    UALog.trace('_initFormTemplate');
    var
      data = uaForm.data,
      initialValue = (data && data[this.reactiveVarName]) || null
    ;

    uaForm[this.reactiveVarName] = ReactiveVar(initialValue);
  },

  multipleValues: function(){
    var
      uaTmpl = Template.currentData().instance,
      value = uaTmpl[this.reactiveVarName].get()
    ;

      return value && typeof value !== 'string';
  },

  text: function(){
    var text = '';
    console.log('text');
    console.dir(this);
    if (!!this.field){
      console.log('field: ' + this.field);
      text += UserAccounts.t(this.field) + ': ';
    }
    if (!!this.value){
      console.log('value: ' + this.value);
      console.log('valueT: ' + UserAccounts.t(this.value));
      text += UserAccounts.t(this.value);
    }

    // Possibly removes initial prefix in case the key in not found inside t9n
    // if (value.substring(0, 15) === "error.accounts.") {
    //  value = value.substring(15);
    //}

    console.log('text: ' + text);
    return text;
  },

  value: function() {
    var
      self = this,
      uaTmpl = Template.currentData().instance,
      val = uaTmpl[this.reactiveVarName].get()
    ;
    console.log('value');
    console.dir(val);

    // Simple string
    if (typeof val === 'string') {
      console.log('string');
      val = [{
        value: val,
        text: self.text
      }];
    }
    // array
    else if (val.length > 0) {
      val = _.map(val, function(v){
        if (typeof v === 'string') {
          v = {
            value: v,
            text: self.text
          };
        }
        else {
          v = _.extend(v, {text: self.text});
        }
        return v;
      });
    }
    else {
      // single object
      val = [_.extend(val, {text: self.text})];
    }

    console.dir(val);
    return val;
  },
});


UALog.trace('Adding error module');
var error = new UAStatus();
error.reactiveVarName = 'error';
error.templateClass = 'error';
UserAccounts._modules.error = error;
UserAccounts.error = error;


UALog.trace('Adding message module');
var message = new UAStatus();
message.reactiveVarName = 'message';
message.templateClass = 'message';
UserAccounts._modules.message = message;
UserAccounts.message = message;


UALog.trace('Adding success module');
var success = new UAStatus();
success.reactiveVarName = 'success';
success.templateClass = 'success';
UserAccounts._modules.success = success;
UserAccounts.success = success;
