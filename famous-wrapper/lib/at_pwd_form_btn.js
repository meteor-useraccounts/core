// Register a 'rendered' callback on the submit button
// to attach _uihooks to the atPwdForm
// this way, every time the atPwdForm content changed
// the container fview is asked to recompute its height

Template.atPwdFormBtn.rendered = function(){
    var fview = FView.from(this);
    this.firstNode.parentNode._uihooks = {
        // everytime something is inserted...
        insertElement: function (node, next) {
            // ...asks to recompute the height
            fview.autoHeight();
            // then simply insert the element as required
            $(node).insertBefore(next);
        },
        // everytime something is removed...
        removeElement: function(node) {
            // ...asks to recompute the height
            fview.autoHeight();
            // then simply remove the element as required
            $(node).remove();
        }
    };
};