Package.describe({
    summary: "Meteor sign up and sign in templates core package."
});

Package.on_use(function(api, where) {
    api.use(['check', 'deps'], ['client', 'server']);
    api.add_files([
        'lib/accounts-templates-core.js'
    ], ['client', 'server']);
    /*
    api.add_files([
        'lib/accounts-templates-core-events.js',
        'lib/accounts-templates-core-helpers.js'
    ], ['client']);
    */
    api.export([
        'AccountsTemplates',
        'ATFieldsCollection',
    ], ['client', 'server']);
});

Package.on_test(function(api) {
    api.use('accounts-templates-core');
    api.use(['tinytest', 'test-helpers'], ['client', 'server']);
    api.add_files('tests/accounts-templates-core_tests.js', ['client', 'server']);
});