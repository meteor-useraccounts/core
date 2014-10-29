// Simply 'inherites' helpers from AccountsTemplates
Template.atInput.helpers(AccountsTemplates.atInputHelpers);

// Simply 'inherites' events from AccountsTemplates
Template.atInput.events(AccountsTemplates.atInputEvents);

Template.atSelectInput.rendered = function(){
	$('.ui.dropdown').dropdown();
};

// Simply 'inherites' helpers from AccountsTemplates
Template.atTextInput.helpers(AccountsTemplates.atInputHelpers);

// Simply 'inherites' helpers from AccountsTemplates
Template.atCheckboxInput.helpers(AccountsTemplates.atInputHelpers);

// Simply 'inherites' helpers from AccountsTemplates
Template.atSelectInput.helpers(AccountsTemplates.atInputHelpers);

// Simply 'inherites' helpers from AccountsTemplates
Template.atRadioInput.helpers(AccountsTemplates.atInputHelpers);
