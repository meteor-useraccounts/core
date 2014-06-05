Package.describe({
    summary: "Meteor sign up and sign in templates core package."
});

Package.on_use(function(api, where) {

    api.use([
        'check',
        'deps',
        'accounts-base',
        'accounts-t9n',
        'iron-router',
    ], ['client', 'server']);

    api.use([
        'minimongo',
        'mongo-livedata',
        'templating'
    ], 'client');

    api.add_files([
    // accounts-emails-field fake deps (server)
        'lib/accounts-meld/lib/accounts-emails-field/accounts-emails-field.js',
    // accounts-meld fake deps (server)
        'lib/accounts-meld/lib/accounts-meld-server.js',
    ], ['server']);

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

    api.imply([
        'accounts-base',
        'accounts-t9n',
        'iron-router',
    ], ['client', 'server']);

    api.export([
        'AccountsMerge',
        'MergeActions',
    ], ['server']);

    api.export([
        'MergeActions',
    ], ['client']);

    api.export([
        'AccountsTemplates',
    ], ['client', 'server']);
});

Package.on_test(function(api) {
    api.use('accounts-templates-core');
    api.use([
        'tinytest',
        'test-helpers',
        'accounts-t9n',
        'iron-router',
    ], ['client', 'server']);
    api.add_files([
        'tests/accounts-templates-core_tests.js',
    ], ['client', 'server']);
});