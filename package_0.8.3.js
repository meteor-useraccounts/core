Package.describe({
    summary: "Meteor sign up and sign in templates core package.",
    version: "0.9.0",
    name: "accounts-templates-core",
    git: "https://github.com/splendido/accounts-templates-core.git",
});

Package.on_use(function(api) {
    api.use([
        "check",
        "accounts-base",
        "underscore",
        "iron-router",
        "accounts-t9n",
    ], ["client", "server"]);

    api.use([
        "blaze",
        "reactive-dict",
        "sha",
    ], "client");

    api.imply([
        "accounts-t9n",
        "iron-router",
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
    api.use("accounts-templates-core");
    api.add_files([
        "tests/accounts-templates-core_tests.js",
    ], ["client", "server"]);
});