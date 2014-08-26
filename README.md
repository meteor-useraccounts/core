**Warning:** The update process of this new version of the documentation is still in progress and does not fully cover the API for the current release!

Although it will be very soon, please have a look at the [README_old.md](https://github.com/splendido/accounts-templates-core/blob/master/README_old.md) and the discussion about new features, issue [#34](https://github.com/splendido/accounts-templates-core/issues/34) to get directions about the new API. In the meanwhile, you can also check the repository for [test-accounts-templates-bootstrap](https://github.com/splendido/test-accounts-templates-bootstrap) which is up to date.

**I'm sorry for this inconvinience, I hope to get some spare time to realign everything (it should happen very soon though...)!**



accounts-templates-core
=======================

[![Build Status](https://travis-ci.org/splendido/accounts-templates-core.svg?branch=master)](https://travis-ci.org/splendido/accounts-templates-core)

accounts-templates-core is part of a suite of packages for the [Meteor.js](https://www.meteor.com/) platform. It provides higly customizable user accounts UI templates for many different frontend frameworks. At the moment it includes forms for sign in, sign up, forgot password, reset password, change password, enroll account, and link or remove of many 3rd party services.


The package `accounts-templates-core` contains all the core logic and templates' helpers and events used by dependant packages providing styled versions of the accounts UI.
This means that developing a version of the UI with a different styling is just a matter of writing a few dozen of html lines, nothing more!

Thanks to [accounts-t9n](https://github.com/softwarerero/meteor-accounts-t9n) you can switch to your preferred language on the fly! Available languages are now: Arabic, Czech, French, German, Italian, Polish, Portuguese, Russian, Slovenian, Spanish, Swedish and Vietnamese.

It also uses [iron-router](https://atmospherejs.com/package/iron-router) for basic routing and content protection.

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
  * [Options](#options)
  * [Routing](#routing)
  * [Content Protection](#content-protection)
* [Advanced Customization](#advanced-customization)
  * [Disabling Client-side Accounts Creation](#disabling-client-side-accounts-creation)
  * [Form Fields Configuration](#form-fields-configuration)
* [Side Notes](#side-notes)
  * [3rd Party Login Services Configuration](#3rd-party-login-services-configuration)

<a name="features"/>
## Features

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
## Quick Start


<a name="available-styled-versions"/>
### Available Styled Versions

* [accounts-templates-bootstrap](https://atmospherejs.com/package/accounts-templates-bootstrap) for [Twitter Bootstrap](http://getbootstrap.com/)
* [accounts-templates-foundation](https://atmospherejs.com/package/accounts-templates-foundation) for [Zurb Foundation](http://foundation.zurb.com/)
* [accounts-templates-semantic-ui](https://atmospherejs.com/package/accounts-templates-semantic-ui) for [Semantic UI](http://semantic-ui.com)
* plus others coming soon...


<a name="setup"/>
### Setup

Just choose one of the packages among the [aviable styled versions](#available-styled-versions) and install it via meteorite:

```Shell
mrt add accounts-templates-bootstrap
```

**Warning:** You don't have to add `accounts-templates-core` to your app! It is automatically added when you add `accounts-templates-<something>`...

Then add at least one login service:

```Shell
mrt add accounts-password
mrt add accounts-facebook
mrt add accounts-github
mrt add accounts-google
mrt add accounts-linkedin
...
```

**Note**: 3rd party services need to be configured... more about this [here](http://docs.meteor.com/#meteor_loginwithexternalservice)

And finally call `AccountsTemplates.init()` **on both the client and the server**: the easiest way is to put the call inside a file shared between both. For example your file `lib/config/at_config.js` should contain at least the following line:

```javascript
AccountsTemplates.init();
```

And that's it!

...but don't expect to see much without doing something more ;-)
This is to let you configure your app exactly the way you wish, without imposing anything beforehand!


<a name="templates"/>
### Templates

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
## Basic Customization


<a name="i18n"/>
### I18n Support

i18n is achieved using [accounts-t9n](https://atmospherejs.com/package/accounts-t9n). The only thing you have to do is ensure

```javascript
T9n.setLanguage('<lang>');
```

is called somewhere, whenever you want to switch language.


<a name="configuration-api"/>
### Configuration API

There are basically three way to interact with AccountsTemplates for basic configuration:
* AccountsTemplates.configureRoute(route_core, options);
* AccountsTemplates.configure(options);
* AccountsTemplates.init();

There is no specific order for the above calls to be effective, and you can do many of them possibly in different files, but `AccountsTemplates.init();` **should always come last**!
After `.init()` is called no more changes are allowed...

**The only other requirement is to make exactly the same calls on both the server and the client.** As already suggested, the best thing is to put everything inside a file shared between both. I suggest you use something like `lib/config/at_config.js`


<a name="options"/>
#### Options

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

| Option                      | Type    | Default | Description |
| --------------------------- | ------- | ------- | ----------- |
| confirmPassword             | Boolean |
| continuousValidation        | Boolean |
| displayFormLabels           | Boolean |
| enablePasswordChange        | Boolean |
| forbidClientAccountCreation | Boolean |
| formValidationFeedback      | Boolean |
| homeRoutePath               | String  |
| overrideLoginErrors         | Boolean |
| privacyUrl                  | String  |
| sendVerificationEmail       | Boolean |
| showAddRemoveServices       | Boolean |
| showForgotPasswordLink      | Boolean |
| showPlaceholders            | Boolean |
| termsUrl                    | String  |


<a name="routing"/>
#### Routing

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
If `redirect` is not specified, it default to the previous route (obviously routes set up with `AccountsTemplates.configureRoute` are excluded to provide a better user experience). What more, when the login form is shown to protect private content (see [Content Protection](#content-protection), the user is redirect to the protected page after successfull sign in or sign up, regardless of whether a `redirect` parameter was passed for `signIn` or `signUp` route configuration or not.


<a name="content-protection"/>
#### Content Protection

There is a method which permits to prompt for the sign in form for the pages requiring the user to be signed in. It is:

```javascript
AccountsTemplates.ensureSignedIn
```

It behaves nicely letting the required route path inside the address bar and bringing you back to the same route once logged in.

In case you want to protect about all of your routes you might want to set up your Router this way:

```javascript
Router.onBeforeAction(AccountsTemplates.ensureSignedIn, {
    except: ['home', 'login', 'signup', 'forgotPassword']
});
```

if, instead, it's only a bunch of routes to be protected you could do:

```javascript
Router.onBeforeAction(AccountsTemplates.ensureSignedIn, {
    only: ['profile', 'privateStuff']
});
```

Another possibility is to set up single routes one after the another. For example:

```javascript
Router.map(function() {
    this.route('home', {
        path: '/',
        template: 'homeMain'
    });

    this.route('aboutPage', {
        path: '/about',
        template: 'about'
    });

    this.route('private1', {
        path: '/private1',
        template: 'privatePage1',
        onBeforeAction: AccountsTemplates.ensureSignedIn
    });

    this.route('private2', {
        path: '/private2',
        template: 'privatePage2',
        onBeforeAction: function(pause){
            AccountsTemplates.ensureSignedIn(pause);

            // Some more stuff to check advanced permission an the like...
        }
    });
});
```

In this case only `private1` and `private2` routes are protected with sign-in access. Please note how the parameter `pause` is used inside `onBeforeAction` for route `private2` in order to achieve correct functioning (see [here](https://github.com/EventedMind/iron-router/blob/devel/DOCS.md#before-and-after-hooks)).

possibly have a look at the iron-router [documentation](https://github.com/EventedMind/iron-router/blob/master/DOCS.md) for more details.



<a name="advances-customization"/>
## Advanced Customization


<a name="disabling-client-side-accounts-creation"/>
### Disabling Client-side Accounts Creation

AccountsTemplates disables by default accounts creation on the client. This is done to use a dedicated method called `ATCreateUserServer` **(sending the password on the wire already hashed as usual...)** to create the new users server-side.
This way a bulletproof profile fields full validation can be performed.
But there is one more parameter to set in case you'd like to forbid client-side accounts creation, which is the following:

* `forbidClientAccountCreation` - (Boolean, default true) Specifies whether to forbid accounts creation from the client.

it is exactly the same provided by the Accounts object, so this means you need to do:

```javascript
AccountsTemplates.config({
    forbidClientAccountCreation: true
});
```

instead of the usual:

```javascript
Accounts.config({
  forbidClientAccountCreation : true
});
```


<a name="form-fields-configuration"/>
### Form Fields Configuration

Every input field appearing inside AccountsTemplates forms can be easily customized both for appearance and validation behaviour.
One of the most interesting part is that custom additinal sign up fiels can be also added to the sign up form!

Each field object is represented by the following properties:

| Property    | Type     | Required | Description                                                           |
| ----------- | -------- |:--------:| --------------------------------------------------------------------- |
| _id         | String   |    X     | A unique field's id / name (internal use only) to be also used as attribute name into `Meteor.user().profile` in case it identifies an additinoal sign up field. Usually all lower-case letters. |
| type        | String   |    X     | Specifies the input element type: at the moment supported inputs are: `password`, `email`, `text`, `tel`, `url`. Other input types like checkbox, and select are likely to be supported in some future release. |
| required    | Boolean  |          | When set to true the corresponding field cannot be left blank.|
| displayName | String   |          | The field name to be shown as text label above the input element. In case nothing is specified, the capitalized `_id` is used. The text label is shown only if `displayFormLabels` options is set to true.  |
| placeholder | String   |          | Specifies the placeholder text to be shown inside the input element. In case nothing is specified, the `displayName` or, if not available, the capitalized `_id` will be used. The placeholder is shown only if `showPlaceholders` option is set to true. |
| minLength   | Integer  |          | If specified requires the content of the field to be at least `minLength` characters. |
| maxLength   | Integer  |          | If specified require the content of the field to be at most `maxLength` characters. |
| re          | RegExp   |          | Possibly specifies the regular expression to be used for field's content validation. Validation is performed both client-side (at every input change iff `continuousValidation` option is set to true) and server-side on form submit. |
| func        | Function |          | Custom function to be used for validation.                            |
| errStr      | String   |          | Error message to be displayed in case re or func validation fail.    |

`displayName`, `placeholder`, and `errStr` can also be an [accounts-t9n](https://atmospherejs.com/package/accounts-t9n) registered key, in which case it will be translated based on the currently selected language.
In case you'd like to specify a key which is not already provided by accounts-t9n you can always map your own keys. To learn how to register new labels, please refer to the official [documentation](https://github.com/softwarerero/meteor-accounts-t9n#define-translations).

#### Special Field's Ids

There are a number of special ids used for basic input fields. These are:

* username
* email
* username_and_email
* password
* password_again
* current_password
* new_password
* new_password_again

Any other id will be interpreted as an additional sign up field.
In case aspecial field is not explicitely added, it will be automatically inserted at initialization time (with appropriate default properties).

#### Add a field

You can use `AccountsTemplates.addField(options)` to configure an input field. This apply for both special fields and custom ones.
For example you can do:

```javascript
AccountsTemplates.addField({
    _id: 'phone',
    type: 'tel',
    displayName: "Landline Number",
});
```

The above snippet asks `AccountsTemplates` to draw an additional input element within the sign-up form.

#### Add many fields at once

Another possibility is to add many additional fields at once using `addFields`:

```javascript
AccountsTemplates.addFields([
    {
        _id: 'phone',
        type: 'tel',
        displayName: "Landline Number",
    },
    {
        _id: 'fax',
        type: 'tel',
        displayName: "Fax Number",
    }
]);
```

#### Remove fields

There is also a `removeField` method which can be used to remove predefined required fields and adding them again specify different options.

```javascript
AccountsTemplates.removeField('password');
AccountsTemplates.addField({
    _id: 'password',
    type: 'password',
    required: true,
    minLength: 6,
    re: "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}",
    errStr: 'At least 1 digit, 1 lowercase and 1 uppercase',
});
```


<a name="side-notes"/>
## Side Notes

<a name="3rd-party-login-services-configuration"/>
### 3rd Party Login Services Configuration

Normally, if you have not configured a social account with, e.g.,

```javascript
// Set up login services
Meteor.startup(function() {
    // Remove configuration entries in case service is already configured
    ServiceConfiguration.configurations.remove({$or: [
        {service: "facebook"},
        {service: "github"}
    ]});

    // Add Facebook configuration entry
    ServiceConfiguration.configurations.insert({
        "service": "facebook",
        "appId": "XXXXXXXXXXXXXXX",
        "secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    });

    // Add GitHub configuration entry
    ServiceConfiguration.configurations.insert({
        "service": "github",
        "clientId": "XXXXXXXXXXXXXXXXXXXX",
        "secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    });
});
```

3rd party login buttons are not shown. To allow display buttons with, e.g., 'Configure Foobook', simply add the package `accounts-ui` with:

```Shell
mrt add accounts-ui
```

**Warning**: At the moment the UI for service configuration is not supported and the one provided by `accounts-ui` will be shown!