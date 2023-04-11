import { getKeys, roundTo, degreesToRadians, getPosInt, capitalize, getNonNegInt, getRandomItem, getTransformProperty } from '../util/util.js';
import { SUPPORT, PRESETS, PREFIX } from '../constants.js';

//Effect Class
function Effect(context) {
  if (this instanceof Effect) {
    if (context) {
      this._timeout = null;
      this._requestId = null;
      this._context = context;
      this._$container = $('<div/>', {'class':'br-effects'}).appendTo(this._context._$screen);
      this._transform = this._context._transform;
      this._support3d = SUPPORT.transform3d && SUPPORT.preserve3d && this._context._cssTransition;
    }
  }
  else {
    return new Effect(context);
  }
}

Effect.prototype = {
  constructor: Effect,

        //create elements
  createElements: function() {
    var total = this._rows * this._columns,
    inner = this._is3D ? Effect.CUBOID : Effect.PLANE,
    content = '';

    while (total--) {
      content += '<div class="br-effect">' + inner + '</div>';
    }
    this._$container.toggleClass('br-2d', !this._is3D).html(content);
    this._$el = this._$container.children();

    if (this._shapeColor) {
      this._$el.find('>.br-shape').children().css({backgroundColor:this._shapeColor});
    }
  },

        //set elements
  initElements: function() {
    var $curr = this.getCurrImage(),
    currTop = $curr.position().top,
    currLeft = $curr.position().left,
    $prev = this.getPrevImage(),
    prevTop, 
    prevLeft;

    if ($prev) {
      prevTop = $prev.position().top;
      prevLeft = $prev.position().left;
    }

    this.addImage();
    var availHeight = this._$container.height();
    for (var i = 0; i < this._rows; i++) {
      var availWidth = this._$container.width(),
      height = Math.min(this._height, availHeight);
      availHeight -= height;
      for (var j = 0; j < this._columns; j++) {
        var width = Math.min(this._width, availWidth),
        top = i * this._height,
        left = j * this._width,
        $el = this._$el.eq(i * this._columns + j),
        $shape = $($el[0].firstChild);

        $el.css({top:top, left:left, width:width, height:height});
        $shape.find('>.br-prev-side>img').css({left:(prevLeft - left), top:(prevTop - top)}).end()
        .find('>.br-active-side>img').css({left:(currLeft - left), top:(currTop - top)});

        if (this._is3D) {
          this.setCuboid($shape, width, height, $el.data('depth'));
        }

        availWidth -= width;
      }
    }

    this._$el.css({visibility:'visible'});

    if (this._hideItems) {
      this._context._$items.css({visibility:'hidden'});
    }
  },

        //clear elements
  clear: function() {
    clearTimeout(this._timeout);
    cancelAnimationFrame(this._requestId);
    this._$container.empty();
    this._progress = false;
  },

        //get type
  getType: function() {
    if (1 < this._rows) {
      if (1 < this._columns) {
        return Effect.GRID;
      }
      else {
        return Effect.ROW;
      }
    }
    else if (1 < this._columns) {
      return Effect.COLUMN;
    }

    return 'none';
  },

        //init order
  initOrder: function() {
    if (0 > $.inArray(this._order, Effect.ORDERS)) {
      this._order = 'right';
    }

    if (this._context._backward && this._autoReverse) {
      this._order = this.getOpposite(this._order);
    }
  },

        //init direction
  initDirection: function() {
    if (0 > $.inArray(this._direction, ['up', 'down', 'left', 'right', 'random'])) {
      this._direction = 'right';
    }

    if (this._context._backward && this._autoReverse) {
      this._direction = this.getOpposite(this._direction);
    }
  },

        //get opposite
  getOpposite: function(val) {
    if (val in Effect.OPPOSITE) {
      return Effect.OPPOSITE[val];
    }
    return val;
  },

        //get current image
  getCurrImage: function() {
    if (this._context._$currItem) {
      return this._context._$currItem.find('>img.br-img');
    }
  },

        //get previous image
  getPrevImage: function() {
    if (this._context._$prevItem) {
      return this._context._$prevItem.find('>img.br-img');
    }
  },

        //add element's image
  addImage: function() {
    $.each({'>.br-active-side': this.getCurrImage(), '>.br-prev-side': this.getPrevImage()}, 
      $.proxy(function(selector, $img) {
        if ($img && $img.length) {
          var rect = $img[0].getBoundingClientRect(),
          width = rect.width || $img.width(),
          height = rect.height || $img.height(),
          $newImg = $('<img/>', {src:$img.attr('src'), alt:'', css:{width:width, height:height}});
          this._$el.find('>.br-shape').find(selector).html($newImg);
        }
      }, this));
  },

        //set cuboid
  setCuboid: function($cuboid, width, height, depth) {
    var widthZ  = 'translateZ(' + (width/2)  + 'px)',
    heightZ = 'translateZ(' + (height/2) + 'px)',
    depthZ  = 'translateZ(' + (depth/2)  + 'px)',
    left = (width - depth)/2,
    top = (height - depth)/2,
    invert = $cuboid.find('>.br-face-back').hasClass('br-inverted') ? 'rotate(180deg) ' : '';

    $cuboid.find('>.br-face-front').css({transform:depthZ}).end()
    .find('>.br-face-back').css({transform:'rotateY(180deg) ' + invert + depthZ}).end()
    .find('>.br-face-left').css({width:depth, left:left, transform:'rotateY(-90deg) ' + widthZ}).end()
    .find('>.br-face-right').css({width:depth, left:left, transform:'rotateY(90deg) ' + widthZ}).end()
    .find('>.br-face-top').css({height:depth, top:top, transform:'rotateX(90deg) ' + heightZ}).end()
    .find('>.br-face-bottom').css({height:depth, top:top, transform:'rotateX(-90deg) ' + heightZ});
  },

        //update keyframes
  updateKeyframes: function() {
    var sheet = this._context._sheet,
    index = this._context._activeIndex,
    size, arr, pct,
    offset = 0;

    if ($.isNumeric(this._depth)) {
      size = this._depth;
      arr = [0, 1, 0];
      pct = ['0%', '50%', '100%'];
    }
    else {
      if ('flip' === this._effect) {
        size = ('up' === this._direction || 'down' === this._direction ? this._height : this._width)/2;
        arr = Effect.SINES;
        pct = Effect.FLIP_PCT;
      }
      else {
        size = this._$el.data('depth')/2;
        offset = size;
        size /= Math.cos(degreesToRadians(45));
        arr = Effect.COSINES;
        pct = Effect.ROTATE_PCT;
      }
    }

    var length = arr.length,
    rule = '@' + PREFIX + 'keyframes ' + ('br-' + this._context._uid + '-' + index) + ' { ';

    for (var i = 0; i < length; i++) {
      var val = (arr[i] * size);
      rule += (pct[i] + ' { ' + getTransformProperty('translateZ(' + Math.min(0, offset - val) + 'px)') + ' } ');
    }
    rule += '} ';

    try {
      sheet.deleteRule(index);
      sheet.insertRule(rule, index);
    }
    catch (err) {
    }
  },

        //animate elements
  animate: function(elArray, duration, easing) {
    if (this._is3D) {
      this.updateKeyframes();

      if (this._shapeShading) {
        var shadeDuration = ('flip' === this._effect ? duration/2 : duration);
        this._$el.find('>.br-shape>.br-prev-side').each(function() {
          $('<div/>', {'class':'br-shading'}).animation('br-shade-in', 
            {duration:shadeDuration, easing:easing, playState:'paused', complete:function(e) {
              e.stopPropagation();
            }}).appendTo($(this));
        });
      }
    }

    var props = {duration:duration, easing:easing};
    this._requestId = requestAnimationFrame($.proxy(function() {
      this.animateElement(elArray, props);
    }, this));
  },

        //animate active element
  animateElement: function(elArray, options) {
    var $el = $(elArray.shift()),
    selector = $el.data('selector'),
    $active = (selector ? $el.find(selector) : $el),
    promises = [],
    isLast = !elArray.length;

    if (this._is3D) {
      var opts = $.extend({}, options);
      if (isLast) {
        var d2 = $.Deferred();
        promises.push(d2.promise());
        opts.complete = function() { 
          d2.resolve(); 
        };
      }
      $el.animation('br-' + this._context._uid + '-' + this._context._activeIndex, opts)
      .find('>.br-shape>.br-prev-side>.br-shading').css({animationPlayState:'running'});
    }

    if (isLast) {
      var d1 = $.Deferred();
      promises.push(d1.promise());
      options.complete = function() { 
        d1.resolve(); 
      };

      $.when.apply(null, promises).always($.proxy(function() {
        this._context.activateItem(false);
        this._$container.empty();
        this._progress = false;
      }, this));
    }

    $active.transition($el.data('to'), options);

    if (!isLast) {
      this._timeout = setTimeout($.proxy(function() {
        this._requestId = requestAnimationFrame($.proxy(function() {
          this.animateElement(elArray, options);
        }, this));
      }, this), this._interval);
    }
  },

  getPromises: function() {
    var promises = [];
    this.getCurrImage().add(this.getPrevImage()).each(function(n, el) {
      var $el = $(el);
      if ($el && $el.length) {
        var $img = $el.clone(),
        img = $img[0];

        if (typeof img.readyState !== 'undefined') {
          if ('complete' === img.readyState) {
            return false;
          }
        }
        else if (img.complete) {
          return false;
        }

        var deferred = $.Deferred();
        promises.push(deferred.promise());
        $img.brHandleImage($img.attr('src'), { 
          complete: function() {
            deferred.resolve();
          },
          error: function() { 
            deferred.reject(); 
          }
        });
      }
    });

    return promises;
  },

  inProgress: function() {
    return this._progress;
  },

        //get ordered element array
  getElementArray: function() {
    var elements;
    switch (this._order) {
    case 'up':
    case 'down':
    case 'left':
    case 'right':
      elements = this.getDirectionalArray(this._order);
      break;
    case 'upLeft':
    case 'upRight':
    case 'downLeft':
    case 'downRight':
      elements = this.getDiagonalArray(this._order);
      break;
    case 'spiralIn':
    case 'spiralOut':
      elements = this.getSpiralArray();
      break;
    case 'zigZagUp':
    case 'zigZagDown':
    case 'zigZagLeft':
    case 'zigZagRight':
      elements = this.getZigZagArray(this._order);
      break;
    case 'random':
      elements  = this._$el.toArray();
      shuffleArray(elements);
      break;
    default:
      elements  = this._$el.toArray();
    }

    if (this._isReverse) {
      elements.reverse();
    }

    return elements;
  },

  setFn: function(fn, dir) {
    var setter = 'set' + capitalize(fn), 
    name = setter + capitalize(dir);

    if (!$.isFunction(this[name])) {
      name = setter + capitalize(this._direction);
    }
    return name;
  },

  setAlternate: function(fn) {
    this[this.setFn(fn, this._direction)](this._$el.filter(':even'));
    this[this.setFn(fn, this.getOpposite(this._direction))](this._$el.filter(':odd'));
  },

  setRandomDirection: function($el, fn, directions) {
    if (!directions) {
      directions = ['up', 'down', 'left', 'right'];
    }

    $el.each(function() {
      $(this).data({dir:getRandomItem(directions)}); 
    });

    $.each(directions, $.proxy(function(i, dir) {
      var $items = $el.filter(function() { 
        return $(this).data('dir') === dir;
      });
      this[this.setFn(fn, dir)]($items);
    }, this));
  },

        //cover helper
  setCoverDown: function($el) {
    this.setPush($el, 'hidden', 'Y', true);
  },
  
  setCoverUp: function($el) {
    this.setPush($el, 'hidden', 'Y', false);
  },

  setCoverRight: function($el) {
    this.setPush($el, 'hidden', 'X', true);
  },

  setCoverLeft: function($el) {
    this.setPush($el, 'hidden', 'X', false);
  },

  setCoverRandom: function($el) {
    this.setRandomDirection($el, 'cover');
  },

        //push helper
  setPushDown: function($el) {
    this.setPush($el, 'visible', 'Y', true);
  },
  
  setPushUp: function($el) {
    this.setPush($el, 'visible', 'Y', false);
  },

  setPushRight: function($el) {
    this.setPush($el, 'visible', 'X', true);
  },

  setPushLeft: function($el) {
    this.setPush($el, 'visible', 'X', false);
  },

  setPushRandom: function($el) {
    this.setRandomDirection($el, 'push');
  },

  setPush: function($el, visibility, axis, fwd) {
    var active  = 'front', 
    prev = 'back',
    dim = ('Y' === axis ? 'height' : 'width'),
    from, to;

    if (this._transform) {
      var translate = 'translate' + axis;
      from = {transform:translate + '(-50%)'};
      to = {transform:translate + '(0)'};
    }
    else {
      var pos = ('Y' === axis ? 'top' : 'left');
      from = {};
      to = {};
      from[pos] = -this['_' + dim];
      to[pos] = 0;
    }

    if (!fwd) {
      var temp = from;
      from = to;
      to = temp;

      temp = prev;
      prev = active;
      active = temp;
    }

    $el.data({to:to}).find('>.br-shape').addClass('br-extend-' + dim).css(from)
    .find('>.br-' + active).addClass('br-active-side').end()
    .find('>.br-' + prev).addClass('br-prev-side').css('visibility', visibility);
  },

        //move helper
  setMoveDown: function($el) {
    this.setMove($el, 'Y', -this._$container.height());
  },

  setMoveUp: function($el) {
    this.setMove($el, 'Y', this._$container.height());
  },

  setMoveRight: function($el) {
    this.setMove($el, 'X', -this._$container.width());
  },

  setMoveLeft: function($el) {
    this.setMove($el, 'X', this._$container.width());
  },

  setMoveRandom: function($el) {
    this.setRandomDirection($el, 'move');
  },

  setMove: function($el, axis, dist) {
    var from, to;
    if (this._transform) {
      var translate = 'translate' + axis;
      from = {transform:translate + '(' + dist + 'px)'};
      to = {transform:translate + '(0)'};
    }
    else {
      if ('Y' === axis) {
        from = {marginTop:dist};
        to = {marginTop:0};
      }
      else {
        from = {marginLeft:dist};
        to = {marginLeft:0};
      }
    }

    $el.data({to:to}).css(from).find('>.br-shape')
    .find('>.br-front').addClass('br-active-side').end()
    .find('>.br-back').hide();
  },

        //rotate helper fns
  setRotateDown: function($el) {
    this.setRotate($el, 'X', false);
  },

  setRotateUp: function($el) {
    this.setRotate($el, 'X', true);
  },

  setRotateRight: function($el) {
    this.setRotate($el, 'Y', true);
  },

  setRotateLeft: function($el) {
    this.setRotate($el, 'Y', false);
  },

  setRotateRandom: function($el) {
    this.setRandomDirection($el, 'rotate', ['up', 'down']);
  },

  setRotate: function($el, axis, positive) {
    var transform = 'translateZ(' + (-$el.data('depth')/2) + 'px) rotate' + axis,
    sign, side;

    if (positive) {
      sign = '';
      side = (axis === 'X' ? 'bottom' : 'left');
    }
    else {
      sign = '-';
      side = (axis === 'X' ? 'top' : 'right');
    }

    $el.data({to:{transform:transform + '(' + sign + '90deg)'}})
    .find('>.br-shape').css({transform:transform + '(0deg)'})
    .find('>.br-face-' + side).addClass('br-active-side').end()
    .find('>.br-face-front').addClass('br-prev-side');
  },

        //flip helper fns
  setFlipDown: function($el) {
    this.setFlip($el, 'X', false);
  },

  setFlipUp: function($el) {
    this.setFlip($el, 'X', true);
  },

  setFlipRight: function($el) {
    this.setFlip($el, 'Y', true);
  },

  setFlipLeft: function($el) {
    this.setFlip($el, 'Y', false);
  },

  setFlipRandom: function($el) {
    this.setRandomDirection($el, 'flip');
  },

  setFlip: function($el, axis, positive) {
    var transform = 'translateZ(' + (-$el.data('depth')/2) + 'px) rotate' + axis,
    sign = positive ? '' : '-';

    $el.data({to:{transform:transform + '(' + sign + '180deg)'}})
    .find('>.br-shape').css({transform:transform + '(0deg)'})
    .find('>.br-face-front').addClass('br-prev-side').end()
    .find('>.br-face-back').addClass('br-active-side').toggleClass('br-inverted', axis === 'X');
  },

        //fade effect
  fade: function() {
    var selector = '>.br-shape';
    this._$el.data({selector:selector, to:{opacity:1}})
    .find(selector).css({opacity:0})
    .find('>.br-front').addClass('br-active-side').end()
    .find('>.br-back').hide();
  },

        //zoom effect
  zoom: function() {
    var front = 'br-active-side', 
    back = 'br-prev-side',
    from = {opacity:1, transform:'scale(1)'},
    to = {opacity:0, transform:'scale(2)'};

    if ('out' === this._direction) {
      var temp = from;
      from = to;
      to = temp;

      temp = front;
      front = back;
      back = temp;
    }

    this._$el.data({selector:'>.br-shape>.br-back', to:to})
    .find('>.br-shape').addClass('br-stack')
    .find('>.br-front').addClass(front).end()
    .find('>.br-back').addClass(back).css(from);
  },

        //expand effect
  expand: function() {
    var selector = '>.br-shape',
    from, to;

    if (this._transform) {
      from = {transform:'scale(0)'};
      to = {transform:'scale(1)'};
    }
    else {
      from = {width:0, height:0};
      to = {width:this._width, height:this._height};
    }

    this._$el.data({selector:selector, to:to})
    .find(selector).css(from)
    .find('>.br-front').addClass('br-active-side').end()
    .find('>.br-back').hide();
  },

        //push effect
  push: function() {
    if (this._alternate) {
      this.setAlternate('push');
    }
    else {
      this[this.setFn('push', this._direction)](this._$el);
    }

    this._$el.data({selector:'>.br-shape'});
  },

        //cover transition
  cover: function() {
    if (this._alternate) {
      this.setAlternate('cover');
    }
    else {
      this[this.setFn('cover', this._direction)](this._$el);
    }

    this._$el.data({selector:'>.br-shape'});
  },

        //slide transition
  slide: function() {
    this._autoReverse = true;
    this._direction = this.getOpposite(this._direction);

    if (this._alternate) {
      this.setAlternate('push');
    }
    else {
      this[this.setFn('push', this._direction)](this._$el);
    }

    this._$el.data({selector:'>.br-shape'});
  },

        //move transition
  move: function() {
    this._isReverse = !this._isReverse;
    this[this.setFn('move', this._direction)](this._$el);
  },

        //flip transition
  flip: function() {
    this._$el.data({selector:'>.br-shape', depth:this._shapeDepth});
    if (this._alternate) {
      this.setAlternate('flip');
    }
    else {
      this[this.setFn('flip', this._direction)](this._$el);
    }
  },

        //rotate transition
  rotate: function() {
    this._$el.data({selector:'>.br-shape', depth:('left' === this._direction || 'right' === this._direction ? this._width : this._height)});
    if (this._alternate) {
      this.setAlternate('rotate');
    }
    else {
      this[this.setFn('rotate', this._direction)](this._$el);
    }
  },

  start: function(opts) {
    this._progress = true;

    $.each(Effect.DATA, $.proxy(function(i, val) {
      this['_' + val] = opts[val];
    }, this));

    this._columns = getPosInt(this._columns, 1);
    this._rows = getPosInt(this._rows, 1);
    this._width = Math.ceil(this._$container.width()/this._columns);
    this._height = Math.ceil(this._$container.height()/this._rows);

    if ('random' === this._effect) {
      this.setRandomEffect();
    }

    this._is3D = -1 < $.inArray(this._effect, ['flip', 'rotate']);
    if (this._is3D && !this._support3d) {
      this._effect = 'push';
      this._is3D = false;
    }

    this._interval = getNonNegInt(this._interval, 0);
    this._shapeDepth = getNonNegInt(this._shapeDepth, 0);
    this.initDirection();
    this.initOrder();
    this._isReverse = -1 < $.inArray(this._order, Effect.REVERSE);
    this._hideItems = -1 < $.inArray(this._effect, ['flip', 'push', 'rotate', 'slide', 'zoom']);

    this.createElements();
    this[this._effect]();
    this.initElements();

    var arr = this.getElementArray(),
    duration = getNonNegInt(opts.duration, $.fn.bannerRotator.defaults.duration),
    easing = opts.easing;

    this.animate(arr, duration, easing);
  },

  setRandomEffect: function() {
    var type = this.getType(),
    preset = getRandomItem(PRESETS[type]);

    $.each(['effect', 'direction', 'order'], $.proxy(function(i, val) {
      this['_' + val] = preset[val];
    }, this));
  },

        //get diagonal array
  getDiagonalArray: function(order) {
    var elArray = [],
    start = 0, 
    end = (this._rows - 1) + (this._columns - 1) + 1,
    flip = ('downLeft' === order || 'upRight' === order);

    while (start != end) {
      let i = Math.min(this._rows - 1, start);
      let j;
      while(i >= 0) {
        if (flip) {
          j = (this._columns - 1) - Math.abs(i - start);
          if (j < 0) {
            break;
          }
        }
        else {
          j = Math.abs(i - start);
          if (j >= this._columns) {
            break;
          }
        }

        elArray.push(this._$el.eq(i * this._columns + j));
        i--;
      }
      start++;
    }

    return elArray;
  },

        //get zig-zag array
  getZigZagArray: function(order) {
    var i = 0, 
    j = 0, 
    fwd = true,
    elArray = [],
    total = this._$el.length,
    count;

    if ('zigZagUp' === order || 'zigZagDown' === order) {
      for (count = 0; count < total; count++) {
        elArray[count] = this._$el.eq(i * this._columns + j);

        if (fwd) { 
          j++;
        }
        else {
          j--;
        }

        if (j == this._columns || j < 0) {
          fwd = !fwd;
          j = (fwd ? 0 : this._columns - 1);
          i++;
        }
      }
    }
    else {
      for (count = 0; count < total; count++) {
        elArray[count] = this._$el.eq(i * this._columns + j);

        if (fwd) { 
          i++;
        }
        else {
          i--;
        }

        if (i == this._rows || i < 0) {
          fwd = !fwd;
          i = (fwd ? 0 : this._rows - 1);
          j++;
        }
      }
    }

    return elArray;
  },

        //get directional array
  getDirectionalArray: function(order) {
    var elArray;
    if ('right' === order || 'left' === order) {
      elArray = [];
      for (var j = 0; j < this._columns; j++) {
        for (var i = 0; i < this._rows; i++) {
          elArray.push(this._$el.eq(i * this._columns + j));
        }
      }
    }
    else {
      elArray = this._$el.toArray();
    }

    return elArray;
  },

        //get spiral array
  getSpiralArray: function() {
    var i = 0, 
    j = 0,
    rowCount = this._rows - 1,
    colCount = this._columns - 1,
    dir = 0,
    limit = colCount,
    elArray = [];

    while (rowCount >= 0 && colCount >=0) {
      var count = 0; 
      while(true) { 
        elArray.push(this._$el.eq(i * this._columns + j));
        if ((++count) > limit) {
          break;
        }
        switch(dir) {
        case 0:
          j++;
          break;
        case 1:
          i++;
          break;
        case 2:
          j--;
          break;
        case 3:
          i--;
          break;
        }
      } 
      switch(dir) {
      case 0:
        dir = 1;
        limit = (--rowCount);
        i++;
        break;
      case 1:
        dir = 2;
        limit = (--colCount);
        j--;
        break;
      case 2:
        dir = 3;
        limit = (--rowCount);
        i--;
        break;
      case 3:
        dir = 0;
        limit = (--colCount);
        j++;
        break;
      }
    }

    return elArray;
  }
};

