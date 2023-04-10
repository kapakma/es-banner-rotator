import Timer from './Timer.js';
import { getEnum } from '../util/util.js';

//Pie Timer Class
function PieTimer(context, opts) {
  if (this instanceof PieTimer) {
    Timer.call(this, context, opts);
    var css = {},
        positions = opts.position.split(' ', 2);
    
    css[getEnum(positions[0], ['left', 'right'], 'right')] = 0;
    css[getEnum(positions[1], ['top', 'bottom'], 'top')] = 0;

    this._$spinner = $('<div/>', {'class':'br-spinner', html:'<div/>'});
    this._$fill = $('<div/>', {'class':'br-pie-fill', html:'<div/>'});
    this._$mask = $('<div/>', {'class':'br-pie-mask'});
    this._$el = this._$spinner.add(this._$fill).add(this._$mask);
    this._$timer.addClass('br-pie-timer').css(css).append(this._$el);
  }
  else {
    return new PieTimer(context, opts);
  }
}

PieTimer.prototype = Object.create(Timer.prototype);
PieTimer.prototype.constructor = PieTimer;

PieTimer.prototype.start = function(delay) {
    if (this._complete) {
        this._delay = delay;
    }
    
    this._startTime = $.now();
    this._$spinner.transition({transform:'rotate(360deg)'}, delay, 'linear');
    if (this._elapsed < this._delay/2) {
        var props = {duration:0, easing:'linear', delay:this._delay/2 - this._elapsed};
        this._$fill.transition({opacity:1}, props);
        this._$mask.transition({opacity:0}, props);
    }

    Timer.prototype.start.call(this);
};

PieTimer.prototype.stop = function() {
    this._elapsed = 0;
    this._$el.stopTransition(true);
    this._$fill.css({opacity:0});
    this._$mask.css({opacity:1});
    this._$spinner.css({transform:'rotate(0)'});

    Timer.prototype.stop.call(this);
};

PieTimer.prototype.pause = function() {
    this._$el.stopTransition(true);
    this._elapsed += ($.now() - this._startTime);
    
    var degree = (this._elapsed/this._delay * 360);
    this._$spinner.css({transform:'rotate(' + degree + 'deg)'});
    if (this._elapsed < this._delay/2) {
        this._$fill.css({opacity:0});
        this._$mask.css({opacity:1});
    }

    Timer.prototype.pause.call(this);
};

export default PieTimer;
