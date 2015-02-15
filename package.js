// Package metadata for Meteor.js web platform (https://www.meteor.com/)
// This file is defined within the Meteor documentation at
//
//   http://docs.meteor.com/#/full/packagejs
//
// and it is needed to define a Meteor package

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

	// Base Class definition
	api.addFiles([
		'src/main.js'
	], Both);

	api.export([
		'UA',
	], Both);
});
