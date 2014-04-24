
Tinytest.add("AccountsUsers - addField/removeField", function(test) {
    if (Meteor.isClient) {
        // addField does not exist client-side
        test.throws(function() {
            AccountsUsers.addField();
        });
        // setState does not exist client-side
        test.throws(function() {
            AccountsUsers.removeField('');
        });
    } else {
        // Calls after AccountsUsers.init()
        AccountsUsers._initialized = true;
        test.throws(function() {
            AccountsUsers.addField('');
        }, function(err) {
            if (err instanceof Error && err.message === 'AccountsUsers.addField should strictly be called before AccountsUsers.init!')
                return true;
        });
        test.throws(function() {
            AccountsUsers.removeField('');
        }, function(err) {
            if (err instanceof Error && err.message === 'AccountsUsers.removeField should strictly be called before AccountsUsers.init!')
                return true;
        });
        AccountsUsers._initialized = false;

        // Trying to remove a non-existing field
        test.throws(function() {
            AccountsUsers.removeField('foo');
        }, function(err) {
            if (err instanceof Error && err.message == 'A field called foo does not exist!')
                return true;
        });

        // Trying to remove an existing field
        test.isTrue(AccountsUsers.removeField('email'));
        test.isUndefined(AccountsUsers._fields.email);

        // Trying to add a field named 'config', which is not allowed
        test.throws(function() {
            AccountsUsers.addField({name: 'config', displayName: "config", type: "text"});
        }, function(err) {
            if (err instanceof Error && err.message == "\'config\' is not a valid name for a field!")
                return true;
        });

        // Trying to add an already existing field
        test.throws(function() {
            AccountsUsers.addField(AccountsUsers._fields.password);
        }, function(err) {
            if (err instanceof Error && err.message == 'A field called password already exists!')
                return true;
        });

        var email = {
            name: 'email',
            displayName: 'Email',
            type: 'email'
        };

        // Invalid field properties
        test.throws(function() {
            AccountsUsers.addField(_.extend(_.clone(email), {
                foo: 'bar'
            }));
        }, Error);

        // Successful add
        AccountsUsers.addField(email);

        // Invalid field.type
        test.throws(function() {
            AccountsUsers.addField({
                name: 'foo',
                displayName: 'Foo',
                type: 'bar'
            });
        }, function(err) {
            if (err instanceof Error && err.message == 'field.type is not valid!')
                return true;
        });

        // Invalid minLength
        test.throws(function() {
            AccountsUsers.addField({
                name: 'first-name',
                displayName: 'First Name',
                type: 'text',
                minLength: 0
            });
        }, function(err) {
            if (err instanceof Error && err.message == 'field.minLength should be greater than zero!')
                return true;
        });
        // Invalid maxLength
        test.throws(function() {
            AccountsUsers.addField({
                name: 'first-name',
                displayName: 'First Name',
                type: 'text',
                maxLength: 0
            });
        }, function(err) {
            if (err instanceof Error && err.message == 'field.maxLength should be greater than zero!')
                return true;
        });
        // maxLength < minLength
        test.throws(function() {
            AccountsUsers.addField({
                name: 'first-name',
                displayName: 'First Name',
                type: 'text',
                minLength: 2,
                maxLength: 1
            });
        }, function(err) {
            if (err instanceof Error && err.message == 'field.maxLength should be greater than field.maxLength!')
                return true;
        });

        // Successful add
        var first_name = {
            name: 'first_name',
            displayName: 'First Name',
            type: 'text',
            minLength: 2,
            maxLength: 50,
            required: true
        };
        AccountsUsers.addField(first_name);
        test.equal(AccountsUsers._fields.first_name, first_name);
        // Now removes ot to be consistend with tests re-run
        AccountsUsers.removeField('first_name');
    }
});


Tinytest.add("AccountsUsers - addFields", function(test) {
    if (Meteor.isClient) {
        // addFields does not exist client-side
        test.throws(function() {
            AccountsUsers.addFields();
        });
    } else {
        // Not an array of objects
        test.throws(function() {
            AccountsUsers.addFields('');
        }, function(err) {
            if (err instanceof Error && err.message === 'field argument should be an array of valid field objects!')
                return true;
        });
        test.throws(function() {
            AccountsUsers.addFields(100);
        }, function(err) {
            if (err instanceof Error && err.message === 'field argument should be an array of valid field objects!')
                return true;
        });
        // Empty array
        test.throws(function() {
            AccountsUsers.addFields([]);
        }, function(err) {
            if (err instanceof Error && err.message === 'field argument should be an array of valid field objects!')
                return true;
        });

        // Successful add
        var first_name = {
            name: 'first_name',
            displayName: 'First Name',
            type: 'text',
            minLength: 2,
            maxLength: 50,
            required: true
        };
        var last_name = {
            name: 'last_name',
            displayName: 'Last Name',
            type: 'text',
            minLength: 2,
            maxLength: 100,
            required: false
        };
        AccountsUsers.addFields([first_name, last_name]);
        test.equal(AccountsUsers._fields.first_name, first_name);
        test.equal(AccountsUsers._fields.last_name, last_name);
        // Now removes ot to be consistend with tests re-run
        AccountsUsers.removeField('first_name');
        AccountsUsers.removeField('last_name');
    }
});

Tinytest.add("AccountsUsers - setState/getState", function(test) {
    if (Meteor.isServer) {
        // getState does not exist server-side
        test.throws(function() {
            AccountsUsers.getState();
        });
        // setState does not exist server-side
        test.throws(function() {
            AccountsUsers.setState();
        });
    } else {
        // Setting 'Sign In'
        AccountsUsers.setState('sgin');
        test.equal(AccountsUsers.getState(), 'sgin');
        // Setting 'Sign Up'
        AccountsUsers.setState('sgup');
        test.equal(AccountsUsers.getState(), 'sgup');
        // Setting 'Forgot Password'
        AccountsUsers.setState('fpwd');
        test.equal(AccountsUsers.getState(), 'fpwd');
        // Setting 'Change Password'
        AccountsUsers.setState('cpwd');
        test.equal(AccountsUsers.getState(), 'cpwd');
        // Setting an invalid state should throw a Meteor.Error
        test.throws(function() {
            AccountsUsers.setState('foo');
        }, function(err) {
            if (err instanceof Meteor.Error && err.details == 'accounts-users package got an invalid state value!')
                return true;
        });
    }
});


// -------------------------------------
// TODO: complite the following tests...
// -------------------------------------

Tinytest.add("AccountsUsers - getFieldError/setFieldError", function(test) {
    if (Meteor.isServer) {
        // getFieldError does not exist server-side
        test.throws(function() {
            AccountsUsers.getFieldError();
        });
        // setFieldError does not exist server-side
        test.throws(function() {
            AccountsUsers.setFieldError();
        });
    } else {
        // TODO: write actual tests...
    }
});

Tinytest.add("AccountsUsers - configure", function(test) {
    if (Meteor.isClient) {
        // configure does not exist client-side
        test.throws(function() {
            AccountsUsers.configure({});
        });
    } else {
        // TODO: write actual tests...
    }
});
