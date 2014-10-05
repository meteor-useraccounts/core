splendido:accounts-templates-core
=================================

[![Build Status](https://travis-ci.org/splendido/accounts-templates-core.svg?branch=master)](https://travis-ci.org/splendido/accounts-templates-core)

accounts-templates-core is part of a suite of packages for the [Meteor.js](https://www.meteor.com/) platform. It provides highly customizable user accounts UI templates for many different front-end frameworks. At the moment it includes forms for sign in, sign up, forgot password, reset password, change password, enroll account, and link or remove of many 3rd party services.


The package `accounts-templates-core` contains all the core logic and templates' helpers and events used by dependant packages providing styled versions of the accounts UI.
This means that developing a version of the UI with a different styling is just a matter of writing a few dozen of html lines, nothing more!

Thanks to [accounts-t9n](https://github.com/softwarerero/meteor-accounts-t9n) you can switch to your preferred language on the fly! Available languages are now: Arabic, Czech, French, German, Italian, Polish, Portuguese, Russian, Slovenian, Spanish, Swedish and Vietnamese.

It also uses [iron-router](https://atmospherejs.com/package/iron-router) for basic routing and content protection.

You can get a better idea about this heading to http://accounts-templates.meteor.com/ and then, on your choice, to:
* http://accounts-templates-bootstrap.meteor.com/
* http://accounts-templates-foundation.meteor.com/
* http://accounts-templates-semantic-ui.meteor.com/

Any comments, suggestions, testing efforts, and PRs are very very welcome! Please use the [repository](https://github.com/splendido/accounts-templates-core) issues tracker for reporting bugs, problems, ideas, discussions, etc..

## Who's using this?

* [Telescope](http://www.telesc.pe/)
* [Henfood](http://labs.henesis.eu:4363/)

Aren't you on the list?!
If you have a production app using accounts templates, let me know! I'd like to add your link to the above ones.


<a name="documentation"/>
# Documentation

* [Features](#features)
* [Quick Start](#quickstart)
  * [Available Versions](#available-versions)
  * [Setup](#setup)
  * [Templates](#templates)
* [Basic Customization](#basic-customization)
  * [I18n Support](#i18n)
  * [Configuration API](#configuration-api)
  * [Options](#options)
  * [Routing](#routing)
  * [Content Protection](#content-protection)
* [Advanced Customization](#advanced-customization)
  * [Form Title](#form-title)
  * [Button Text](#button-text)
  * [Disabling Client-side Accounts Creation](#disabling-client-side-accounts-creation)
  * [Form Fields Configuration](#form-fields-configuration)
  * [CSS Rules](#css-rules)
* [Side Notes](#side-notes)
  * [3rd Party Login Services Configuration](#3rd-party-login-services-configuration)
* [Contributing](#contributing)


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


<a name="available-versions"/>
### Available Versions

* [splendido:accounts-templates-unstyled](https://atmospherejs.com/package/accounts-templates-unstyled) with plain html and no CSS rules
* [splendido:accounts-templates-bootstrap](https://atmospherejs.com/package/accounts-templates-bootstrap) styled for [Twitter Bootstrap](http://getbootstrap.com/)
* [splendido:accounts-templates-foundation](https://atmospherejs.com/package/accounts-templates-foundation) styled for [Zurb Foundation](http://foundation.zurb.com/)
* [splendido:accounts-templates-semantic-ui](https://atmospherejs.com/package/accounts-templates-semantic-ui) styled for [Semantic UI](http://semantic-ui.com)
* plus others coming soon...


<a name="setup"/>
### Setup

Just choose one of the packages among the [aviable styled versions](#available-styled-versions) and install it via meteorite:

```Shell
meteor add splendido:accounts-templates-bootstrap
```

**Warning:** You don't have to add `splendido:accounts-templates-core` to your app! It is automatically added when you add `splendido:accounts-templates-<something>`...

Then add at least one login service:

```Shell
meteor add accounts-password
meteor add accounts-facebook
meteor add accounts-google
...
```

**Note**: 3rd party services need to be configured... more about this [here](http://docs.meteor.com/#meteor_loginwithexternalservice)

And finally call `AccountsTemplates.init()` **at meteor startup, on both the client and the server**: the easiest way is to put the call inside a file shared between both. For example your file `lib/config/at_config.js` should contain at least the following lines:

```javascript
Meteor.startup(function(){
    AccountsTemplates.init();
});
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

In case you wish to *lock* the template to a particular state, you can also use, e.g.,

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

There are basically few different ways to interact with AccountsTemplates for basic configuration:
* AccountsTemplates.configureRoute(route_code, options);
* AccountsTemplates.configure(options);
* AccountsTemplates.init();

There is no specific order for the above calls to be effective, and you can do many of them possibly in different files, but `AccountsTemplates.init();` **should always come last**!
After `.init()` is called no more changes are allowed...

**The only other requirement is to make exactly the same calls on both the server and the client.** As already suggested, the best thing is to put everything inside a file shared between both. I suggest you use something like `lib/config/at_config.js`


<a name="options"/>
#### Options

By calling `AccountsTemplates.configure(options)` you can specify a bunch of choices regarding both visual appearance and behaviour.

The following is a complete example of options configuration (with fields in alphabetical order):

```javascript
AccountsTemplates.configure({
    // Behaviour
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: true,

    // Client-side Validation
    continuousValidation: false,
    negativeFeedback: false,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,

    // Privacy Policy and Terms of Use
    privacyUrl: 'privacy',
    termsUrl: 'terms-of-use',

    // Redirects
    homeRoutePath: '/home',
    redirectTimeout: 4000,

    // Texts
    buttonText: {
        signUp: "Sign Up Now!"
    },
    title: {
        forgotPwd: "Recover Your Passwod"
    },
});
```

Details for each of them follow.

| Option                      | Type    | Default   | Description |
| --------------------------- | ------- | --------- | ----------- |
| Behaviour                   |         |           |             |
| confirmPassword             | Boolean | true      | Specifies whether to ask the password twice for confirmation. This has no effect on the sign in form. |
| enablePasswordChange        | Boolean | false     | Specifies whether to allow to show the form for password change. Note: In case the `changePwd` route is not configures, this is to be done *manually* inside some custom template. |
| forbidClientAccountCreation | Boolean | false     | Specifies whether to forbid user registration from the client side. In case it is set to true, neither the link for user registration nor the sign up form will be shown. |
| overrideLoginErrors         | Boolean | true      |             |
| sendVerificationEmail       | Boolean | false     | Specifies whether to send the verification email after successful registration. |
| redirectTimeout             | Number  | 2000      | Specifies a timeout time for the redirect after successful form submit on `enrollAccount`, `forgotPwd`, `resetPwd`, and `verifyEmail` routes. |
| Appearance                  |         |           |             |
| showAddRemoveServices       | Boolean | false     | Tells whether to show social account buttons also when the user is signed in. In case it is set to true, the text of buttons will change from 'Sign in With XXX' to 'Add XXX' or 'Remove XXX' when the user signs in. 'Add' will be used if that particular service is still not associated with the current account, while 'Remove' is used only in case a particular service is already used by the user **and** there are at least two services available for sign in operations. Clicks on 'Add XXX' trigger the call to `Meteor.loginWithXXX`, as usual, while click on 'Remove XXX' will call the method `ATRemoveService` provided by accounts-templates. This means you need to have some additional logic to deal with the call `Meteor.loginWithXXX` in order to actually add the service to the user account. One solution to this is to use the package [accounts-meld](https://atmospherejs.com/package/accounts-meld) which was build exactly for this purpose. |
| showForgotPasswordLink      | Boolean | false     |             |
| showLabels                  | Boolean | true      | Specifies whether to display text labels above input elements. |
| showPlaceholders            | Boolean | true      | Specifies whether to display place-holder text inside input elements. |
| Texts                       |         |           |             |
| buttonText                  | Object  |           | Permits to specify the text to be shown on the submit button for each form state (see [below](#button-text)). |
| title                       | Object  |           | Permits to specify the title to be shown for each form state (see [below](#form-title)). || Client-side Validation      |         |           |             |
| Client-side Validation      |         |           |             |
| continuousValidation        | Boolean | false     | Specifies whether to continuously validate fields' value while the user is typing. *It is performed client-side only to save round trips with the server*. |
| negativeFeedback            | Boolean | false     | Specifies whether to highlight input elements in case of negative validation. |
| negativeValidation          | Boolean | false     | Specifies whether to highlight input elements in case of positive validation. |
| positiveValidation          | Boolean | false     | Specifies whether to display negative validation feed-back inside input elements. |
| positiveFeedback            | Boolean | false     | Specifies whether to display positive validation feed-back inside input elements. |
| Links                       |         |           |             |
| homeRoutePath               | String  | '/'       | Path for the home route, to be possibly used for redirects after successful form submission. |
| privacyUrl                  | String  | undefined | Path for the route displaying the privacy document. In case it is specified, a link to the page will be displayed at the bottom of the form (when appropriate). |
| termsUrl                    | String  | undefined | Path for the route displaying the document about terms of use. In case it is specified, a link to the page will be displayed at the bottom of the form (when appropriate). |


<a name="routing"/>
#### Routing

There are no routes provided by default. But you can easily configure routes for sign in, sign up, forgot password, reset password, change password, enroll account using `AccountsTemplates.configureRoute`. This is done internally relying on the awesome [Iron-Router](https://atmospherejs.com/package/iron-router) package.

The simplest way is to make the call passing just the route code (available codes are: changePwd, enrollAccount, forgotPwd, resetPwd, signIn, signUp):

```javascript
AccountsTemplates.configureRoute('signIn');
```

This will set up the sign in route with a full-page form letting users access your app.

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

Fields `name`, `path`, `template`, and `layoutTemplate` are passed down directly to Router.map (see the official iron router documentation [here](https://github.com/EventedMind/iron-router/#api) for more details), while `redirect` permits to specify where to redirect the user after successful form submit. Actually, `redirect` can be a function so that, for example, the following:

```javascript
AccountsTemplates.configureRoute('signIn', {
    redirect: function(){
        var user = Meteor.user();
        if (user)
          Router.go('/user/' + user._id);
    }
});
```

will redirect to, e.g., '/user/ae8WQQk6DrtDzA2AZ' after succesful login :-)


All the above fields are optional and fall back to default values in case you don't provide them. Default values are as follows:

| Route           | Code          | Name            | Path             | Template       | Redirect after Timeout |
| --------------- | ------------- | --------------- | ---------------  | -------------- |:----------------------:|
| change password | changePwd     | atChangePwd     | /change-password | fullPageAtForm |                        |
| enroll account  | enrollAccount | atEnrolAccount  | /enroll-account  | fullPageAtForm |            X           |
| forgot password | forgotPwd     | atForgotPwd     | /forgot-password | fullPageAtForm |            X           |
| reset password  | resetPwd      | atResetPwd      | /reset-password  | fullPageAtForm |            X           |
| sign in         | signIn        | atSignIn        | /sign-in         | fullPageAtForm |                        |
| sign up         | signUp        | atSignUp        | /sign-up         | fullPageAtForm |                        |
| verify email    | verifyEmail   | atVerifyEmail   | /verify-email    | fullPageAtForm |            X           |

If `layoutTemplate` is not specified, it falls back to what is currently set up with Iron-Router.
If `redirect` is not specified, it default to the previous route (obviously routes set up with `AccountsTemplates.configureRoute` are excluded to provide a better user experience). What more, when the login form is shown to protect private content (see [Content Protection](#content-protection), the user is redirect to the protected page after successful sign in or sign up, regardless of whether a `redirect` parameter was passed for `signIn` or `signUp` route configuration or not.


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
    except: ['home', 'atSignIn', 'atSignUp', 'atForgotPassword']
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


<a name="form-title"/>
### Form Title

In case you wish to change form titles, you can call:

```javascript
AccountsTemplates.configure({
    title: {
      changePwd: "Password Title",
      enrollAccount: "Enrol Title",
      forgotPwd: "Forgot Pwd Title",
      resetPwd: "Reset Pwd Title",
      signIn: "Sign In Title",
      signUp: "Sign Up Title",
    }
});
```

the above example asks to change the title for all possible form states, but you can specify only a subset of them leaving default values unchanged.

<a name="button-text"/>
### Button Text

In case you wish to change the text appearing inside the submission button, you can call:

```javascript
AccountsTemplates.configure({
    buttonText: {
      changePwd: "Password Text",
      enrollAccount: "Enroll Text",
      forgotPwd: "Forgot Pwd Text",
      resetPwd: "Reset Pwd Text",
      signIn: "Sign In Text",
      signUp: "Sign Up Text",
    }
});
```

the above example asks to change the button text for all possible form states, but you can specify only a subset of them leaving default values unchanged.


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
One of the most interesting part is that custom additional sign up fields can be also added to the sign up form!

Each field object is represented by the following properties:

| Property    | Type          | Required | Description                                                                                                                                                                                                                            |
| ----------- | ------------- |:--------:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _id         | String        |    X     | A unique field's id / name (internal use only) to be also used as attribute name into `Meteor.user().profile` in case it identifies an additional sign up field. Usually all lower-case letters.                                       |
| type        | String        |    X     | Specifies the input element type: at the moment supported inputs are: `password`, `email`, `text`, `tel`, `url`. Other input types like check box, and select are likely to be supported in some future release.                       |
| required    | Boolean       |          | When set to true the corresponding field cannot be left blank                                                                                                                                                                          |
| displayName | String or obj |          | The field name to be shown as text label above the input element. In case nothing is specified, the capitalized `_id` is used. The text label is shown only if `displayFormLabels` options is set to true.                             |
| placeholder | String or obj |          | Specifies the place-holder text to be shown inside the input element. In case nothing is specified, the capitalized `_id` will be used. The place-holder is shown only if `showPlaceholders` option is set to true.                    |
| minLength   | Integer       |          | If specified requires the content of the field to be at least `minLength` characters.                                                                                                                                                  |
| maxLength   | Integer       |          | If specified require the content of the field to be at most `maxLength` characters.                                                                                                                                                    |
| re          | RegExp        |          | Possibly specifies the regular expression to be used for field's content validation. Validation is performed both client-side (at every input change iff `continuousValidation` option is set to true) and server-side on form submit. |
| func        | Function      |          | Custom function to be used for validation.                                                                                                                                                                                             |
| errStr      | String        |          | Error message to be displayed in case re or func validation fail.                                                                                                                                                                      |
| trim        | Boolean       |          | Specifies whether to trim the input value or not.                                                                                                                                                                                      |
| lowercase   | Boolean       |          | Specifies whether to convert the input value to lowercase or not.                                                                                                                                                                      |
| uppercase   | Boolean       |          | Specifies whether to convert the input value to uppercase or not.                                                                                                                                                                      |

`displayName`, `placeholder`, and `errStr` can also be an [accounts-t9n](https://atmospherejs.com/package/accounts-t9n) registered key, in which case it will be translated based on the currently selected language.
In case you'd like to specify a key which is not already provided by accounts-t9n you can always map your own keys. To learn how to register new labels, please refer to the official [documentation](https://github.com/softwarerero/meteor-accounts-t9n#define-translations).

Furthermore, you can pass an object for `displayName`, `placeholder` to specify different texts for different form states. The matched pattern is:

```javascript
{
    default: Match.Optional(String),
    changePwd: Match.Optional(String),
    enrollAccount: Match.Optional(String),
    forgotPwd: Match.Optional(String),
    resetPwd: Match.Optional(String),
    signIn: Match.Optional(String),
    signUp: Match.Optional(String),
}
```

which permits to specify a different text for each different state, or a default value to be used for states which are not explicitely provided. For example:

```javascript
AccountsTemplates.addField({
    _id: 'password',
    type: 'password',
    placeholder: {
        signUp: "At least six characters"
    },
    required: true,
    minLength: 6,
    re: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
    errStr: 'At least 1 digit, 1 lowercase and 1 uppercase',
});
```

asks AccountsTemplates to display "At least six characters" as the placeholder for the password field when the sign up form is display, and to display "Password" (the capitalized *_id*_) in any other case.

**Custom validation** can be achieved by providing a regular expression or a function. In case you go for the function solution, this:

```
AccountsTemplates.addField({
    _id: 'name',
    type: 'text',
    displayName: "Name",
    func: function(value){return value === 'Full Name';},
    errStr: 'Only "Full Name" allowed!',
});
```

will require the name input to be exactly "Full Name" (though this might not be that interesting...).
If instead you do something along the following line:

```javascript
AccountsTemplates.addField({
    _id: 'phone',
    type: 'tel',
    displayName: "Phone",
    required: true,
    func: function (number) {
        if (Meteor.isServer){
            return isValidPhone(number);
        }
        return true;
    },
    errStr: 'Invalid Phone number!',
});
```

supposing `isValidPhone` is available only server-side, you will be validating the field only server-side, on form submission.
If, differently you do it this way:

```javascript
if (Meteor.isServer){
    Meteor.methods({
        validatePhone: function (number) {
            return isValidPhone(number);
        },
    });
}

AccountsTemplates.addField({
    _id: 'phone',
    type: 'tel',
    displayName: "Phone",
    required: true,
    func: function(val){
        Meteor.call('validatePhone', val, function (error, valid) {
            if (error) {
                console.log(error.reason);
            } else {
                if (valid)
                    AccountsTemplates.setFieldError('phone', false);
                else
                    AccountsTemplates.setFieldError('phone', 'Invalid Phone number!');
            }
        });
        return true;
    },
    errStr: 'Invalid Phone number!',
});
```

you can achieve also client-side validation, even if there will be a bit of delay before getting the error displayed...

*Note:* AccountsTemplates.setFieldError(fieldName, value) is the method used internally to deal with inputs' validation states. A `null` value means non-validated, `false` means correctly validated, no error, and any other value evaluated as true (usually strings specifying the reason for the validatino error), are finally interpreted as error and displayed where more appropriate.

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
In case a special field is not explicitly added, it will be automatically inserted at initialization time (with appropriate default properties).

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
    errStr: 'At least 1 digit, 1 lower-case and 1 upper-case',
});
```

#### Login with Username or Email

In order to let the user register with both a `username` and an `email` address and let him the possibility to log in using one of them, both the `username` and `email` fields must be added.
This is an example about how to configure such a behaviour:

```javascript
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  },
  {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "email",
      re: /.+@(.+){2,}\.(.+){2,}/,
      errStr: 'Invalid email',
  }
]);
```

This will trigger the automatic insertion of the special field `username_and_email` to be used for the sign in form.
If you wish to further customize the `username_and_email` field you can add it together with the other two:

```javascript
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  },
  {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "email",
      re: /.+@(.+){2,}\.(.+){2,}/,
      errStr: 'Invalid email',
  },
  {
      _id: 'username_and_email',
      type: 'text',
      required: true,
      displayName: "Login",
  }
]);
```


<a name="css-rules">
## CSS Rules

The main atForm is build up of several pieces, appearing and disappearing based on configuration options as well as the current internal status.
Each of these blocks is wrapped inside a `div` with class `at-<something>`: this should made your life easier if you're trying to write your own CSS rules to change templates' appearance.

Social login buttons (`button.at-social-btn`) have an `id` in the form `at-<servicename>` and name `<servicename>`.

Input fields for the password service form are wrapped inside a div with class `at-input`. The same div gets classes `has-error`, `has-success`, and `has-feedback` in case of negative validation result, positive validation and validation with feedback respectively.
The input element itself has id and name in the form `at-field-<field_id>`.
**Note:** `has-error`, `has-success`, and `has-feedback` names might change from framework to framework. These are valid for the *unstyled* and *bootstrap* versions...


Below is a html snapshot of an over-complete `atForm` taken from the unstyled version in which you can find all elements possibly shown under different configurations and circumstances.

```html
<div class="at-form">
  <!-- Title -->
  <div class="at-title">
    <h3>Create an Account</h3>
  </div>
  <!-- Social Buttons for Oauth Sign In / Sign Up-->
  <div class="at-oauth">
    <button class="at-social-btn" id="at-facebook" name="facebook">
      <i class="fa fa-facebook"></i> Sign in with Facebook
    </button>
    <button class="at-social-btn" id="at-twitter" name="twitter">
      <i class="fa fa-twitter"></i> Sign in with Twitter
    </button>
  </div>
  <!-- Services Separator -->
  <div class="at-sep">
    <strong>OR</strong>
  </div>
  <!-- Global Error -->
  <div class="at-error">
      <p>Login forbidden</p>
  </div>
  <!-- Global Resutl -->
  <div class="at-result">
      <p>Email Sent!</p>
  </div>
  <!-- Password Service -->
  <div class="at-pwd-form">
    <form role="form" id="at-pwd-form" novalidate="">
      <!-- Input -->
      <div class="at-input">
        <label for="at-field-username">
          Username
        </label>
        <input type="text" id="at-field-username" name="at-field-username" placeholder="Username" autocapitalize="none" autocorrect="off">
      </div>
      <!-- Input with Validation Error -->
      <div class="at-input has-error">
        <label for="at-field-email">
          Email
        </label>
        <input type="email" id="at-field-email" name="at-field-email" placeholder="Email" autocapitalize="none" autocorrect="off">
        <span>Invalid email</span>
      </div>
      <!-- Input with Successful Validation -->
      <div class="at-input has-success">
        <label for="at-field-password">
          Password
        </label>
        <input type="password" id="at-field-password" name="at-field-password" placeholder="Password" autocapitalize="none" autocorrect="off">
      </div>
      <!-- Forgot Password Link -->
      <div class="at-pwd-link">
        <p>
          <a href="/forgot-password" id="at-forgotPwd" class="at-link at-pwd">Forgot your password?</a>
        </p>
      </div>
      <!-- Form Submit Button -->
      <button type="submit" class="at-btn submit disabled" id="at-btn">
        Register
      </button>
    </form>
  </div>
  <!-- Link to Sign In -->
  <div class="at-signin-link">
    <p>
      If you already have an account
      <a href="/sign-in" id="at-signIn" class="at-link at-signin">sign in</a>
    </p>
  </div>
  <!-- Link to Sign Up -->
  <div class="at-signup-link">
    <p>
      Don't have an account?
      <a href="/sign-up" id="at-signUp" class="at-link at-signup">Register</a>
    </p>
  </div>
  <!-- Link to Privacy Policy and Terms of use -->
  <div class="at-terms-link">
    <p>
      By clicking Register, you agree to our
        <a href="/privacyPolicy">Privacy Policy</a>
        and
        <a href="/termsOfUse">Terms of Use</a>
    </p>
  </div>
</div>
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

3rd party login buttons are not shown. To allow display buttons with, e.g., 'Configure Foobook', simply add the packages `service-configuration` and `accounts-ui` with:

```Shell
meteor add service-configuration
meteor add accounts-ui
```

**Warning**: At the moment the UI for service configuration is not supported and the one provided by `accounts-ui` will be shown!


## Contributing

Anyone is welcome to contribute. Fork, make your changes, and then submit a pull request.

Thanks to [all those who have contributed code changes](https://github.com/splendido/accounts-templates-core/graphs/contributors) and all who have helped by submitting bug reports and feature ideas.

[![Support via Gittip](https://rawgithub.com/twolfson/gittip-badge/0.2.0/dist/gittip.png)](https://www.gittip.com/splendido/)
