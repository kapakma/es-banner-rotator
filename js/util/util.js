//shuffle elements
export function shuffleElements($el) {
  var items = $el.children().toArray();
  shuffleArray(items);
  $el.append(items);
}

//get position
export function getPosition(val) {
  var props = {},
     arr = val.split(' ', 2);
  
  if (2 !== arr.length) {
     arr = camelToDash(val).split('-');
  }

  props.x = getEnum(arr[0], ['left', 'center', 'right'], 'left');
  props.y = getEnum(arr[1], ['top', 'center', 'bottom'], 'bottom');

  return props;
}

//get valid easing
export function getEasing(easing, css) {
  if (css) {
     if (!(easing in CUBIC_BEZIER)) {
         return 'ease';
     }
  }
  else if (!(easing in $.easing)) {
     return 'swing';
  }
  return easing;
}

//get random array element
export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//test number within range
export function withinRange(val, min, max) {
  return ($.isNumeric(val) && min <= val && val <= max);
}

//test for none
export function isNone(val) {
  return (typeof val === 'undefined' || false === val || 'none' === val);
}

//check if empty string
export function isEmptyStr(val) {
  return (typeof val === 'undefined' || '' === $.trim(val));
}

//get integer
export function getInt(val, defaultVal) {
  val = parseInt(val, 10);
  return ($.isNumeric(val) ? val : defaultVal);
}

//get positive integer
export function getPosInt(val, defaultVal) {
  val = parseInt(val, 10);
  return ($.isNumeric(val) && 0 < val ? val : defaultVal);
}

//get non-negative integer
export function getNonNegInt(val, defaultVal) {
  val = parseInt(val, 10);
  return ($.isNumeric(val) && 0 <= val ? val : defaultVal);
}

//get float
export function getFloat(val, defaultVal) {
  val = parseFloat(val);
  return ($.isNumeric(val) ? val : defaultVal);
}

//get value
export function getValue(val, defaultVal) {
  return (typeof val !== 'undefined' ? val : defaultVal);
}

//get enum value
export function getEnum(val, list, defaultVal) {
  return (-1 < $.inArray(val, list) ? val : defaultVal);
}

//check for percent
export function isPercent(val) {
  val += '';
  var last = val.length - 1;
  return '%' === val.charAt(last) && $.isNumeric(val.substring(0, last));
}

//round to
export function roundTo(val, digits) {
  var num = Math.pow(10, digits);
  return Math.round(val * num)/num;
}

//check for image file
export function isImage(val) {
  return /[^\s]+\.(bmp|gif|jpg|jpeg|png|tiff)$/i.test(val);
}

//check style property support
export function styleSupport(prop) {
  var el = document.createElement('div'),
     style = el.style,
     supported = false;

  if (prop in style) {
     supported = prop;
  }
  else {
     var capProp = capitalize(prop),
         prefixes = ['Moz', 'Webkit', 'O', 'ms'];
     
     for (var i = 0; i < prefixes.length; i++) {
         var prefixProp = prefixes[i] + capProp;
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

//is android check
export function isAndroid(version) {
  var android = 'android',
     ua = navigator.userAgent.toLowerCase(),
     index = ua.indexOf(android);
  
  return (-1 < index && (typeof version === 'undefined' || parseFloat(ua.substring(index + android.length)) <= version));
}

//is chrome check
export function isChrome() {
  return /Chrome|CriOS/.test(navigator.userAgent);
}

//convert camel case to dash
export function camelToDash(str) {
  return (str + '').replace(/([A-Za-z])([A-Z])/g, '$1-$2').toLowerCase();
}

//convert dash to camel case
export function dashToCamel(str) {
  return (str + '').replace(/([A-Za-z])(-)([A-Za-z])/g, function(match, p1, p2, p3) {
     return (p1 + p3.toUpperCase());
  });
}

//check css property support
export function propertySupport(prop, val) {
  if (false === prop) {
     return false;
  }

  var dashProp = camelToDash(prop).replace(/^(moz-|webkit-|o-|ms-)/, '-$1'),
     el = document.createElement('div'),
     support;
  
     el.style[dashProp] = val;
  support = -1 < (el.style[dashProp] + '').indexOf(val);
  el = null;
     
     return support;
}

//check css filter support
export function filterSupport() {
  var el = document.createElement('div'),
     prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
     cssText = prefixes.join('filter:blur(2px); ');

  el.style.cssText = cssText;
  return !!el.style.length && (document.documentMode === undefined || document.documentMode > 9);
}

//shuffle array
export function shuffleArray(arr) {
  var i = arr.length;
  while(0 < --i) {
     var ri = Math.floor(Math.random() * (i + 1)),
         temp = arr[i];
     arr[i] = arr[ri];
     arr[ri] = temp;
  }
}

//capitalize string
export function capitalize(str) {
  str += '';
  return str.charAt(0).toUpperCase() + str.substring(1);
}

//convert degrees to radians
export function degreesToRadians(degrees) {
  return (degrees * Math.PI/180);
}

//get transform property
export function getTransformProperty(transform) {
  return PREFIXES.concat(['', '']).join('transform:' + transform + ';');
}

//debounce
export function debounce(fn, wait, immediate) {
  var timeout;
  return function() {
     var context = this, 
         args = arguments;
     var later = function() {
         timeout = null;
         if (!immediate) {
             fn.apply(context, args);
         }
     };
     var callNow = immediate && !timeout;
     clearTimeout(timeout);
     timeout = setTimeout(later, wait);
     if (callNow) {
         fn.apply(context, args);
     }
  };
}

//get object keys
export function getKeys(obj) {
  return $.map(obj, function(val, key) {
     return key;
  });
}

//add effect presets
export function addPresets(presets, effects, directions, orders) {
  $.each(effects, function(i, effect) {
     $.each(directions, function(j, direction) {
         $.each(orders, function(k, order) {
             presets.push({effect:effect, direction:direction, order:order});
         });
     });
  });
}

//create wrapper
export function createWrapper($el) {
  var size = {width:$el.width(), height:$el.height()},
  $wrapper = $('<div/>', {
     'class':'br-effect-wrapper',
     css:{
         position:$el.css('position'),
         'float':$el.css('float'),
         width:$el.outerWidth(true),
         height:$el.outerHeight(true),
         'z-index':$el.css('z-index'),
         top:$el[0].style.top,
         left:$el[0].style.left,
         bottom:$el[0].style.bottom,
         right:$el[0].style.right
     }
  });
  
  $el.wrap($wrapper).css({
     display:'block',
     position:'relative',
     top:0,
     bottom:'auto',
     left:0,
     right:'auto'
  }).css(size);
}
  
//remove wrapper
export function removeWrapper($el) {
  if ($el.parent().hasClass('br-effect-wrapper')) {
     $el.unwrap();
  }
}
  
//save element style
export function saveStyle($el, props) {
  $.each(props, function(i, val) {
     $el.data('style-' + val, $el[0].style[val]);
  });
}
  
//restore element style
export function restoreStyle($el, props) {
  $.each(props, function(i, val) {
     var style = $el.data('style-' + val);
     $el.css(val, (typeof style === 'undefined' ? '' : style));
  });
}