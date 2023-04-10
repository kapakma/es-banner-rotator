import { styleSupport, propertySupport, filterSupport } from './util/util.js';

export const SUPPORT = {};
let PREFIX;
let PREFIXES;
let CSS_TRANSITION_END;
let CSS_ANIMATION_END;

(function() {
    $.each(['transform', 'transition', 'transformStyle', 'animation', 'backgroundSize', 'pointerEvents'], function(i, val) {
        styleSupport(val);
    });
    
    SUPPORT.transform3d = propertySupport(SUPPORT.transform, 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
    SUPPORT.preserve3d = propertySupport(SUPPORT.transformStyle, 'preserve-3d');
    SUPPORT.cssFilter = filterSupport();

    switch(SUPPORT.transition) {
        case 'WebkitTransition':
            CSS_TRANSITION_END = 'webkitTransitionEnd';
            break;
        case 'OTransition':
            CSS_TRANSITION_END = 'otransitionend';
            break;
        default:
            CSS_TRANSITION_END = 'transitionend';
    }

    switch(SUPPORT.animation) {
        case 'WebkitAnimation':
            CSS_ANIMATION_END = 'webkitAnimationEnd';
            break;
        case 'OAnimation':
            CSS_ANIMATION_END = 'oanimationend';
            break;
        default:
            CSS_ANIMATION_END = 'animationend';
    }

    if (SUPPORT.animation && /^(Moz|Webkit|O)/.test(SUPPORT.animation)) {
        PREFIX = '-' + SUPPORT.animation.replace('Animation', '').toLowerCase() + '-';
        PREFIXES = [PREFIX];
    }
    else {
        PREFIX = '';
        PREFIXES = ['-moz-', '-ms-', '-webkit-'];
    }
}());