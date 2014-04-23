AccountsUsers.prototype.loginFormHelpers = {
	fields: function() {
		var AUFields = AccountsUsers.getFields();
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
		if (AccountsUsers.getState() === 'sgin') {
			return 'Sign In';
		} else if (AccountsUsers.getState() === 'sgup') {
			return 'Sign Up';
		} else if (AccountsUsers.getState() === 'fpwd') {
			return 'Send Password';
		} else if (AccountsUsers.getState() === 'cpwd') {
			return 'Change Password';
		}
	}
};