Package.describe({
    summary: "Meteor sign up and sign in templates core package."
});

Package.on_use(function(api, where) {

    api.use([
        'check',
        'deps',
        'accounts-merge',
        'accounts-t9n',
    ], ['client', 'server']);

    api.add_files([
        'lib/accounts-templates-core.js',
        'lib/accounts-templates-methods.js',
        'lib/t9n/english.js',
        'lib/t9n/french.js',
        'lib/t9n/german.js',
        'lib/t9n/italian.js',
        'lib/t9n/polish.js',
        'lib/t9n/spanish.js',
    ], ['client', 'server']);


    /*
    api.imply([
        'accounts-merge',
    ], ['client', 'server']);
    */

    api.export([
        'AccountsTemplates',
        'ATFieldsCollection',
    ], ['client', 'server']);
});

Package.on_test(function(api) {
    api.use('accounts-templates-core');
    api.use(['tinytest', 'test-helpers'], ['client', 'server']);
    api.add_files([
        'lib/accounts-templates-core.js',
        'lib/accounts-templates-methods.js',
        'lib/t9n/english.js',
        'lib/t9n/french.js',
        'lib/t9n/german.js',
        'lib/t9n/italian.js',
        'lib/t9n/polish.js',
        'lib/t9n/spanish.js',
    ], ['client', 'server']);
});