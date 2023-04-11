import { SUPPORT, PREFIXES } from '../constants.js';

// shuffle elements
export function shuffleElements ($el) {
  const items = $el.children().toArray();
  shuffleArray(items);
  $el.append(items);
}

// get position
export function getPosition (val) {
  const props = {};
  let arr = val.split(' ', 2);

  if (arr.length !== 2) {
    arr = camelToDash(val).split('-');
  }

  props.x = getEnum(arr[0], ['left', 'center', 'right'], 'left');
  props.y = getEnum(arr[1], ['top', 'center', 'bottom'], 'bottom');

  return props;
}

// get valid easing
export function getEasing (easing, css) {
  if (css) {
    if (!(easing in CUBIC_BEZIER)) {
      return 'ease';
    }
  } else if (!(easing in $.easing)) {
    return 'swing';
  }
  return easing;
}

// get random array element
export function getRandomItem (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// test number within range
export function withinRange (val, min, max) {
  return ($.isNumeric(val) && min <= val && val <= max);
}

// test for none
export function isNone (val) {
  return (typeof val === 'undefined' || val === false || val === 'none');
}

// check if empty string
export function isEmptyStr (val) {
  return (typeof val === 'undefined' || $.trim(val) === '');
}

// get integer
export function getInt (val, defaultVal) {
  val = parseInt(val, 10);
  return ($.isNumeric(val) ? val : defaultVal);
}

// get positive integer
export function getPosInt (val, defaultVal) {
  val = parseInt(val, 10);
  return ($.isNumeric(val) && val > 0 ? val : defaultVal);
}

// get non-negative integer
export function getNonNegInt (val, defaultVal) {
  val = parseInt(val, 10);
  return ($.isNumeric(val) && val >= 0 ? val : defaultVal);
}

// get float
export function getFloat (val, defaultVal) {
  val = parseFloat(val);
  return ($.isNumeric(val) ? val : defaultVal);
}

// get value
export function getValue (val, defaultVal) {
  return (typeof val !== 'undefined' ? val : defaultVal);
}

// get enum value
export function getEnum (val, list, defaultVal) {
  return ($.inArray(val, list) > -1 ? val : defaultVal);
}

// check for percent
export function isPercent (val) {
  val += '';
  const last = val.length - 1;
  return val.charAt(last) === '%' && $.isNumeric(val.substring(0, last));
}

// round to
export function roundTo (val, digits) {
  const num = Math.pow(10, digits);
  return Math.round(val * num) / num;
}

// check for image file
export function isImage (val) {
  return /[^\s]+\.(bmp|gif|jpg|jpeg|png|tiff)$/i.test(val);
}

// check style property support
export function styleSupport (prop) {
  let el = document.createElement('div');
  const style = el.style;
  let supported = false;

  if (prop in style) {
    supported = prop;
  } else {
    const capProp = capitalize(prop);
    const prefixes = ['Moz', 'Webkit', 'O', 'ms'];

    for (let i = 0; i < prefixes.length; i++) {
      const prefixProp = prefixes[i] + capProp;
      if (prefixProp in style) {
        supported = prefixProp;
        break;
      }
    }
  }

  el = null;
  SUPPORT[prop] = supported;
  return supported;
}

// is android check
export function isAndroid (version) {
  const android = 'android';
  const ua = navigator.userAgent.toLowerCase();
  const index = ua.indexOf(android);

  return (index > -1 && (typeof version === 'undefined' || parseFloat(ua.substring(index + android.length)) <= version));
}

// is chrome check
export function isChrome () {
  return /Chrome|CriOS/.test(navigator.userAgent);
}

// convert camel case to dash
export function camelToDash (str) {
  return (str + '').replace(/([A-Za-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// convert dash to camel case
export function dashToCamel (str) {
  return (str + '').replace(/([A-Za-z])(-)([A-Za-z])/g, function (match, p1, p2, p3) {
    return (p1 + p3.toUpperCase());
  });
}

// check css property support
export function propertySupport (prop, val) {
  if (prop === false) {
    return false;
  }

  const dashProp = camelToDash(prop).replace(/^(moz-|webkit-|o-|ms-)/, '-$1');
  let el = document.createElement('div');

  el.style[dashProp] = val;
  const support = (el.style[dashProp] + '').indexOf(val) > -1;
  el = null;

  return support;
}

// check css filter support
export function filterSupport () {
  const el = document.createElement('div');
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  const cssText = prefixes.join('filter:blur(2px); ');

  el.style.cssText = cssText;
  return !!el.style.length && (document.documentMode === undefined || document.documentMode > 9);
}

// shuffle array
export function shuffleArray (arr) {
  let i = arr.length;
  while (--i > 0) {
    const ri = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[ri];
    arr[ri] = temp;
  }
}

// capitalize string
export function capitalize (str) {
  str += '';
  return str.charAt(0).toUpperCase() + str.substring(1);
}

// convert degrees to radians
export function degreesToRadians (degrees) {
  return (degrees * Math.PI / 180);
}

// get transform property
export function getTransformProperty (transform) {
  return PREFIXES.concat(['', '']).join('transform:' + transform + ';');
}

// debounce
export function debounce (fn, wait, immediate) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) {
        fn.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      fn.apply(context, args);
    }
  };
}

// get object keys
export function getKeys (obj) {
  return $.map(obj, function (val, key) {
    return key;
  });
}

// add effect presets
export function addPresets (presets, effects, directions, orders) {
  $.each(effects, function (i, effect) {
    $.each(directions, function (j, direction) {
      $.each(orders, function (k, order) {
        presets.push({ effect, direction, order });
      });
    });
  });
}

// create wrapper
export function createWrapper ($el) {
  const size = { width: $el.width(), height: $el.height() };
  const $wrapper = $('<div/>', {
    class: 'br-effect-wrapper',
    css: {
      position: $el.css('position'),
      float: $el.css('float'),
      width: $el.outerWidth(true),
      height: $el.outerHeight(true),
      'z-index': $el.css('z-index'),
      top: $el[0].style.top,
      left: $el[0].style.left,
      bottom: $el[0].style.bottom,
      right: $el[0].style.right
    }
  });

  $el.wrap($wrapper).css({
    display: 'block',
    position: 'relative',
    top: 0,
    bottom: 'auto',
    left: 0,
    right: 'auto'
  }).css(size);
}

// remove wrapper
export function removeWrapper ($el) {
  if ($el.parent().hasClass('br-effect-wrapper')) {
    $el.unwrap();
  }
}

// save element style
export function saveStyle ($el, props) {
  $.each(props, function (i, val) {
    $el.data('style-' + val, $el[0].style[val]);
  });
}

// restore element style
export function restoreStyle ($el, props) {
  $.each(props, function (i, val) {
    const style = $el.data('style-' + val);
    $el.css(val, (typeof style === 'undefined' ? '' : style));
  });
}
