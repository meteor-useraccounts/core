// Package metadata for Meteor.js web platform (https://www.meteor.com/)
// This file is defined within the Meteor documentation at
//
//   http://docs.meteor.com/#/full/packagejs
//
// and it is needed to define a Meteor package
'use strict';

var Both = ['client', 'server'];
var Client = 'client';
// var Server = 'server';


Package.describe({
  name: 'useraccounts:core',
  summary: 'Amazingly customizable users accounting templates (and much more!)',
  version: '2.0.0',
  git: 'https://github.com/meteor-useraccounts/core.git',
});

Package.onUse(function pkgOnUse(api) {
  api.versionsFrom('1.0');

  api.use([
    'check',
    'ecmascript',
    'jag:pince@0.0.9',
    'underscore',
    'underscorestring:underscore.string@3.2.2',
  ], Both);

  api.use([
    'reactive-var',
    'templating',
  ], Client);

  api.imply([
    'jag:pince',
    'underscorestring:underscore.string',
  ], Both);

  // Base Classes definition
  api.addFiles([
    'src/_globals.js',
    'src/logger.js',
    'src/module.js',
    'src/plugin.js',
    'src/core.js',
  ], Both);

  // Templates
  api.addFiles([
    'src/templates/ua_form.html',
    'src/templates/ua_form.js',
    'src/templates/ua_full_page_form.html',
  ], Client);

  // Client files
  api.addFiles([
    'src/texts.js',
    'src/client.js',
  ], Client);


  api.export([
    'UAModule',
    'UAPlugin',
    'UserAccounts',
  ], Both);
});

Package.onTest(function pkgOnTest(api) {
  api.use([
    'sanjo:jasmine@0.16.4',
    'underscore',
    'useraccounts:core',
  ], Both);

  api.addFiles([
    'tests/jasmine/both/unit/useraccounts.js',
  ], Both);


  api.use([
    'jquery',
    'templating',
  ], Client);

  api.addFiles([
    'tests/jasmine/client/integration/templates.js',
  ], Client);
});
