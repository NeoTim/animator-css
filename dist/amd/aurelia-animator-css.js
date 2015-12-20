define(['exports', 'aurelia-pal', 'aurelia-templating'], function (exports, _aureliaPal, _aureliaTemplating) {
  'use strict';

  exports.__esModule = true;
  exports.logger = logger;
  exports.configure = configure;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Webkit = 'Webkit';
  var Moz = 'Moz';
  var O = 'O';
  var webkit = 'webkit';
  var moz = 'moz';
  var ms = 'ms';
  var o = 'o';
  var anim = 'animation';
  var Anim = 'Animation';
  var transit = 'transition';
  var Transit = 'Transition';
  var transfm = 'transform';
  var Transfm = 'Transform';

  var animProps = ['Name', 'Delay', 'Fill-Mode', 'Duration', 'Direction', 'Play-State', 'Iteration-Count', 'Timing-Function'];
  var transitProps = ['Delay', 'Duration', 'Property', 'Timing-Function'];
  var transfmProps = ['Box', 'Style', 'Origin'];

  var animEvents = ['AnimationStart', 'AnimationIteration', 'AnimationEnd'];
  var transitEvents = ['TransitionEnd'];

  var vendors = { webkit: webkit, moz: moz, ms: ms, o: o };
  var Vendors = { Webkit: Webkit, Moz: Moz, O: O };

  var animInstruction = { name: anim, Name: Anim, props: animProps, dom: {}, css: {}, events: animEvents };
  var transitInstruction = { name: transit, Name: Transit, props: transitProps, dom: {}, css: {}, events: transitEvents };
  var transfmInstruction = { name: transfm, Name: Transfm, props: transfmProps, dom: {}, css: {} };

  var PREFIX = findVendorPrefix();

  var keyframestype = window.CSSRule.KEYFRAMES_RULE || window.CSSRule.MOZ_KEYFRAMES_RULE || window.CSSRule.WEBKIT_KEYFRAMES_RULE;

  var handlers = {
    getDelay: function getDelay(node) {
      delay = this.getComputedValue(prop);
      if (!delay) return 0;
      delay = Number(delay.replace(/[^\d\.]/g, ''));
      return delay * 1000;
    },
    getNames: function getNames(node) {
      var names = this.getComputedValue(node, 'animation-name');
      return names ? names.split(/\s/) : names;
    }
  };

  var PropertyInstruction = (function () {
    PropertyInstruction.animation = function animation() {
      return new PropertyInstruction({
        vendor: PREFIX,
        name: anim,
        props: animProps,
        events: animEvents,
        handlers: handlers
      }, function initialize(instruction, instance) {
        createProps(instruction, function (property) {
          instance.dom = property.dom;
          instance.css = property.css;
        });
        getEventPrefix(instance);
      });
    };

    PropertyInstruction.transition = function transition() {
      var getDelay = handlers.getDelay;
      return new PropertyInstruction({
        vendor: PREFIX,
        name: transit,
        props: transitProps,
        events: transitEvents,
        handlers: { getDelay: getDelay }
      }, function initialize(instruction, instance) {
        createProps(instruction, function (property) {
          instance.dom = property.dom;
          instance.css = property.css;
        });
        createEvents(instance, false);
      });
    };

    PropertyInstruction.transform = function transform() {
      return new PropertyInstruction({
        vendor: PREFIX,
        name: transfm,
        props: transfmProps
      }, function initialize(instruction, instance) {
        createProps(instruction, function (property) {
          instance.dom = property.dom;
          instance.css = property.css;
        });
      });
    };

    PropertyInstruction.keyframes = function keyframes() {
      return new PropertyInstruction({
        vendor: PREFIX,
        name: 'keyframes',
        type: keyframestype
      }, function initialize(instruction, instance) {});
    };

    function PropertyInstruction(instruction, init) {
      _classCallCheck(this, PropertyInstruction);

      Object.assign(this, instruction);
      this.Name = cap(instruction.name);
      this.initHandler = init || function () {};
    }

    PropertyInstruction.prototype.initialize = function initialize(instance) {
      if (this.handlers) for (var handlerName in this.handlers) {
        var _handler = this.handlers[handlerName];
        instance[handlerName] = this.handlers[handlerName].bind(instance);
      }
      return this.initHandler(this, instance);
    };

    return PropertyInstruction;
  })();

  exports.PropertyInstruction = PropertyInstruction;

  function findVendorPrefix() {
    var node = _aureliaPal.DOM.createElement('div');

    return check('AnimationName', vendors) || check('AnimationName', Vendors);
    function check(key, _vendors) {
      for (var vendor in _vendors) {
        var name = vendor + key;
        if (name in node.style && node.style[name] !== null) {
          return vendor;
        }
      }
    }
  }

  function createProps(instruction, cb) {
    var pre = instruction.name;
    var PRE = instruction.Name;
    var props = instruction.props;
    var propName = PREFIX ? PREFIX + PRE : pre;
    var cssName = PREFIX ? '-' + PREFIX.toLowerCase() + '-' + pre : pre;
    var res = { dom: {}, css: {} };
    res.dom[pre] = propName;
    res.css[pre] = cssName;
    props.forEach(function (prop) {
      var p = prop.replace(/\-/g, '');
      var c = '-' + prop.toLowerCase();
      res.dom[pre + p] = propName + p;
      res.css[pre + p] = cssName + c;
      res.css[pre + c] = cssName + c;
    });
    return cb(res);
  }

  function createEvents(property, prefix) {
    if (property._events) {
      property.events = {};
      for (var index in property._events) {
        var _event = property._events[index];
        var eventName = _event.toLowerCase();
        var vendorName = prefix ? prefix + _event : eventName;
        var alias = eventName.replace(property.name, '');
        property.events[alias] = vendorName;
        property.events[eventName] = vendorName;
      }
      delete property._events;
    }
  }

  function getEventPrefix(animation) {
    var unbind;
    var animListeners = [{ prefix: false, evt: 'animationstart' }, { prefix: 'webkit', evt: 'webkitAnimationStart' }, { prefix: 'Webkit', evt: 'WebkitAnimationStart' }, { prefix: 'Moz', evt: 'MozAnimationStart' }, { prefix: 'O', evt: 'OAnimationStart' }];

    var element = _aureliaPal.DOM.createElement('div');
    element.className = 'au-animated-test';
    element.style.width = 0;
    element.style.height = 0;
    element.style.overflow = 'hidden';

    var style = _aureliaPal.DOM.createElement('style');
    style.type = 'text/css';
    style.innerHTML = "@-webkit-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @-moz-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @-ms-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @-o-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } ";

    animation.setStyle(element, 'animation-name', 'au-test-animation');
    animation.setStyle(element, 'animation-duration', '10ms');

    document.head.appendChild(style);

    unbind = function () {
      for (var index in animListeners) {
        element.removeEventListener(animListeners[index].evt, animListeners[index].handler);
      }
      element.remove();
      style.remove();
    };

    var _loop = function (index) {
      animListeners[index].handler = function (e) {
        createEvents(animation, animListeners[index].prefix);
        unbind();
      };
      element.addEventListener(animListeners[index].evt, animListeners[index].handler);
    };

    for (var index in animListeners) {
      var _handler;

      _loop(index);
    }
    document.body.appendChild(element);
  }

  function cap(name) {
    var upper = name[0].toUpperCase();
    cap.cache = cap.cache || {};
    return name[0] === upper ? name : cap.cache[name] ? cap.cache[name] : cap.cache[name] = upper + name.slice(1);
  }

  var KeyframesProperty = (function () {
    function KeyframesProperty(instruction) {
      _classCallCheck(this, KeyframesProperty);

      this.name = instruction.name;
      this.cssName = '@' + this.name;
      if (instruction.vendor || instruction.vendor !== undefined) {
        this.vendor = instruction.vendor;
        this.cssName = '@' + ('-' + this.vendor + '-' + this.name);
      }
      instruction.initialize(this);
    }

    KeyframesProperty.prototype.createSheet = function createSheet() {
      if (this.styleSheet) return;
      this.styleSheet = _aureliaPal.DOM.createElement('style');
      this.styleSheet.type = 'text/css';
      this.styleSheet.id = 'au-keyframes-sheet';
      document.head.appendChild(this.styleSheet);
      return this.styleSheet;
    };

    KeyframesProperty.prototype.getKeyframeByAnimationNames = function getKeyframeByAnimationNames(animNames) {
      var styleSheets = document.styleSheets;

      for (var sheetIndex in styleSheets) {
        var cssRules = styleSheets[sheetIndex].cssRules;

        for (var ruleIndex in cssRules) {
          var cssRule = cssRules[ruleIndex];
          var isType = cssRule.type === this.type;

          if (isType && animNames.indexOf(cssRule.name) !== -1) {
            return true;
          }
        }
      }
      return false;
    };

    return KeyframesProperty;
  })();

  var Property = (function () {
    Property.animation = function animation() {
      Property._animation = Property._animation || new Property(PropertyInstruction.animation());
      return Property._animation;
    };

    Property.transition = function transition() {
      Property._transition = Property._transition || new Property(PropertyInstruction.transition());
      return Property._transition;
    };

    Property.transform = function transform() {
      Property._transform = Property._transform || new Property(PropertyInstruction.transform());
      return Property._transform;
    };

    Property.keyframes = function keyframes() {
      Property._keyframes = Property._keyframes || new KeyframesProperty(PropertyInstruction.keyframes());
      return Property._keyframes;
    };

    function Property(instruction) {
      _classCallCheck(this, Property);

      this.name = instruction.name;
      this.metadata = instruction;
      if (instruction.events) {
        this._events = instruction.events;
      }
      instruction.initialize(this);
    }

    Property.prototype.setStyle = function setStyle(node, propName, propValue) {
      var vendorName = undefined;
      if (propName in this.dom) {
        vendorName = this.dom[propName];
      }
      node.style[propName] = propValue;
      node.style[vendorName] = propValue;
      return node;
    };

    Property.prototype.assignStyle = function assignStyle(node, styles) {
      for (var propName in styles) {
        this.setStyle(node, propName, styles[propValue]);
      }
      return node;
    };

    Property.prototype.getComputedValue = function getComputedValue(node, propName) {
      var computed = _aureliaPal.DOM.getComputedStyle(node);
      var vendorName;
      var propValue;
      if (propName in this.css) {
        vendorName = this.css[propName];
        propValue = computed.getPropertyValue(vendorName);
      }
      propValue = propValue || computed.getPropertyValue(propName);
      return propValue;
    };

    Property.prototype.subscribe = function subscribe(element, eventName, callback, bubbles) {
      eventName = eventName in this.events ? this.events[eventName] : eventName;
      callback.handler = handler;
      var event = { dispose: dispose, callback: callback, eventName: eventName, element: element, triggered: false, bound: false };
      element.addEventListener(eventName, handler, bubbles);
      event.bound = true;

      return event;

      function handler(evt) {
        event.triggered = true;
        return callback(evt);
      }

      function dispose() {
        element.removeEventListener(eventName, handler, bubbles);
        event.bound = false;
      }
    };

    Property.prototype.unsubscribe = function unsubscribe(element, eventName, callback, bubbles) {
      eventName = eventName in this.events ? this.events[eventName] : eventName;
      if (callback.handler) {
        callback = callback.handler;
      }
      element.removeEventListener(eventName, callback, bubbles);
    };

    return Property;
  })();

  exports.Property = Property;

  var animation = Property.animation();
  var keyframes = Property.keyframes();

  function logger(element) {
    if (element.nodeName === 'AI-VIEW') {
      logger.log = function () {
        console.log.apply(console, arguments);
      };
    } else {
      logger.log = function () {};
    }
  }

  logger.log = function () {};

  function runTimeout(time, cb) {
    if (!cb) return;
    if (!time) return cb();
    var TIMEOUT_ID = setTimeout(function () {
      cb();
      clearTimeout(TIMEOUT_ID);
    }, time);
  }

  var AnimationInstruction = (function () {
    AnimationInstruction.animate = function animate(instruction) {
      var name = instruction.name;
      var pre = instruction.prefix;
      var className = pre + name;
      var active = '-active';
      return new AnimationInstruction({
        name: name,
        add: {
          prepare: [className],
          activate: [className + active]
        },
        remove: {
          end: [className + active, className],
          clean: [className + active, className]
        },
        contains: {
          stagger: [pre + 'stagger', pre + 'stagger-' + name]
        },
        useDoneClasses: true
      });
    };

    AnimationInstruction.addClass = function addClass(instruction) {
      var name = 'addClass';
      var add = '-add';
      var className = instruction.className;
      return new AnimationInstruction({
        name: name,
        add: {
          end: [className],
          activate: [className + add]
        },
        remove: {
          end: [className + add],
          clean: [className + add, className]
        },
        suppressEvents: instruction.suppressEvents
      });
    };

    AnimationInstruction.removeClass = function removeClass(instruction) {
      var name = 'addClass';
      var add = '-add';
      var remove = '-remove';
      var className = instruction.className;
      return new AnimationInstruction({
        name: name,
        add: {
          start: [className],
          end: [className],
          activate: [className + remove]
        },
        remove: {
          clean: [className + remove, className]
        },
        contains: {
          canAnimate: [className, className + add]
        },
        suppressEvents: instruction.suppressEvents
      });
    };

    function AnimationInstruction(instruction) {
      _classCallCheck(this, AnimationInstruction);

      this.name = null;
      this.doneClasses = false;
      this.suppressEvents = false;

      this.name = instruction.name || false;
      this.doneClass = instruction.doneClass || this.doneClass;
      this.suppressEvents = instruction.suppressEvents || this.suppressEvents;
      this._contains = instruction.contains;
      this._remove = instruction.remove;
      this._add = instruction.add;

      var lifeCycleKeys = ['prepare', 'start', 'end', 'activate', 'done', 'clean'];
      var containKeys = ['stagger', 'canAnimate'];
    }

    AnimationInstruction.prototype._changeClass = function _changeClass(element, changeMethod, classSet, key) {
      var changeType = '_' + changeMethod;
      if (key in classSet && classSet[key].length) {
        element.classList[changeMethod].apply(element.classList, classSet[key]);
      }
    };

    AnimationInstruction.prototype.changeClass = function changeClass(element, key) {
      this._changeClass(element, 'add', this._add, key);
      this._changeClass(element, 'remove', this._remove, key);
    };

    AnimationInstruction.prototype.containsClass = function containsClass(element, key) {
      if (key in this._contains && this._contains[key].length) {
        return element.classList.contains.apply(element.classList, this._contains[key]);
      }
    };

    return AnimationInstruction;
  })();

  var cachedInstruction = {
    removeClass: {},
    addClass: {}
  };

  var CssAnimator = (function () {
    function CssAnimator() {
      _classCallCheck(this, CssAnimator);

      this.useAnimationDoneClasses = false;
      this.animationEnteredClass = 'au-entered';
      this.animationLeftClass = 'au-left';
      this.doneClasses = {
        enter: this.animationEnteredClass,
        leave: this.animationLeftClass
      };

      this.isAnimating = false;

      this.verifyKeyframesExist = true;
    }

    CssAnimator.prototype._removeDoneClasses = function _removeDoneClasses(element, name) {
      if (self.useAnimationDoneClasses && name in this.doneClasses) {
        element.classList.remove(this.doneClasses.enter);
        element.classList.remove(this.doneClasses.leave);
      }
    };

    CssAnimator.prototype._addDoneClasses = function _addDoneClasses(element, name) {
      if (self.useAnimationDoneClasses && name in this.doneClasses) {
        element.classList.remove(this.doneClasses[name]);
      }
    };

    CssAnimator.prototype._performSingleAnimate = function _performSingleAnimate(element, className) {
      var _this = this;

      this._triggerDOMEvent(_aureliaTemplating.animationEvent.animateBegin, element);
      return this.addClass(element, className, true).then(function (result) {
        _this._triggerDOMEvent(_aureliaTemplating.animationEvent.animateActive, element);

        if (result !== false) {
          return _this.removeClass(element, className, true).then(function () {
            _this._triggerDOMEvent(_aureliaTemplating.animationEvent.animateDone, element);
          });
        }

        return false;
      })['catch'](function () {
        _this._triggerDOMEvent(_aureliaTemplating.animationEvent.animateTimeout, element);
      });
    };

    CssAnimator.prototype._triggerDOMEvent = function _triggerDOMEvent(eventType, element) {
      var evt = _aureliaPal.DOM.createCustomEvent(eventType, { bubbles: true, cancelable: true, detail: element });
      _aureliaPal.DOM.dispatchEvent(evt);
    };

    CssAnimator.prototype._animationChangeWithValidKeyframe = function _animationChangeWithValidKeyframe(animationNames, prevAnimationNames) {
      var newAnimationNames = animationNames.filter(function (name) {
        return prevAnimationNames.indexOf(name) === -1;
      });

      return newAnimationNames.length === 0 ? false : !this.verifyKeyframesExist ? true : keyframes.getKeyframeByAnimationNames(newAnimationNames);
    };

    CssAnimator.prototype._runAnimationLifeCycle = function _runAnimationLifeCycle(element, instruction) {
      var self = this;
      var animationName = instruction.name;
      var beginEvent = _aureliaTemplating.animationEvent[animationName + 'Begin'];
      var activeEvent = _aureliaTemplating.animationEvent[animationName + 'Active'];
      var doneEvent = _aureliaTemplating.animationEvent[animationName + 'Done'];
      var timeoutEvent = _aureliaTemplating.animationEvent[animationName + 'Timeout'];
      var prevAnimationNames = undefined;
      var animStart = undefined;
      var animEnd = undefined;
      var canDispatch = !instruction.suppressEvents;
      var useDoneClasses = instruction.useDoneClasses;

      var animationSteps = [];
      var begin = undefined,
          removeDoneClasses = undefined,
          prepare = undefined,
          bind = undefined,
          unbind = undefined,
          activate = undefined,
          cleanup = undefined;

      return new Promise(function (resolve, reject) {
        if ('canAnimate' in instruction) {
          if (!instruction.containsClass(element, 'canAnimate')) {
            return resolve(false);
          }
        };

        canDispatch && self._triggerDOMEvent(beginEvent, element);

        instruction.changeClass(element, 'begin');
        useDoneClasses && self.removeDoneClasses(element, animationName);

        instruction.changeClass(element, 'prepare');

        prevAnimationNames = animation.getNames(element);

        animStart = animation.subscribe(element, 'start', onAnimationStart, false);
        function onAnimationStart(evAnimStart) {
          self.isAnimating = true;
          canDispatch && self._triggerDOMEvent(activeEvent, element);

          evAnimStart.stopPropagation();

          instruction.changeClass(element, 'start');
          animStart.dispose();
        }

        animEnd = animation.subscribe(element, 'end', onAnimationEnd, false);
        function onAnimationEnd(evAnimEnd) {
          if (!animStart.triggered) {
            if (animStart.bound) animStart.dispose();
            if (animEnd.bound) animEnd.dispose();
            return;
          }

          evAnimEnd.stopPropagation();

          instruction.changeClass(element, 'end');

          animEnd.dispose();

          instruction.changeClass(element, 'done');
          useDoneClasses && self._addDoneClasses(element, animationName);

          self.isAnimating = false;

          canDispatch && self._triggerDOMEvent(doneEvent, element);
          resolve(true);
        }

        var canStagger = false;
        var delay = 0;

        if (element.parentElement instanceof _aureliaPal.DOM.Element) {
          canStagger = instruction.containsClass(element, 'stagger');
        }

        if (canStagger) {
          var elemPos = Array.prototype.indexOf.call(parent.childNodes, element);
          delay = animation.getDelay(element) * elemPos;

          runTimeout(delay, function () {
            if (instruction.activate) {
              instruction.changeClass(element, 'activate');
            }
            cleanup();
          });
        } else {
          instruction.changeClass(element, 'activate');
          cleanup();
        }

        function cleanup() {
          var animationNames = animation.getNames(element);

          if (!animationNames.length) {
            instruction.changeClass(element, 'clean');

            if (!instruction.suppressEvents) {
              self._triggerDOMEvent(timeoutEvent, element);
            }
            resolve(false);
          }
        }
      });
    };

    CssAnimator.prototype.animate = function animate(element, className) {
      var _this2 = this;

      logger(element);
      if (Array.isArray(element)) {
        return Promise.all(element.map(function (el) {
          return _this2._performSingleAnimate(el, className);
        }));
      }

      return this._performSingleAnimate(element, className);
    };

    CssAnimator.prototype.runSequence = function runSequence(animations) {
      var _this3 = this;

      this._triggerDOMEvent(_aureliaTemplating.animationEvent.sequenceBegin, null);

      return animations.reduce(function (p, anim) {
        logger(anim.element);
        return p.then(function () {
          return _this3.animate(anim.element, anim.className);
        });
      }, Promise.resolve(true)).then(function () {
        _this3._triggerDOMEvent(_aureliaTemplating.animationEvent.sequenceDone, null);
      });
    };

    CssAnimator.prototype.enter = function enter(element) {
      logger(element);
      var self = this;

      if (!this.enterInstruction) {
        var instruction = { name: 'enter', prefix: 'au-' };
        this.enterInstruction = AnimationInstruction.animate(instruction);
      }
      return this._runAnimationLifeCycle(element, this.enterInstruction);
    };

    CssAnimator.prototype.leave = function leave(element) {
      logger(element);
      var self = this;

      if (!this.leaveInstruction) {
        var instruction = { name: 'leave', prefix: 'au-' };
        this.leaveInstruction = AnimationInstruction.animate(instruction);
      }
      return this._runAnimationLifeCycle(element, this.leaveInstruction);
    };

    CssAnimator.prototype.removeClass = function removeClass(element, className) {
      var suppressEvents = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      logger(element);
      if (!(className in cachedInstruction.removeClass)) {
        cachedInstruction.removeClass[className] = AnimationInstruction.removeClass({
          name: 'removeClass',
          className: className,
          suppressEvents: suppressEvents
        });
      }
      return this._runAnimationLifeCycle(element, cachedInstruction.removeClass[className]);
    };

    CssAnimator.prototype.addClass = function addClass(element, className) {
      var suppressEvents = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      logger(element);
      if (!(className in cachedInstruction.addClass)) {
        cachedInstruction.addClass[className] = AnimationInstruction.addClass({
          name: 'addClass',
          className: className,
          suppressEvents: suppressEvents
        });
      }
      return this._runAnimationLifeCycle(element, cachedInstruction.addClass[className]);
    };

    return CssAnimator;
  })();

  exports.CssAnimator = CssAnimator;

  function configure(config, callback) {
    var animator = config.container.get(CssAnimator);
    config.container.get(_aureliaTemplating.TemplatingEngine).configureAnimator(animator);
    if (typeof callback === 'function') {
      callback(animator);
    }
  }
});