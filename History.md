## Master

## v1.9.0

* configurable `Login Forbidden` text (see [Errors Text](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#errors-text), plus #301)
* fixed little redirect bug (see #315)
* added title configuration for `verifyEmail` state plus letting titles to be hidden by
  setting the corresponding text to an empy string (see [Form Title](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#form-title))

## v1.8.1

* made (a fake) `ensureSignedIn` plugin available also on server side code (fixed #291)

## v1.8.0

* added `lowercaseUsername` configuration option (see [Configuration API Options](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#options))
* added `ensureSignedIn` plugin for Iron Router (see [Content Protection](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#content-protection))
* fixed `ensureSignedIn` regression (see #286)

## v1.7.1

* fixed routing regression (see #284)
* removed useless logs

## v1.7.0

* `useraccounts:materialize` to the suite! (Many thanks to @Kestanous!!!)
* fixed glitch within `ensureSignedIn` (see #278)
* added experimental support for [reChaptcha](https://www.google.com/recaptcha/intro/index.html) (see #268 and [reCaptcha Setup](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#recaptcha-setup), great work @theplatapi!)
* new `template` option for deeper input fields customization (see #273 and [Form Fields Configuration](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#form-fields-configuration))
* prevent access to `atChangePwd` for users not being logged in (see #207)
* use `Meteor.userID()` in place of `Meteor.user()` where possible to reduce reactive re-computations
* fixed bug with timed out redirects  (see #263)
* fixed reactivity bug within `ensureSignedIn` (see #262)
* removed warning about MAIL_URL not being configured (see #267, #210)
* better `atNavButton` behaviour (see #265 tnx @adrianmc)

## v1.6.1

* updated deps for iron:router and softwarerero:accounts-t9n to latest versions

## v1.6.0

* moved the documentation to a separate file: [Guide](https://github.com/meteor-useraccounts/core/blob/master/Guide.md)
* fixed bug about calling `sibmitHook` (see #249 #252 tnx @dalgard)
* new `options` for field configuration (see #250 and [Extending Templates](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#extending-templates) tnx @dalgard)
* a bit of cleanup for docs (see #251 tnx @dalgard)
* capitalazed default value for display name and placeholder (see #247)
* switch to official `Accounts._hasPassword` (see [this](https://github.com/meteor/meteor/pull/2271) and [this](https://github.com/meteor/meteor/pull/3410), tnx @glasser)
* more sites using useraccounts: congrats to @nate-strauser and @msamoylov on their launches! (see [the list](https://github.com/meteor-useraccounts/core#whos-using-this))
* new landing page for the whole project and new live examples (still to be further improoved...) :) (see [useraccounts.meteor.com](https://useraccounts.meteor.com))
* added `transform` among the options for [field configuration](https://github.com/meteor-useraccounts/core/blob/master/Guide.md#form-fields-configuration)
* better behaviour for input value tranform/fix
* terms and agreements now showed also on enrollment form (see #253)
* link to singIn now shown also on forgot password form in case `forbidClientAccountCreation` is set to true (partial solution to #229)
* moved terms and agreements link right after the submit button (see #239)

## v1.5.0

* added `useraccounts:polymer` to the suite! (WIP, Thanks @kevohagan!!!)
* fixed a bug with atVerifyEmail route (see #241 and #173)
* little docs improovements

## v1.4.1

* updated dependency to softwarerero:accounts-t9n@1.0.5 to include Turkish language
* fixed `{{> atForm state='<state>'}}` which was no more working with Meteor@1.0.2 (see #217)
* fixed some text configuration (see #209, thanks @bumbleblym)
* fixed some typos into the docs (see #208, thanks @bumbleblym)

## v1.4.0

* added `useraccounts:ionic` to the suite! (Thanks @nickw!!!)
* updated `useraccounts:semantic-ui` to SemanticUI@1.0.0 (Thanks @lumatijev!!!)
* added `onLogoutHook` to be able to run code (custom redirects?) on `AccountsTemplates.logout` (see #191)
* added `onSubmitHook` among configuration parameters to be able to run code on form submission (might be useful for modals! see #201 and #180)
* submission button get now disabled also during fields (asynchronous) validation
* `enforceEmailVerification` now works also with username login (fixed #196)
* better IE compatibility (see #199)
* better input field validation flows to recover from previous errors (see #177)
* updated dependency to softwarerero:accounts-t9n@1.0.4
* new [Contributing section](https://github.com/meteor-useraccounts/core#contributing) among docs
* a few improvements and typo fixes for README.md

## v1.3.2 / 2014/11/25

* more robust logout pattern when dealing with routes protected with ensureSigndIn

## v1.3.1 / 2014/11/25

* updated dependency to iron:router@1.0.3
* fixed bug in linkClick (see #170)
* fixed bug in configureRoute

## v1.3.0 / 2014/11/23

* added support for [Ratchet](http://goratchet.com/): see [useraccounts:ratchet](https://atmospherejs.com/useraccounts/ratchet). Note: form validation is currently not supported by Ratchet!
* fixed bug in custom validation flow
* better default validation for `email` field (see #156)
* few corrections inside docs
* added `ensuredSignedIn` among configurable routes so that different `template` and `layoutTemplate` can be specified (fix for #160 and #98)
* added `socialLoginStyle` among the configuration options to select the login flow (`popup` or `redirect`) for 3rd party login services (see #163)
* fixed bug about fields ordering

## v1.2.3 / 2014/11/13

* put back in a `init` method dispalying a warning to preserve backward compatibility...

## v1.2.2 / 2014/11/12

* fixed bad redirect for cheange password route (see #154)

## v1.2.1 / 2014/11/12

* fixed regression due reactivity problems after fix for #139

## v1.2.0 / 2014/11/12

* **breaking change:** removed the need to call `Accounts.init()`
* added support for fields' validating state to display a 'loading' icon
* added support for fields' icon configuration
* added support for social buttons' icon configuration (see [this](https://github.com/meteor-useraccounts/core#social-button-icons) new section)
* added support for `meteor-developer` oauth service (see #147)
* fixed (special) fields ordering, see #144
* fixed ensureSignedIn (see #152)
* removed `new_password` and `new_password_again` special fields, simply use `password` and `password_again` from now on!
* better redirect behaviour when a logged in user lands on a sign-in/sign-up page: usual redirect is now performed. (see #139)
* better field validation patterns...
* updated dependency to irou:router@1.0.1
* updated dependency to softwarerero:accounts-t9n@1.0.2
* corrected many errors and typos inside the Documentation

## v1.1.1
## v1.1.0

* fixed  `atNavButton` for useraccounts:unstyled
* fixed variour names and links in README files

## v1.1.0

* new template `atNavButton`
* added methos `AccountsTemplates.logout()` which redirects back to `homeRoutePath` when configured
* support for hidden fields
* url query parameters loaded into input fields -> useful mostly for hidden fields ;-)
* granted full control over field ordering (except for special fields...). see #135
* fixes for #130, #132

## v1.0.1

* fixed link to git repositories inside package.js files

## v1.0.0

* new names: no more splendido:accounts-templates:<somethig> but useraccounts:<somethig> !
* updated iron:router to v1.0.0

## v0.11.0

* added support for checkbox, select, and radio inputs
* added defaultState as referred in #125
* fixes for #127

## v0.10.0

* better texts configuration API (as for #117)
* prevPath fix


## v0.9.16

* updated iron:router to v0.9.4

## v0.9.15

* fixed #110

## v0.9.14

* fixed some redirection problems connected with `ensureSignedIn`

## v0.9.13

* experimental implementation for forbidding access with unverified email (see #108) through configuration flag `enforceEmailVerification`
* added options to hide links: hideSignInLink, hideSignUpLink
* fixed #107

## v0.9.12

* fixed #109

## v0.9.11

* better submit button disabling when no negative feedback is used
* fixed #105

## v0.9.10

* added `defaultLayout` to configuration options
* new callback parameter to `setState`
* better rendering behaviour on `ensureSignedIn`

## v0.9.9

* Fixed links for `reset-password`, `enroll-account`, and `verify-email`

## v0.9.8

* fixed checks for login services (see #93)
* minor updates to docs

## v0.9.7

* fixed #92, to permit the use of, e.g., `{{> atForm state="changePwd"}}` ( see [docs](https://github.com/splendido/accounts-templates-core#templates))

## v0.9.6

* fixed #91, pwdForm submission on signin page has no effect unless both password and usename/email are not empty

## v0.9.5

* show title on sign in also with other services
* moved sign in link below pwd form
* removed sign in link from forgot-pwd page (sign up link is still there!)
* added class at-btn to submit button
* added class at-signin to sign in link
* added class at-signup to sign up link
* added class at-pwd to forgot password link
* accounts-t9n dependency updated to @1.0.0

## v0.9.4


## Older versions (to be written)

* Fixes for #19, #24, #25, #26
* layoutTemplate option
* Better signup flow, with proper server side validation!
* Fixes for #15, and #16
* Do not show validation errors during sign in
* Do not show sign up link when account creation is disabled
* Better use of UnderscoreJS
* Corrected documentation for showAddRemoveServices

## v0.0.9

* added configuration parameter [`showAddRemoveServices`](https://github.com/splendido/accounts-templates-core#appearance)
* Fix ensureSignedIn for drawing correct template

## v0.0.8
