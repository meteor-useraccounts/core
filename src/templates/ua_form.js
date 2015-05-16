/* global
    UserAccounts: false,
    UALog: false
*/
'use strict';


Template.uaForm.onCreated(function() {
	UALog.trace('uaForm created');
	var self = this;

	// Initializes the ua object
	UserAccounts.initFormTemplate(self);

	// register this template within UserAccounts
	UserAccounts.tmplInstances.push(self);
});


Template.uaForm.helpers({
	modules: function() {
		var
			self = this,
			tmplInstance = Template.instance(),
			data = self.data,
			framework = (data && data.framework) || UserAccounts.currentFramework;

		var modules = _.map(UserAccounts.modules(), function(mod) {
			// return _.extend({instance: tmplInstance}, mod);
			return {
				module: mod,
				instance: tmplInstance,
				framework: framework,
			};
		});

		console.dir(modules);
		return modules;
	},
	skinClasses: function(element) {
		UALog.trace('template uaForm: skinClasses - ' + element);
		var
			framework = Template.instance().framework;

		if (_.has(UserAccounts.skins, framework)) {
			var classes = UserAccounts.skins[framework][element];
			if (_.isFunction(classes)) {
				classes = classes();
			}
			return classes;
		}
	}
});


Template.uaForm.events({
	'click .ua-link a': function(e){
		e.preventDefault();
		UserAccounts.linkClick(this.instance, this.module.targetState);
	}
});
