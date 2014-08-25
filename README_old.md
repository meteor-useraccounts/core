### Warning

**This version of the documentation is not up to date with the current release!**



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






<a name="forgotpassword"/>
### Forgot Password

As soon as you configure the email service you'll see the usual 'Forgot Email?' link.
To do so you need to set the environment variable MAIL_URL and add the package `email`. See the official Meteor [documentation](http://docs.meteor.com/#email) for more details.

### Option details


#### Appearence option details

* `showPlaceholders` - (Boolean, default true) Specifies whether to display placeholder text inside input elements.
* `displayFormLabels` - (Boolean, default true) Specifies whether to display text labels above input elements.
* `formValidationFeedback` - (Boolean, default true) Specifies whether to display validation feed-back inside input elements: see [here](http://getbootstrap.com/css/#forms-control-validation) inside the subsection *With optional icons*.
* `continuousValidation` - (Boolean, default true) Specifies whether to continuously validate field values while the user is typing. *Continuous validation is performed client-side only to save round trips with the server*.
* `showAddRemoveServices` - (Boolean, default false) Tells whether to show soccial account buttons also when the user is signed in. In case it is set to true, the text of buttons will change from 'Sign in With XXX' to 'Add XXX' or 'Remove XXX' when the user signs in. 'Add' will be used if that particular service is still not assiciated with the current account, while 'Remove' is used only in case a particular service is already used by the user **and** there are at least two services available for sign in operations. Clicks on 'Add XXX' trigger the call to `Meteor.loginWithXXX`, as usual, while click on 'Remove XXX' will call the method `ATRemoveService` provided by accounts-templates. This means you need to have some additional logic to deal with the call `Meteor.loginWithXXX` in order to actually add the service to the user account. One solution to this is to use the package [accounts-meld](https://atmospherejs.com/package/accounts-meld) which was build exactly for this puspore.

