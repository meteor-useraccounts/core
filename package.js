Package.describe({
  summary: "Users' Accounts Systems to be possibly styled for different front-end frameworks. Core package."
});

Package.on_use(function(api, where) {
  api.use(['check', 'deps'], ['client', 'server']);
  api.add_files(['accounts-users-core.js'], ['client', 'server']);
  if (api.export)
    api.export('AccountsUsers', ['client', 'server']);
});

Package.on_test(function(api) {
  api.use('accounts-users-core');
  api.use(['tinytest', 'test-helpers'], ['client', 'server']);
  api.add_files('tests/accounts-users-core_tests.js', ['client', 'server']);
});