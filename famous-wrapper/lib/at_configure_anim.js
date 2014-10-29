// --------------------------------------------------
// Adds configureAnimations to AccountsTemplates
// --------------------------------------------------

ANIMATION_SUB_PAT = {
    default: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atTitle: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atSigninLink: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atSocial: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atSep: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atError: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atResult: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atPwdForm: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atSignupLink: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
    atTermsLink: Match.Optional(Match.OneOf(null, Match.Where(_.isFunction))),
};

ANIMATION_PAT = {
    render: Match.Optional(ANIMATION_SUB_PAT),
    destroy: Match.Optional(ANIMATION_SUB_PAT),
    state_change: Match.Optional(ANIMATION_SUB_PAT),
    animQueueDelay: Match.Optional(Number),
    animQueueStartDelay: Match.Optional(Number),
    setStateDelay: Match.Optional(Number),
};


AccountsTemplates.configureAnimations = function(options){
    if (Meteor.isClient){
        check(options, ANIMATION_PAT);
        if (options.render)
            this.animations.render = _.defaults(options.render, this.animations.render);
        if (options.destroy)
            this.animations.destroy = _.defaults(options.destroy, this.animations.destroy);
        if (options.state_change)
            this.animations.state_change = _.defaults(options.state_change, this.animations.state_change);
        options = _.omit(options, "render", "destroy", "state_change");
        this.animations = _.defaults(options, this.animations);
    }
};