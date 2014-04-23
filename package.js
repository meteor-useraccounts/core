Package.describe({
    summary: "Meteor sign up and sign in templates styled for twitter Bootstrap"
});

Package.on_use(function(api, where) {
    api.use(['check', 'deps'], ['client', 'server']);
    api.add_files([
        'lib/accounts-users-core.js'
    ], ['client', 'server']);
    /*
    api.add_files([
        'lib/accounts-users-core-events.js',
        'lib/accounts-users-core-helpers.js'
    ], ['client']);
    */
    api.export('AccountsUsers', ['client', 'server']);
});

Package.on_test(function(api) {
    api.use('accounts-users-core');
    api.use(['tinytest', 'test-helpers'], ['client', 'server']);
    api.add_files('tests/accounts-users-core_tests.js', ['client', 'server']);
});