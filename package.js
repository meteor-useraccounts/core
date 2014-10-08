Package.describe({
    summary: "Meteor sign up and sign in templates core package.",
    version: "0.9.11",
    name: "splendido:accounts-templates-core",
    git: "https://github.com/splendido/accounts-templates-core.git",
});

Package.on_use(function(api) {
    api.versionsFrom("METEOR@0.9.2.2");

    api.use([
        "accounts-base",
        "check",
        "underscore",
        "iron:router",
    ], ["client", "server"]);

    api.use([
        "blaze",
        "reactive-dict",
        "sha",
    ], "client");

    api.imply([
        "accounts-base",
        "softwarerero:accounts-t9n@1.0.0",
        "iron:router@0.9.3",
    ], ["client", "server"]);

    api.imply([
        "templating",
    ], ["client"]);

    api.add_files([
        "lib/core.js",
        "lib/server.js",
        "lib/methods.js",
    ], ["server"]);

    api.add_files([
        "lib/utils.js",
        "lib/core.js",
        "lib/field.js",
        "lib/client.js",
        "lib/at_error.js",
        "lib/at_form.js",
        "lib/at_input.js",
        "lib/at_oauth.js",
        "lib/at_pwd_form.js",
        "lib/at_pwd_form_btn.js",
        "lib/at_pwd_link.js",
        "lib/at_result.js",
        "lib/at_sep.js",
        "lib/at_signin_link.js",
        "lib/at_signup_link.js",
        "lib/at_social.js",
        "lib/at_terms_link.js",
        "lib/at_title.js",
        "lib/methods.js",
    ], ["client"]);

    api.export([
        "AccountsTemplates",
    ], ["client", "server"]);
});

Package.on_test(function(api) {
    api.use("splendido:accounts-templates-core@0.9.11");
    api.use([
        //"softwarerero:accounts-t9n@1.0.0",
        //"iron:router@0.9.3",
    ], ["client", "server"]);

    api.use([
        'accounts-password',
        'tinytest',
        'test-helpers'
    ], ['client', 'server']);

    api.add_files([
        "tests/tests.js",
    ], ["client", "server"]);
});
