var Transform;
var Easing;
FView.ready(function(require) {
    Transform = famous.core.Transform;
    Easing = famous.transitions.Easing;
});


// ---------------------------------------
// Default animation function for entrance
// ---------------------------------------

fallFromTop = function(fview){
    fview.modifier.setTransform(Transform.translate(0, -$(window).height()));
    AccountsTemplates.pushToAnimationQueue(function() {
        fview.modifier.setTransform(
            Transform.translate(0,0),
            { duration : 450, curve: Easing.easeOutSine }
        );
    }, false);
};


// -------------------------------------------
// Default animation function for state change
// -------------------------------------------

vFlip = function(fview){
    fview.modifier.setTransform(
        Transform.rotate(Math.PI-0.05,0,0),
        { duration : AccountsTemplates.animations.setStateDelay, curve: "easeIn" },
        function() {
            fview.modifier.setTransform(
                Transform.rotate(-0.1,0,0),
                { duration : AccountsTemplates.animations.setStateDelay, curve: "easeOut" }
            );
        }
    );
};


// -------------------------------------------
// Default animation functions for destruction
// -------------------------------------------

slideRightDestroy = function(fview){
    fview.modifier.setTransform(
        Transform.translate($(window).width(),0),
        { duration : 250, curve: Easing.easeOutSine },
        function() { fview.destroy();}
    );
};

blastOutDestroy = function(fview){
    var angle = Math.random() * Math.PI;
    fview.modifier.setTransform(
        Transform.multiply(
            Transform.translate( Math.cos(angle) * 1.5 * $(window).height(), Math.sin(angle) * 1.5 * $(window).width()),
            Transform.aboutOrigin([200, 21, 0], Transform.rotate(0,0, Math.random() > 0.5 ? Math.PI : -Math.PI))
        ),
        { duration : 400, curve: Easing.easeOutCirc},
        function() { fview.destroy();}
    );
};