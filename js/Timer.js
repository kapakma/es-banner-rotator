// Timer Class
function Timer (context, options) {
  if (context) {
    this._running = false;
    this._complete = true;
    this._$timer = $('<div/>').appendTo(context._$screen).addTransitionClass('br-element-transition');

    if ($.isFunction(options.click)) {
      this._$timer.css({ cursor: 'pointer' }).on('click', options.click);
    }

    this.addOnHover(context._$outmost, context._namespace);
  }
}

Timer.prototype.start = function () {
  this._running = true;
  this._complete = false;
  this._$timer.addClass('br-on');
  this.wake();
};

Timer.prototype.stop = function () {
  this._running = false;
  this._complete = true;
  this._$timer.removeClass('br-on');
};

Timer.prototype.pause = function () {
  this._running = false;
  this.sleep();
};

Timer.prototype.wake = function () {
  this._$timer.removeClass('br-timer-sleep');
};

Timer.prototype.sleep = function () {
  if (!this._running) {
    this._$timer.addClass('br-timer-sleep');
  }
};

Timer.prototype.addOnHover = function ($parent, namespace) {
  $parent.on(`mouseenter${namespace}`, () => this.wake())
    .on(`mouseleave${namespace}`, () => this.sleep());
};

export default Timer;
