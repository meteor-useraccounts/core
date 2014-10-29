Package.describe({
    summary: "Famo.us wrapper for Accounts Templates.",
    version: "0.1.12",
    name: "useraccounts:famous-wrapper",
    git: "https://github.com/meteor-useraccounts/ui.git",
});

Package.on_use(function(api, where) {
    api.versionsFrom("METEOR@0.9.2.2");

    api.use([
        "reactive-dict",
        "templating",
    ], "client");

    api.use([
        "check",
        "underscore",
        "splendido:accounts-templates-core",
        "gadicohen:famous-views",
        "aldeed:template-extension"
    ], ["client", "server"]);

    api.imply([
        "splendido:accounts-templates-core@0.11.0",
        "gadicohen:famous-views@0.1.18",
        "aldeed:template-extension@2.0.0",
    ], ["client", "server"]);

    //api.use('mjnetworks:famous@0.2.2-1', ['client']/*, { weak: true }*/);

    api.use("splendido:accounts-templates-unstyled@0.11.0", ["client", "server"], { weak: true });
    api.use("splendido:accounts-templates-bootstrap@0.11.0", ["client", "server"], { weak: true });
    api.use("splendido:accounts-templates-foundation@0.11.0", ["client", "server"], { weak: true });
    api.use("splendido:accounts-templates-semantic-ui@0.11.0", ["client", "server"], { weak: true });

    api.add_files([
        "lib/at_famous_form.html",
        "lib/at_famous_form.js",
        "lib/at_famous_oauth.html",
        "lib/at_famous_oauth.js",
        "lib/at_pwd_form_btn.js",
        "lib/full_page_at_famous_form.html",
        "lib/full_page_at_famous_form.js",
        "lib/default_animations.js",
        "lib/famous_wrapper.js",
    ], ["client"]);

    api.add_files([
        "lib/at_configure_anim.js",
    ], ["client", "server"]);
});

Package.on_test(function(api) {
    api.use([
        "splendido:accounts-templates-core@0.11.0",
    ]);
    api.use(["tinytest", "test-helpers"], ["client", "server"]);
    api.add_files("tests/tests.js", ["client", "server"]);
});
