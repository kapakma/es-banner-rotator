import { styleSupport, propertySupport, filterSupport, addPresets } from './util/util.js';

export const SUPPORT = {};
export let PREFIX;
export let PREFIXES;
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

export const PRESETS = {};

(function() {
    var empty = [''],
        xDirs = ['left', 'right'],
        yDirs = ['up', 'down'],
        order = ['downLeft', 'upRight', 'downRight', 'upLeft', 'spiralIn', 'spiralOut', 'zigZagDown', 'zigZagUp', 'zigZagRight', 'zigZagLeft'];
    
    $.each(['none', 'column', 'row', 'grid'], function(i, val) {
        PRESETS[val] = [];
    });

    addPresets(PRESETS.none, ['cover', 'flip', 'push', 'rotate'], xDirs.concat(yDirs), empty);
    addPresets(PRESETS.none, ['fade', 'zoom'], empty, empty);
    
    addPresets(PRESETS.column, ['fade', 'zoom'], empty, xDirs);
    addPresets(PRESETS.column, ['push', 'rotate'], yDirs, xDirs);
    $.each(xDirs, function(i, val) {
        addPresets(PRESETS.column, ['cover', 'flip', 'move'], [val], [val]);
    });
    
    addPresets(PRESETS.row, ['fade', 'zoom'], empty, yDirs);
    addPresets(PRESETS.row, ['push', 'rotate'], xDirs, yDirs);
    $.each(yDirs, function(i, val) {
        addPresets(PRESETS.row, ['cover', 'flip', 'move'], [val], [val]);
    });

    addPresets(PRESETS.grid, ['expand', 'fade', 'zoom'], empty, order);
    addPresets(PRESETS.grid, ['cover', 'flip', 'move', 'push'], ['random'], order);
}());