**Warning:** The update process of this new version of the documentation is still in progress and does not fully cover the API for the current release!

Although it will be very soon, please have a look at the [README_old.md](https://github.com/splendido/accounts-templates-core/blob/master/README_old.md) and the discussion about new features, issue [#34](https://github.com/splendido/accounts-templates-core/issues/34) to get directions about the new API. In the meanwhile, you can also check the repository for [test-accounts-templates-bootstrap](https://github.com/splendido/test-accounts-templates-bootstrap) which is up to date.

**I'm sorry for this inconvinience, I hope to get some spare time to realign everything (it should happen very soon though...)!**



accounts-templates-core
=======================

[![Build Status](https://travis-ci.org/splendido/accounts-templates-core.svg?branch=master)](https://travis-ci.org/splendido/accounts-templates-core)

accounts-templates-core is part of a suite of packages for the [Meteor.js](https://www.meteor.com/) platform. It provides higly customizable user accounts UI templates for many different frontend frameworks. At the moment it includes forms for sign in, sign up, forgot password, reset password, change password, enroll account, and link or remove of many 3rd party services.

Thanks to [accounts-t9n](https://github.com/softwarerero/meteor-accounts-t9n) you can switch to your preferred language on the fly! Available languages are now: Arabic, Czech, French, German, Italian, Polish, Portuguese, Russian, Slovenian, Spanish, Swedish and Vietnamese.

You can get a better idea about this heading to http://accounts-templates.meteor.com/ and then, on your choice, to:
* http://accounts-templates-bootstrap.meteor.com/
* http://accounts-templates-foundation.meteor.com/
* http://accounts-templates-semantic-ui.meteor.com/

If you have a production app using accounts templates, let me know! I'd like to add your link to the above ones.

Any comments, suggestions, testing efforts, and PRs are very very welcome! Please use the [repository](https://github.com/splendido/accounts-templates-core) issues tracker for reporting bugs, problems, ideas, discussions, etc.


<a name="documentation"/>
# Documentation

* [Features](#features)
* [Quick Start](#quickstart)
  * [Available Styled Versions](#available-styled-versions)
  * [Setup](#setup)
  * [Templates](#templates)
* [Basic Customization](#basic-customization)
  * [I18n Support](#i18n) 
  * [Configuration API](#configuration-api) 
  * [Routing](#routing)
  * [Options](#options)



<a name="features"/>
##Features

* fully customizable
* security aware
* internationalization support thanks to [accounts-t9n](https://github.com/softwarerero/meteor-accounts-t9n)
* custom sign-up fields
* robust server side sign-up field validation
* easy content protection 
* return to previous route after sign-in (even for random sign in choice and not only after required sign-in)
* fully reactive, Blaze fast!
* no use of `Session` object
* very easily stylizable for different font-end frameworks



<a name="quickstart"/>
##Quick Start


<a name="available-styled-versions"/>
###Available Styled Versions

* [accounts-templates-bootstrap](https://atmospherejs.com/package/accounts-templates-bootstrap) for [Twitter Bootstrap](http://getbootstrap.com/)
* [accounts-templates-foundation](https://atmospherejs.com/package/accounts-templates-foundation) for [Zurb Foundation](http://foundation.zurb.com/)
* [accounts-templates-semantic-ui](https://atmospherejs.com/package/accounts-templates-semantic-ui) for [Semantic UI](http://semantic-ui.com)
* plus others coming soon...


<a name="setup"/>
###Setup

Just choose one of the packages among the [aviable styled versions](#available-styled-versions) and install it via meteorite:

```Shell
mrt add accounts-templates-bootstrap
```

**Warning:** You don't have to add `accounts-templates-core` to your app! It is automatically added when you add `accounts-templates-<something>`...

Then call `AccountsTemplates.init()` **on both the client and the server**: the easiest way is to put the call inside a file shared between both. For example your file `lib/config/at_config.js` should contain at least the following line:

```javascript
AccountsTemplates.init();
```

And that's it!

...but don't expect to see much without doing something more ;-)
This is to let you configure your app exactly the way you wish, without imposing anything beforehand!


<a name="templates"/>
###Templates

There is **only one template** which is used to reactively draw appropriate sign in, sign up, forgot password, reset password, change password, and enroll account forms!

It is `atForm` and can be used anywhere you wish like this:

```html
{{> atForm}}
```

Its design is as *transparent* as possible making it play nicely with themes and personal css customizations! What more, it is not wrapped inside any *container* so that you can put it everywhere, including complex multi-column layouts.

In case you whish to *lock* the template to a particular state, you can also use, e.g.,

```html
{{> atForm state='signUp'}}
```

this will prevent the template to change its content. See [internal states](#internal-states) for more details...



<a name="basic-customization"/>
##Basic Customization


<a name="i18n"/>
### I18n Support

i18n is achieved using [accounts-t9n](https://atmospherejs.com/package/accounts-t9n). The only thing you have to do is ensure

```javascript
T9n.setLanguage('<lang>');
```

is called somewhere, whenever you want to switch language.


<a name="configuration-api"/>
###Configuration API

There are basically three way to interact with AccountsTemplates for basic configuration:
* AccountsTemplates.configureRoute(route_core, options);
* AccountsTemplates.configure(options);
* AccountsTemplates.init();

There is no specific order for the above calls to be effective, and you can do many of them possibly in different files, but `AccountsTemplates.init();` **should always come last**!
After `.init()` is called no more changes are allowed...

**The only other requirement is to make exactly the same calls on both the server and the client.** As already suggested, the best thing is to put everything inside a file shared between both. I suggest you use something like `lib/config/at_config.js`


<a name="routing"/>
##### Routing

There are no routes provided by default. But you can easily configure routes for sign in, sign up, forgot password, reset password, change password, enroll account using `AccountsTemplates.configureRoute`. This is done internally relying on the awesome [Iron-Router](https://atmospherejs.com/package/iron-router) package.

The simplest way is to make the call passing just the route code (available codes are: changePwd, enrollAccount, forgotPwd, resetPwd, signIn, signUp):

```javascript
AccountsTemplates.configureRoute('signIn');
```

This will setup the sign in route with a full-page form letting users access your app.

But you can also pass in more options to adapt it to your needs with:

```javascript
AccountsTemplates.configureRoute(route_code, options);
```

The following is a complete example of a route configuration:

```javascript
AccountsTemplates.configureRoute('signIn', {
    name: 'signin',
    path: '/login',
    template: 'myLogin',
    layoutTemplate: 'myLayout',
    redirect: '/user-profile',
});
```

Fields `name`, `path`, `template`, and `layoutTemplate` are passed down directly to Router.map (see the official iron router documentation [here](https://github.com/EventedMind/iron-router/#api) for more details), while `redirect` permits to specify where to redirect the user after successful form submit.

All the above fields are optional and fall back to default values in case you don't provide them. Default values are as follows:

| Route           | Code          | Name            | Path             | Template       |
| --------------- | ------------- | --------------- | ---------------  | -------------- |
| change password | changePwd     | atChangePwd     | /change-password | fullPageAtForm |
| enroll account  | enrollAccount | atEnrollAccount | /enroll-account  | fullPageAtForm |
| forgot password | forgotPwd     | atForgotPwd     | /forgot-password | fullPageAtForm |
| reset password  | resetPwd      | atResetPwd      | /reset-password  | fullPageAtForm |
| sign in         | signIn        | atSignIn        | /signin          | fullPageAtForm |
| sign up         | signUp        | atSignUp        | /signup          | fullPageAtForm |

If `layoutTemplate` is not specified, it falls back to what is currently set up with Iron-Router.
If `redirect` is not specified, it default to the previous route (obviously routes set up with `AccountsTemplates.configureRoute` are excluded to provide a better user experience). What more, when the login form is shown to protect private content, the user is redirect to the protected page after successfull sign in, regardless of whether a `redirect` parameter was passed for `signIn` route configuration or not (**Note:** you must configure the `signIn` route to get `AccountsTemplates.ensureSignedIn` working. See [XXX](XXX) to learn more about this).


<a name="options"/>
##### Options

By calling `AccountsTemplates.configure(options)` you can specify a bunch of choices regardin both visual appearence and behaviour.

The following is a complete example of options configuration (with fields in alphabetical order):

```javascript
AccountsTemplates.configure({
    confirmPassword: true,
    continuousValidation: false,
    displayFormLabels: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    formValidationFeedback: true,
    homeRoutePath: '/',
    overrideLoginErrors: true,
    privacyUrl: 'privacy',
    sendVerificationEmail: true,
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showPlaceholders: false,
    termsUrl: 'temrs-of-use'
});
```

Details for each of them follow.

* confirmPassword (Boolean):
* continuousValidation (Boolean):
* displayFormLabels (Boolean):
* enablePasswordChange (Boolean):
* forbidClientAccountCreation (Boolean):
* formValidationFeedback (Boolean):
* homeRoutePath (String):
* overrideLoginErrors (Boolean):
* privacyUrl (String):
* sendVerificationEmail (Boolean):
* showAddRemoveServices (Boolean):
* showForgotPasswordLink (Boolean):
* showPlaceholders (Boolean):
* termsUrl (String):