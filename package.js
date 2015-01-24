Package.describe({
    summary: "Meteor sign up and sign in templates core package.",
    version: "1.4.1",
    name: "useraccounts:core",
    git: "https://github.com/meteor-useraccounts/core.git",
});

Package.on_use(function(api) {
    api.versionsFrom("METEOR@1.0");

    api.use([
        "accounts-base",
        "check",
        "underscore",
        "iron:router",
        "reactive-var",
    ], ["client", "server"]);

    api.use([
        "blaze",
        "reactive-dict",
        "sha",
    ], "client");

    api.imply([
        "accounts-base",
        "softwarerero:accounts-t9n@1.0.5",
        "iron:router@1.0.3",
    ], ["client", "server"]);

    api.imply([
        "templating",
    ], ["client"]);

    api.add_files([
        "lib/field.js",
        "lib/core.js",
        "lib/server.js",
        "lib/methods.js",
    ], ["server"]);

    api.add_files([
        "lib/utils.js",
        "lib/field.js",
        "lib/core.js",
        "lib/client.js",
        "lib/templates_helpers/at_error.js",
        "lib/templates_helpers/at_form.js",
        "lib/templates_helpers/at_input.js",
        "lib/templates_helpers/at_nav_button.js",
        "lib/templates_helpers/at_oauth.js",
        "lib/templates_helpers/at_pwd_form.js",
        "lib/templates_helpers/at_pwd_form_btn.js",
        "lib/templates_helpers/at_pwd_link.js",
        "lib/templates_helpers/at_result.js",
        "lib/templates_helpers/at_sep.js",
        "lib/templates_helpers/at_signin_link.js",
        "lib/templates_helpers/at_signup_link.js",
        "lib/templates_helpers/at_social.js",
        "lib/templates_helpers/at_terms_link.js",
        "lib/templates_helpers/at_title.js",
        "lib/methods.js",
    ], ["client"]);

    api.export([
        "AccountsTemplates",
    ], ["client", "server"]);
});

Package.on_test(function(api) {
    api.use("useraccounts:core@1.4.1");

    api.use([
        'accounts-password',
        'tinytest',
        'test-helpers'
    ], ['client', 'server']);

    api.add_files([
        "tests/tests.js",
    ], ["client", "server"]);
});
