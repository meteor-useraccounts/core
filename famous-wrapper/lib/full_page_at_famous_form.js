// Uses this template in place of the original atForm
Template.fullPageAtFamousForm.replaces("fullPageAtForm");

Template.fullPageAtFamousForm.helpers({
    colSize: function() {
        var winW = windowSize().width;
        var width;
        if (winW > 400)
            width = 400 + (winW - 400) / 10;
        return [ width, undefined ];
    },
});