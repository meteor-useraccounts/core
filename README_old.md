[![Build Status](https://travis-ci.org/splendido/accounts-templates-core.svg?branch=master)](https://travis-ci.org/splendido/accounts-templates-core)
accounts-templates-core
=======================
Jump to [docs](#documentation).

### Warning

**This version of the documentation is not up to date with the current release!**

**Although it will be very soon, please have a look at the discussion about new features, issue [#34](https://github.com/splendido/accounts-templates-core/issues/34), to get directions about the new API. In the meanwhile, you can also check the repository for [test-accounts-templates-bootstrap](https://github.com/splendido/test-accounts-templates-bootstrap) which is up to date.**

**I'm sorry for this inconvinience, I hope to get some spare time to realign everything (it should happen very soon though...)!**

###Features

* easily stylizable for different font-end frameworks
* fully customizable sign-up fields
* robust field validation
* internationalization support
* easy content protection
* return to previous route after sign-in (even for random sign in choice and not only after required sign-in)
* fully reactive
* no use of `Session` object


### Warning

**You don't have to manually add this package to your app**. It is automatically added when you add `accounts-templates-bootstrap` or `accounts-templates-foundation`, etc.

**This project is still Work In Progress**: any comments, suggestions, testing efforts, and PRs are very very welcome. Please use the [repo](https://github.com/splendido/accounts-templates-core) page for issues, discussions, etc.
Anyone interested in creating a styled version for new front-end frameworks can send an issue on the repo or start his own package. Following what is actually inside [accounts-templates-bootstrap](https://github.com/splendido/accounts-templates-bootstrap) should be easy enough to get done.

This is a Meteor package used by [accounts-templates-bootstrap](https://atmospherejs.com/package/accounts-templates-bootstrap), [accounts-templates-foundation](https://atmospherejs.com/package/accounts-templates-foundation), etc.


<a name="documentation"/>
# Documentation

##### Table of Contents
* [Styled versions](#styled-versions)
* [Setup](#setup)
* [Templates](#templates)
* [Configuration](#configuration)
  * [Appearance](#appearance)
  * [SignUp Fields](#signup-fields)
  * [Routing](#routing)
  * [Social](#social)
* [Disabling Client-side Accounts Creation](#disabling-client-side-accounts-creation)
* [Content Protection](#content-protection)
* [Internationalization support](#internationalization-support)
* [Forgot Password](#forgot-password)
* [Notes](#notes)
* [Option details](#option-details-3)
  * [Appearence option details](#appearence-option-details)
  * [SignUp field option details](#signup-field-option-details)
  * [Routing option details](#routing-option-details)


###Styled versions

* [Twitter Bootstrap](http://getbootstrap.com/) (see [accounts-templates-bootstrap](https://atmospherejs.com/package/accounts-templates-bootstrap))
* [Semantic UI](http://semantic-ui.com) (see [accounts-templates-semantic-ui](https://atmospherejs.com/package/accounts-templates-semantic-ui)) 
* [Zurb Foundation](http://foundation.zurb.com/) (see [accounts-templates-foundation](https://atmospherejs.com/package/accounts-templates-foundation)) 
* others (coming soon...).

###Setup

Just choose one of the [aviable styled](#styled-versions) versions and install it via meteorite.

```Shell
mrt add accounts-templates-bootstrap
```
Then call `.init()` **inside a file included for both the client and the server**.

```javascript
AccountsTemplates.init();
```




###Templates

For now there is only one template which is used to reactively draw appropriate sign in, sign up, forgot password, and logout forms via template states.
It is called `signinForm` and can be included anywhere you wish.
For example, to get a full-page login form, you might want to declare a template this way (supposing you're using `accounts-templates-bootstrap`):

```html
<template name="fullPageSigninForm">
  <div class="container">
    <div class="row">
      <div class="col-md-5 col-md-offset-3">
          {{> signinForm}}
      </div>
    </div>
  </div>
</template>
```

Actually, this template must exist inside styled version of the package and is used as a default template when configuring sign-* routes without specifying custom templates.

Please note that `signinForm` does not wrap itself inside a `<div class="container">`, nor the likes for frameworks different than bootstrap, which lets you put it wherever you wish, including complicated multi-column layouts.
See, e.g., the [official bootstrap documentation](http://getbootstrap.com/css/#overview-container) where they say *containers are not nestable by default*.



###Configuration

To specify configuration options you need to call `.configure` before `.init()` in order to specify non-default parameter values.

```javascript
AccountsTemplates.configure({
    //these are the default values
    showPlaceholders: false,
    postSignUpRoutePath: '/profile'
});
```
After `.init()` is called no more changes are allowed


#### Appearance
######[`option details`](#appearence-option-details)

```javascript
AccountsTemplates.configure({
    //these are the default values
    showPlaceholders: true,
    displayFormLabels: true,
    formValidationFeedback: true,
    continuousValidation: true,
    showAddRemoveServices: false,
});

```



#### SignUp fields
######[`option details`](#signup-field-option-details)

The most interesting part is about sign up field customization. With very few lines a new field can be added to the sign-up form.



##### Add a field

```javascript
AccountsTemplates.addField({
    name: 'phone',
    type: 'tel',
    displayName: "Landline Number",
});
```

The above snippet asks `AccountsTemplates` to draw an additional input element within the sign-up form.



##### Add fields at once

Another possibility is to add many additional fields at once using `addFields`:

```javascript
AccountsTemplates.addFields([
    {
        name: 'phone',
        type: 'tel',
        displayName: "Landline Number",
    },
    {
        name: 'fax',
        type: 'tel',
        displayName: "Fax Number",
    }
]);

AccountsTemplates.init();
```

##### Remove fields


There is also a `removeField` method which can be used to remove predefined required fields and adding them again specify different options.

```javascript
AccountsTemplates.removeField('password');
AccountsTemplates.addField({
    name: 'password',
    type: 'password',
    required: true,
    minLength: 6,
    re: "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}",
    errStr: 'At least 1 digit, 1 lowercase and 1 uppercase',
});

AccountsTemplates.init();
```






#### Routing
######[`option details`](#routing-option-details)

There are no routes provided by default. But you can configure `AccountsTemplates` to have a set of routes dedicated to sign-* actions.

The following is a complete example of routing configuration:

```javascript
AccountsTemplates.configure({
    homeRoutePath: 'home';
    signInRoutePath: '/sign-in',
    signInRouteName: 'signInPage',
    signInRouteTemplate: 'fullPageSigninForm',
    signUpRoutePath: '/sign-up',
    signUpRouteName: 'signUpPage',
    signUpRouteTemplate: 'fullPageSigninForm',
    postSignUpRoutePath: '/profile',
    forgotPwdRoutePath: '/forgot-pwd',
    forgotPwdRouteName: 'forgotPwdPage',
    forgotPwdRouteTemplate: 'fullPageSigninForm'
});
```

This tells `AccountsTemplates` to set up a named route for each of the possible actions also specifying their paths and custom templates to be used. More in details:






####Social

Normally, if you have not configured a social account with, e.g.,

```javascript
Meteor.startup(function() {
  // Add Google configuration
  ServiceConfiguration.configurations.insert({
    "service": "google",
    "clientId": "092349872347-kdsfoisdfk98s023lkfas8230gvqaq4p.apps.googleusercontent.com",
    "client_email": "656546464326-flkamsldkoaisaèps0023k9309asdq4p@developer.gserviceaccount.com",
    "secret": "lkasdlLKJDsbaahKJBaksjIT"
  });
});
```

social buttons are not shown. To allow display buttons with, e.g., 'Configure Google', simply add packages `accounts-ui` and `accounts-ui-unstyled` with:

```Shell
mrt add accounts-ui
mrt add accounts-ui-unstyled
```





<a name="accountsCreation"/>
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









<a name="protection"/>
### Content Protection

**Note: the following won't work unless you set up a sign-in route!!!**

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

In this case only `private1` and `private2` routes are protected with sign-in access. Please note how the parameter `pause` is used inside `onBeforeAction` for route `private2` in order to achieve correct functioning (see [here](https://github.com/EventedMind/iron-router/blob/master/lib/client/route_controller.js#L234)).

possibly have a look at the iron-router [documentation](https://github.com/EventedMind/iron-router/blob/master/DOCS.md) for more details.


<a name="i18n"/>
### Internationalization support

i18n is achieved using [accounts-t9n](https://atmospherejs.com/package/accounts-t9n). The only thing you have to do is ensure

```javascript
T9n.setLanguage('<lang>');
```

is called somewhere, whenever you want to switch language.


<a name="forgotpassword"/>
### Forgot Password

As soon as you configure the email service you'll see the usual 'Forgot Email?' link.
To do so you need to set the environment variable MAIL_URL and add the package `email`. See the official Meteor [documentation](http://docs.meteor.com/#email) for more details.


###Notes

This package provides the `AccountsTemplates` object used by the other accounts-templates-* packages.

It is **heavily** based on the awesome package [accounts-entry]() written by [Differential](http://differential.io/).

...but, hopefully, it is more flexible and customizable other than very easily stylizable for many different front-end frameworks. This is because all the core logic, templates' helpers and events are contained inside `accounts-templates-core` which is automatically installed as soon as you add one of the styled packages.


Another interesting point is about the given possibility to customize the list of sign-up fields specifying for each one **validation rules enforced both client and server side**.

It also uses [iron-router](https://atmospherejs.com/package/iron-router) for basic routing and content protection and [accounts-t9n](https://atmospherejs.com/package/accounts-t9n) for internationalization support.

Use of the great package [accounts-merge](https://atmospherejs.com/package/accounts-merge), for permitting a user to have many different social accounts configured under the same user object, is also under investigation. But since `accounts-merge` is still a young package it won't be included inside published versions unless we'll all be sure there are no security issues with it.



### Option details


#### Appearence option details

* `showPlaceholders` - (Boolean, default true) Specifies whether to display placeholder text inside input elements.
* `displayFormLabels` - (Boolean, default true) Specifies whether to display text labels above input elements.
* `formValidationFeedback` - (Boolean, default true) [**works only with bootstrap**] Specifies whether to display validation feed-back inside input elements: see [here](http://getbootstrap.com/css/#forms-control-validation) inside the subsection *With optional icons*.
* `continuousValidation` - (Boolean, default true) Specifies whether to continuously validate field values while the user is typing. *Continuous validation is performed client-side only to save round trips with the server*.
* `showAddRemoveServices` - (Boolean, default false) Tells whether to show soccial account buttons also when the user is signed in. In case it is set to true, the text of buttons will change from 'Sign in With XXX' to 'Add XXX' or 'Remove XXX' when the user signs in. 'Add' will be used if that particular service is still not assiciated with the current account, while 'Remove' is used only in case a particular service is already used by the user **and** there are at least two services available for sign in operations. Clicks on 'Add XXX' trigger the call to `Meteor.loginWithXXX`, as usual, while click on 'Remove XXX' will call the method `ATRemoveService` provided by accounts-templates. This means you need to have some additional logic to deal with the call `Meteor.loginWithXXX` in order to actually add the service to the user account. One solution to this is to use the package [accounts-meld](https://atmospherejs.com/package/accounts-meld) which was build exactly for this puspore.

#### SignUp field option details

* `name` - (**required** String) The name of the field to be also used as attribute name into `Meteor.user().profile`. Usually all lower-case letters
* `type` - (**required** String) Specifies the input element type: at the moment supported inputs are: `password`, `email`, `text`, `tel`, `url`. More to come...
* `required` - (optional Boolean, default false) Set the field as required, which means it cannot be left blank.
* `displayName` - (optional String) The field name to be shown as text label above the input element. In case nothing is specified, the capitalized `name` is used. The text label is shown only if `displayFormLabels` options is set to true.
* `placeholder` - (optional String) Specifies the placeholder text to be shown inside the input element. In case nothing is specified, the `displayName` or, if not available, the capitalized `name` is used. The placeholder is shown only if `showPlaceholders` options is set to true.
* `minLength` - (optional Integer, default none) If specified require the content of the field to be at least `minLength` characters.
* `maxLength` - (optional Integer, default none) If specified require the content of the field to be at most `maxLength` characters.
* `re` - (optional ReGex, default none) Possibly specifies the regular expression to be used for field's content validation. Validation is performed both client-side (at every input change iff `continuousValidation` option is set to true) and server-side once the sign-up request is submitted.
* `errStr` - (optional String) Error string to be displayed in case re validation fails. It can also be a [accounts-t9n](https://atmospherejs.com/package/accounts-t9n) registered label, in which case it will be translated based on the currently selected language. To see how to register new labels, please refer to the official [documentation](https://github.com/softwarerero/meteor-accounts-t9n#define-translations).

#### Routing option details

* `homeRoutePath` - (optional String, default `/`) Tells `AccountsTemplates.ensureSignedIn` which is your home route: it used for some redirect in case the previous route is not available and after logout.
* `signInRoutePath` - (optional String, default none) Specifies the path for the sign-in action.
* `signInRouteName` - (optional String, default `signIn`) Specifies the name to be given to the sign in route to be used with iron-router helpers.
* `signInRouteTemplate` - (optional String) When specified tells `AccountsTemplates` to render a custom template when headed to the sign-in page. This custom template should include, anywhere convenient, `{{> signinForm}}` in order to get the provided sign-in form. If nothing is specified, `fullPageSigninForm` template is used to get a full page sign in form. **Note: signInRouteTemplate is also used by `AccountsTemplates.ensureSignedIn` to know what to render in case the access to a particular route is protected.**
* `signUpRoutePath` - (optional String, default none) Specifies the path for the sign-up action. When not set, signInRoutePath is used also for sign-up, if neither this is specified no redirection is applied and all happens inside the same template.
* `signUpRouteName` - (optional String, default `signUp`) Specifies the name to be given to the sign in route to be used with iron-router helpers.
* `signUpRouteTemplate` - (optional String) When specified tells `AccountsTemplates` to render a custom template when headed to the sign-up page. This custom template should include, anywhere convenient, `{{> signinForm}}` in order to get the provided sign-up form. If nothing is specified, `fullPageSigninForm` template is used to get a full page sign up form.
* `postSignUpRoutePath` - (optional String, default `/`) Specifies where to head to after a successful sign-up.
* `forgotPwdRoutePath` - (optional String, default none) Specifies the path for the forgot password action. When not set, signInRoutePath is used also for forgot password, if neither this is specified no redirection is applied and all happens inside the same template.
* `forgotPwdRouteName` - (optional String, default `forgotPwd`) Specifies the name to be given to the forgot password route to be used with iron-router helpers.
* `forgotPwdRouteTemplate` - (optional String) When specified tells `AccountsTemplates` to render a custom template when headed to the forgot password page. This custom template should include, anywhere convenient, `{{> signinForm}}` in order to get the provided forgot-password form. If nothing is specified, `fullPageSigninForm` template is used to get a full page forgot password form.

