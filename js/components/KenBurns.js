// KBurns Class
import { isNone, camelToDash, getNonNegInt, getValue, getRandomItem } from '../util/util.js';
import { SUPPORT } from '../constants.js';

function KBurns($img, effect, opts) {
  if (this instanceof KBurns) {
    this._$img = $img;
    this._effect = effect;
    this._options = {};

    if (SUPPORT.animation && !isNone(this._effect)) {
      opts = opts || {};

      if (/^random/.test(this._effect)) {
        this._effect = this.getRandom();
      }
      else {
        this._effect = camelToDash(this._effect);
      }

      if (this._effect in KBurns.REVERSES) {
        this._effect = KBurns.REVERSES[this._effect];
        opts.direction = 'reverse';
      }

      this._effect = 'br-' + this._effect;
      this._options = {
        duration:getNonNegInt(opts.duration, 5000),
        easing:getValue(opts.easing, 'linear'), 
        playState:'paused',
        direction:opts.direction
      };

      this.set();
    }
  }
  else {
    return new KBurns($img, effect, opts);
  }
}

(function() {
  KBurns.PAN = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'];

  KBurns.ZOOMIN = ['zoom-in'];

  KBurns.ZOOMOUT = ['zoom-out'];

  $.each(KBurns.PAN, function(i, val) {
    KBurns.PAN[i] = 'pan-' + val;
    KBurns.ZOOMIN.push('zoom-in-' + val);
    KBurns.ZOOMOUT.push('zoom-out-' + val);
  });

  KBurns.ZOOM = KBurns.ZOOMIN.concat(KBurns.ZOOMOUT);

  KBurns.EFFECTS = KBurns.PAN.concat(KBurns.ZOOM);

  KBurns.REVERSES = {
    'pan-left':'pan-right',
    'pan-up':'pan-down',
    'pan-up-left':'pan-down-right', 
    'pan-up-right':'pan-down-left',
    'zoom-out':'zoom-in',
    'zoom-out-left':'zoom-in-right',
    'zoom-out-right':'zoom-in-left',
    'zoom-out-up':'zoom-in-down',
    'zoom-out-down':'zoom-in-up',
    'zoom-out-up-left':'zoom-in-down-right',
    'zoom-out-up-right':'zoom-in-down-left',
    'zoom-out-down-left':'zoom-in-up-right',
    'zoom-out-down-right':'zoom-in-up-left'
  };
}());

KBurns.prototype = {
  constructor: KBurns,

  set: function() {
    this._$img.stopAnimation(true).animation(this._effect, this._options);
  },

  start: function() {
    this._$img.css({animationPlayState:'running'});
  },

  stop: function() {
    this._$img.css({animationPlayState:'paused'});
  },

  restart: function() {
    this.set();
    this.start();
  },

  getRandom: function() {
    var name = this._effect.substring('random'.length).toUpperCase(),
    effects = KBurns[name];

    if (!$.isArray(effects)) {
      effects = KBurns.EFFECTS;
    }

    return getRandomItem(effects);
  }
};

export default KBurns;
