## v0.0.13 

* Add support for Terms of Service and Privacy Policy - Fixes: [#3](https://github.com/splendido/accounts-templates-core/issues/3) - [`c43d2ee`](https://github.com/splendido/accounts-templates-core/commit/c43d2eef03bd9382eadc4612d29897b103c99668)
* State parameter for signinForm to lock the template state - [`6c1e6d4`](https://github.com/splendido/accounts-templates-core/commit/6c1e6d4c4ff3dade4433c07af24e97f532dcc7cb)


## v0.0.12 --current

* Add support to use `tel` as username - Fixes: [#40](https://github.com/splendido/accounts-templates-core/issues/40) - [`63924b5`](https://github.com/splendido/accounts-templates-core/commit/63924b58db3fff5e0b663005cb1d7fed36b20d5e)
* Add support to use custom validation with `func` - Fixes: [#39](https://github.com/splendido/accounts-templates-core/issues/39) - [`98d2962`](https://github.com/splendido/accounts-templates-core/commit/98d29626ee4067243d49c8b4269d57c574d851fe)
* Fixed display of services serparator - [`bfa2a7d`](https://github.com/splendido/accounts-templates-core/commit/bfa2a7d61fa660d1dc9441f23c0183ea50aee10a)
* Throw an error in case no account service is present - Fixes: [#33](https://github.com/splendido/accounts-templates-core/issues/33) - [`14fd1db`](https://github.com/splendido/accounts-templates-core/commit/14fd1db91fa9c623285d60eed1bb2781b1084d58)
* Accounts-t9n dependency moved to original repo - Fixes: [#32](https://github.com/splendido/accounts-templates-core/issues/32) - [`f2b4b86`](https://github.com/splendido/accounts-templates-core/commit/f2b4b86d6bf0d1fad86934d8c21c3457a7c79f55)
* Signin route redirects in case the user is already logged in - Fixes: [#36](https://github.com/splendido/accounts-templates-core/issues/36) - [`0d7b66d`](https://github.com/splendido/accounts-templates-core/commit/0d7b66d71f11a7f2ae79b66de85ecba14049bc4f)
* Added sigle template for accounts functionality, now using states - [`7ef32cf`](https://github.com/splendido/accounts-templates-core/commit/7ef32cf7d8b7335d585f90621e3413615b10755c)



## Master

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
