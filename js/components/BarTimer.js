import Timer from './Timer.js';

//Bar Timer Class
function BarTimer(context, opts) {
  if (this instanceof BarTimer) {
    Timer.call(this, context, opts);
    this._$bar = $('<div/>');
    this._$timer.addClass('br-bar-timer').addClass(/bottom/i.test(opts.position) ? 'br-bottom' : 'br-top').append(this._$bar);
  }
  else {
    return new BarTimer(context, opts);
  }
}

BarTimer.prototype = Object.create(Timer.prototype);
BarTimer.prototype.constructor = BarTimer;

BarTimer.prototype.start = function(delay) {
  if (this._complete) {
    this._delay = delay;
  }

  this._startTime = $.now();
  this._$bar.transition({width:'101%'}, delay, 'linear');
  Timer.prototype.start.call(this);
};

BarTimer.prototype.stop = function() {
  this._elapsed = 0;
  this._$bar.stopTransition(true).width(0);

  Timer.prototype.stop.call(this);
};

BarTimer.prototype.pause = function() {
  this._$bar.stopTransition(true);
  this._elapsed += ($.now() - this._startTime);
  this._$bar.width((this._elapsed/this._delay * 101) + '%');
  
  Timer.prototype.pause.call(this);
};

export default BarTimer;
