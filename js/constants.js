import { isAndroid, isChrome, getKeys, styleSupport, propertySupport, filterSupport, addPresets } from './util/util.js';

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

export const IS_TOUCH = 'ontouchstart' in window;
export const ANDROID2 = isAndroid(2.9);
export const CHROME = isChrome();
	
export const CUBIC_BEZIER = {
		'linear':			'linear',
		'':					'ease',
		'swing':			'ease',
		'ease':           	'ease',
       	'ease-in':        	'ease-in',
       	'ease-out':       	'ease-out',
       	'ease-in-out':    	'ease-in-out',
		'easeInQuad':		'cubic-bezier(.55,.085,.68,.53)',
		'easeOutQuad':		'cubic-bezier(.25,.46,.45,.94)',
		'easeInOutQuad':	'cubic-bezier(.455,.03,.515,.955)',
		'easeInCubic':		'cubic-bezier(.55,.055,.675,.19)',
		'easeOutCubic':		'cubic-bezier(.215,.61,.355,1)',
		'easeInOutCubic':	'cubic-bezier(.645,.045,.355,1)',
		'easeInQuart':		'cubic-bezier(.895,.03,.685,.22)',
		'easeOutQuart':		'cubic-bezier(.165,.84,.44,1)',
		'easeInOutQuart':	'cubic-bezier(.77,0,.175,1)',
		'easeInQuint':		'cubic-bezier(.755,.05,.855,.06)',
		'easeOutQuint':		'cubic-bezier(.23,1,.32,1)',
		'easeInOutQuint':	'cubic-bezier(.86,0,.07,1)',
		'easeInSine':		'cubic-bezier(.47,0,.745,.715)',
		'easeOutSine':		'cubic-bezier(.39,.575,.565,1)',
		'easeInOutSine':	'cubic-bezier(.445,.05,.55,.95)',
		'easeInExpo':		'cubic-bezier(.95,.05,.795,.035)',
		'easeOutExpo':		'cubic-bezier(.19,1,.22,1)',
		'easeInOutExpo':	'cubic-bezier(1,0,0,1)',
		'easeInCirc':		'cubic-bezier(.6,.04,.98,.335)',
		'easeOutCirc':		'cubic-bezier(.075,.82,.165,1)',
		'easeInOutCirc':	'cubic-bezier(.785,.135,.15,.86)',
		'easeInBack':		'cubic-bezier(.60,-.28,.735,.045)',
		'easeOutBack':		'cubic-bezier(.175,.885,.32,1.275)',
		'easeInOutBack':	'cubic-bezier(.68,-.55,.265,1.55)'
	};
		
    export let SIDES;
	export const OPPOSITE_SIDE = {top:'bottom', left:'right'};
	export const OPPOSITE_LAYER = {
			zoomIn:'zoomOut',
			flipDown:'flipUp',
			flipRight:'flipLeft',
			moveDown:'moveUp',
			moveRight:'moveLeft',
			spinInRight:'spinOutLeft',
			spinInLeft:'spinOutRight'
		};

	(function() {
		$.each(OPPOSITE_LAYER, function(key, val) {
			OPPOSITE_LAYER[val] = key;
		});

		$.each(OPPOSITE_SIDE, function(key, val) {
			OPPOSITE_SIDE[val] = key;
		});

		SIDES = getKeys(OPPOSITE_SIDE);
	}());