Effect.DATA = ['effect', 'columns', 'rows', 'interval', 'direction', 'order', 'alternate', 'autoReverse', 'depth', 'shapeColor', 'shapeShading', 'shapeDepth'];

Effect.CUBOID= '<div class="br-cuboid br-shape">\
<div class="br-face-front"></div>\
<div class="br-face-back"></div>\
<div class="br-face-left"></div>\
<div class="br-face-right"></div>\
<div class="br-face-top"></div>\
<div class="br-face-bottom"></div>\
</div>';

Effect.PLANE = '<div class="br-plane br-shape">\
<div class="br-front"></div>\
<div class="br-back"></div>\
</div>';

Effect.COLUMN = 'column';

Effect.ROW = 'row';

Effect.GRID = 'grid';

Effect.EFFECTS = ['cover', 'expand', 'fade', 'flip', 'move', 'push', 'rotate', 'slide', 'zoom'];

Effect.OPPOSITE = {
  down:'up',
  right:'left',
  downLeft:'upRight',
  downRight:'upLeft',
  spiralIn:'spiralOut',
  zigZagDown:'zigZagUp',
  zigZagRight:'zigZagLeft'
};

(function() {
  Effect.REVERSE = [];
  $.each(Effect.OPPOSITE, function(key, val) {
    Effect.OPPOSITE[val] = key;
    Effect.REVERSE.push(val);
  });

  Effect.ORDERS = getKeys(Effect.OPPOSITE);
  Effect.ORDERS.push('random');
}());

(function() {
  Effect.SINES = [];
  Effect.FLIP_PCT = [];
  var num = 20,
  radian = Math.PI,
  step = radian/num;

  for (var i = 0; i <= num; i++) {
    Effect.FLIP_PCT[i] = Math.round(i/num * 100) + '%';
    Effect.SINES[i] = roundTo(Math.sin(radian), 5);
    radian -= step;
  }
}());

(function() {
  Effect.COSINES = [];
  Effect.ROTATE_PCT = [];
  var num = 45,
  radian = degreesToRadians(45),
  step = radian/(num/2);

  for (var i = 0; i <= num; i++) {
    Effect.ROTATE_PCT[i] = Math.round(i/num * 100) + '%';
    Effect.COSINES[i] = roundTo(Math.cos(radian), 5);
    radian -= step;
    if (0 >= radian) {
      step = -step;
    }
  }
}());

export default Effect;
