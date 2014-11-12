## Master

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
