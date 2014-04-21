Package.describe({
  summary: "Users' Accounts Systems to be possibly styled for different front-end frameworks. Core package."
});

Package.on_use(function(api, where) {
  api.use([
    'check',
    'deps'
  ],['client', 'server']);
  api.add_files([
    'lib/accounts-users-core.js'
  ], ['client', 'server']);
  if (api.export)
    api.export('AccountsUsers', ['client', 'server']);
});
