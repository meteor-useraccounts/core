AccountsTemplates.prototype.loginFormHelpers = {
	fields: function() {
		var AUFields = AccountsTemplates.getFields();
		var fields = [];
		for (var f in AUFields) {
			fields.push(AUFields[f]);
		}
		return fields;
	},
	name: function() {
		return this.name;
	},
	Name: function() {
		return this.name.replace('_', ' ');
	},
	type: function() {
		return this.type;
	},
	buttonText: function() {
		if (AccountsTemplates.getState() === 'sgin') {
			return 'Sign In';
		} else if (AccountsTemplates.getState() === 'sgup') {
			return 'Sign Up';
		} else if (AccountsTemplates.getState() === 'fpwd') {
			return 'Send Password';
		} else if (AccountsTemplates.getState() === 'cpwd') {
			return 'Change Password';
		}
	}
};