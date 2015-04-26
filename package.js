// Package metadata for Meteor.js web platform (https://www.meteor.com/)
// This file is defined within the Meteor documentation at
//
//   http://docs.meteor.com/#/full/packagejs
//
// and it is needed to define a Meteor package
'use strict';

var Both = ['client', 'server'];
var Client = 'client';
var Server = 'server';


Package.describe({
  name: 'useraccounts:core',
  summary: 'Amazingly customizable users accounting templates (and much more!)',
  version: '2.0.0',
  git: 'https://github.com/meteor-useraccounts/core.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  // Logger
  api.use([
    'jag:pince@0.0.5',
  ], Both);

  api.use([
    'reactive-dict',
    'reactive-var',
    'templating',
  ], Client);

  // Base Class definition
  api.addFiles([
    'src/_globals.js',
    'src/logger.js',
    'src/module.js',
    'src/core.js',
  ], Both);

  api.addFiles([
    'src/server.js',
  ], Server);

  api.addFiles([
    'src/templates/ua_form.html',
    'src/templates/ua_form.js',
    'src/templates/ua_link.html',
    'src/templates/ua_status.html',
    'src/templates/ua_title.html',
    'i18n/ua.en.i18n.js',
    'src/client.js',
  ], Client);

  api.addFiles([
    'src/modules/link.js',
    'src/modules/status.js',
    'src/modules/title.js',
  ], Both);

  api.export([
    'UA',
    'UAModule',
    'UserAccounts',
  ], Both);
});
