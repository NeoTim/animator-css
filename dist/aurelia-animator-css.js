import {DOM} from 'aurelia-pal';
import {animationEvent,TemplatingEngine} from 'aurelia-templating';

const Webkit = 'Webkit';
const Moz = 'Moz';
const O  = 'O';
const webkit = 'webkit';
const moz = 'moz';
const ms = 'ms';
const o  = 'o';
const anim = 'animation';
const Anim = 'Animation';
const transit  = 'transition'
const Transit  = 'Transition'
const transfm   = 'transform';
const Transfm   = 'Transform';

/* CSS Properties */
const animProps     = ['Name', 'Delay', 'Fill-Mode', 'Duration', 'Direction', 'Play-State', 'Iteration-Count', 'Timing-Function'];
const transitProps  = ['Delay', 'Duration', 'Property', 'Timing-Function'];
const transfmProps  = ['Box', 'Style', 'Origin'];

/* Event Names */
const animEvents    = ['AnimationStart','AnimationIteration','AnimationEnd'];
const transitEvents = ['TransitionEnd'];

var vendors = {webkit, moz, ms, o};
var Vendors = {Webkit, Moz, O};

var animInstruction     = {name: anim,    Name:Anim,    props:animProps,    dom:{}, css:{}, events:animEvents};
var transitInstruction  = {name: transit, Name:Transit, props:transitProps, dom:{}, css:{}, events:transitEvents};
var transfmInstruction  = {name: transfm, Name:Transfm, props:transfmProps, dom:{}, css:{}};

var PREFIX = findVendorPrefix();

const keyframestype = window.CSSRule.KEYFRAMES_RULE ||
                      window.CSSRule.MOZ_KEYFRAMES_RULE  ||
                      window.CSSRule.WEBKIT_KEYFRAMES_RULE;

var handlers = {
  getDelay: function(node: Node): Number {
    delay = this.getComputedValue(prop);
    if (!delay) return 0;
    delay = Number(delay.replace(/[^\d\.]/g, ''));
    return (delay * 1000);
  },
  getNames: function(node: Node): Array<String> {
    let names = this.getComputedValue(node, 'animation-name');
    return names ? names.split(/\s/) : names;
  }
}

export class PropertyInstruction {
  static animation(): PropertyInstruction {
    return new PropertyInstruction({
      vendor:PREFIX,
      name: anim,
      props: animProps,
      events: animEvents,
      handlers: handlers
    },
    function initialize(instruction: PropertyInstruction, instance: Property):void {
      createProps(instruction, (property)=> {
        instance.dom = property.dom;
        instance.css = property.css;
      });
      getEventPrefix(instance);
    })
  };

  static transition(): PropertyInstruction {
    let getDelay = handlers.getDelay;
    return new PropertyInstruction({
      vendor: PREFIX,
      name: transit,
      props: transitProps,
      events: transitEvents,
      handlers: {getDelay},
    },
    function initialize(instruction: PropertyInstruction, instance: Property):void {
      createProps(instruction, (property)=> {
        instance.dom = property.dom;
        instance.css = property.css;
      });
      createEvents(instance, false);
    });
  }

  static transform(): PropertyInstruction {
    return new PropertyInstruction({
      vendor: PREFIX,
      name: transfm,
      props: transfmProps,
    },
    function initialize(instruction: PropertyInstruction, instance: Property):void {
      createProps(instruction, (property)=> {
        instance.dom = property.dom;
        instance.css = property.css;
      });
    });
  }

  static keyframes(): PropertyInstruction {
    return new PropertyInstruction({
      vendor: PREFIX,
      name: 'keyframes',
      type: keyframestype
    },
    function initialize(instruction: PropertyInstruction, instance: Property):void {

    });
  }

  constructor(instruction: Object, init: Function) {
    Object.assign(this, instruction);
    this.Name = cap(instruction.name);
    this.initHandler = init || function (){};
  }

  initialize(instance: Property):void {
    if (this.handlers) for (let handlerName in this.handlers) {
      let _handler = this.handlers[handlerName];
      instance[handlerName] = this.handlers[handlerName].bind(instance);
    }
    return this.initHandler(this, instance);
  }
}

function findVendorPrefix() {
  var node = DOM.createElement('div');
  // if ('animationName' in node.style && node.style.animationName !== null) {return;}
  return check('AnimationName', vendors) || check('AnimationName', Vendors);
  function check(key, _vendors) {
    for(var vendor in _vendors) {
      var name = vendor + key;
      if (name in node.style && node.style[name] !== null) {
        return vendor;
      }
    }
  }
}

function createProps(instruction: PropertyInstruction, cb: Function):void {
  let pre = instruction.name;
  let PRE = instruction.Name;
  let props = instruction.props;
  var propName = PREFIX ? (PREFIX + PRE) : pre;
  var cssName  = PREFIX ? ('-'+PREFIX.toLowerCase()+'-' + pre) : pre;
  var res = {dom: {}, css: {}};
  res.dom[pre] = propName;
  res.css[pre] = cssName;
  props.forEach(prop => {
    var p = prop.replace(/\-/g, '');
    var c = ('-' + prop.toLowerCase());
    res.dom[pre + p] = (propName + p);
    res.css[pre + p] = (cssName + c);
    res.css[pre + c] = (cssName + c);
  });
  return cb(res);
}

function createEvents(property: Property, prefix: String):void {
  if (property._events) {
    property.events = {};
    for(let index in property._events) {
      let event = property._events[index];
      let eventName = event.toLowerCase();
      let vendorName = prefix ? (prefix + event) : eventName;
      let alias = eventName.replace(property.name, '');
      property.events[alias] = vendorName;
      property.events[eventName] = vendorName;
    }
    delete property._events;
  }
}

function getEventPrefix(animation: Property):void {
  var unbind;
  var animListeners = [
    {prefix: false, evt:'animationstart'},
    {prefix: 'webkit', evt:'webkitAnimationStart'},
    {prefix: 'Webkit', evt:'WebkitAnimationStart'},
    {prefix: 'Moz', evt:'MozAnimationStart'},
    {prefix: 'O', evt:'OAnimationStart'},
  ];

  var element = DOM.createElement('div');
      element.className = 'au-animated-test';
      element.style.width = 0;
      element.style.height = 0;
      element.style.overflow = 'hidden';

  var style = DOM.createElement('style');
      style.type = 'text/css';
      style.innerHTML = "@-webkit-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @-moz-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @-ms-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @-o-keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } @keyframes au-test-animation {0% {height: 0;} 100% {height: 0;} } ";

  animation.setStyle(element, 'animation-name', 'au-test-animation');
  animation.setStyle(element, 'animation-duration', '10ms');

  document.head.appendChild(style);

  unbind = function() {
    for(let index in animListeners) {
      element.removeEventListener(animListeners[index].evt, animListeners[index].handler);
    }
    element.remove();
    style.remove();
  }

  for(let index in animListeners) {
    var _handler;
    animListeners[index].handler = function(e) {
      createEvents(animation, animListeners[index].prefix);
      unbind();
    }
    element.addEventListener(animListeners[index].evt, animListeners[index].handler);
  }
  document.body.appendChild(element);
}

function cap(name: String): String {
  var upper = name[0].toUpperCase();
  cap.cache = cap.cache || {};
  return (name[0] === upper) ? name
         : (cap.cache[name])  ? cap.cache[name]
         : (cap.cache[name] = (upper + name.slice(1)));
}

class KeyframesProperty  {

  constructor(instruction: Object) {
    this.name    = instruction.name;
    this.cssName = '@'+this.name;
    if (instruction.vendor || instruction.vendor !== undefined) {
      this.vendor = instruction.vendor;
      this.cssName = '@' + (`-${this.vendor}-${this.name}`);
    }
    instruction.initialize(this);
  }

  createSheet() {
    if (this.styleSheet) return;
    this.styleSheet = DOM.createElement('style');
    this.styleSheet.type = 'text/css';
    this.styleSheet.id = 'au-keyframes-sheet';
    document.head.appendChild(this.styleSheet);
    return this.styleSheet;
  }

  getKeyframeByAnimationNames(animNames: String): Boolean {
    let styleSheets = document.styleSheets;

    // loop through the stylesheets searching for the keyframes. no cache is
    // used in case of dynamic changes to the stylesheets.
    for (let sheetIndex in styleSheets) {
      let cssRules = styleSheets[sheetIndex].cssRules;

      for (let ruleIndex in cssRules) {
        let cssRule = cssRules[ruleIndex];
        let isType  = cssRule.type === this.type;

        if (isType && animNames.indexOf(cssRule.name) !== -1) {
          return true;
        }
      }
    }
    return false;
  }
}


export class Property {

  static animation(): Property {
    Property._animation = Property._animation || new Property(PropertyInstruction.animation());
    return Property._animation;
  }

  static transition(): Property {
    Property._transition = Property._transition || new Property(PropertyInstruction.transition())
    return Property._transition;
  }

  static transform(): Property {
    Property._transform = Property._transform || new Property(PropertyInstruction.transform());
    return Property._transform;
  }

  static keyframes(): KeyframesProperty {
    Property._keyframes = Property._keyframes || new KeyframesProperty(PropertyInstruction.keyframes());
    return Property._keyframes;
  }

  constructor(instruction: Object) {
    this.name = instruction.name;
    this.metadata = instruction;
    if (instruction.events) {
      this._events = instruction.events;
    }
    instruction.initialize(this);
  }

  setStyle(node: Node, propName: String, propValue: String): Node {
    let vendorName;
    if (propName in this.dom) {
      vendorName = this.dom[propName];
    }
    node.style[propName] = propValue;
    node.style[vendorName] = propValue;
    return node;
  }

  assignStyle(node: Node, styles: Object): Node {
    for(let propName in styles) {
      this.setStyle(node, propName, styles[propValue]);
    }
    return node;
  }

  getComputedValue(node: Node, propName: String): String {
    var computed = DOM.getComputedStyle(node);
    var vendorName;
    var propValue;
    if (propName in this.css) {
      vendorName = this.css[propName];
      propValue = computed.getPropertyValue(vendorName);
    }
    propValue = propValue || computed.getPropertyValue(propName);
    return propValue;
  }

  subscribe(element: DOM.Element, eventName: String, callback: Function, bubbles: Boolean): Object {
    eventName = eventName in this.events ? this.events[eventName] : eventName;
    callback.handler = handler;
    let event = {dispose, callback, eventName, element, triggered:false, bound:false};
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
  }

  unsubscribe(element: DOM.Element, eventName: String, callback: Function, bubbles: Boolean) {
    eventName = eventName in this.events ? this.events[eventName] : eventName;
    if (callback.handler) {
      callback = callback.handler;
    }
    element.removeEventListener(eventName, callback, bubbles);
  }
}


interface CssAnimation {
  className: string;
  element: HTMLElement;
}

const animation = Property.animation();
const keyframes = Property.keyframes();


export  function logger(element) {
  if (element.nodeName === 'AI-VIEW') {
    logger.log = function (...args) {
      console.log(...args)
    }
  } else {
    logger.log = function(){};
  }
}
logger.log = function(){}

function runTimeout(time, cb) {
  if (!cb) return;
  if (!time) return cb();
  let TIMEOUT_ID = setTimeout(()=> {
    cb();
    clearTimeout(TIMEOUT_ID);
  }, time);
}

class AnimationInstruction {
  static animate(instruction) {
    let name = instruction.name;
    let pre = instruction.prefix;
    let className = pre + name;
    let active = '-active';
    return new AnimationInstruction({
      name: name,
      add: {
        prepare: [className],
        activate: [className + active],
      },
      remove: {
        end: [className + active, className],
        clean: [className + active, className],
      },
      contains: {
        stagger: [`${pre}stagger`, `${pre}stagger-${name}`],
      },
      useDoneClasses: true,
    });
  };

  static addClass(instruction) {
    let name = 'addClass';
    let add = '-add';
    let className = instruction.className;
    return new AnimationInstruction({
      name: name,
      add: {
        end: [className],
        activate: [className + add],
      },
      remove: {
        end: [className + add],
        clean: [className + add, className]
      },
      suppressEvents: instruction.suppressEvents,
    });
  }

  static removeClass(instruction) {
    let name = 'addClass';
    let add = '-add';
    let remove = '-remove';
    let className = instruction.className;
    return new AnimationInstruction({
      name: name,
      add: {
        start: [className],
        end: [className],
        activate: [className + remove],
      },
      remove: {
        clean: [className + remove, className],
      },
      contains: {
        canAnimate:[className, className + add]
      },
      suppressEvents: instruction.suppressEvents,
    });
  }

  name = null;
  doneClasses = false;
  suppressEvents = false;
  constructor(instruction) {
    this.name      = instruction.name || false;
    this.doneClass = instruction.doneClass || this.doneClass
    this.suppressEvents = instruction.suppressEvents || this.suppressEvents;
    this._contains = instruction.contains;
    this._remove = instruction.remove;
    this._add = instruction.add;

    const lifeCycleKeys = ['prepare', 'start', 'end', 'activate', 'done', 'clean'];
    const containKeys = ['stagger', 'canAnimate'];
  }

  _changeClass(element, changeMethod, classSet, key) {
    let changeType = '_'+changeMethod;
    if (key in classSet && classSet[key].length) {
      element.classList[changeMethod].apply(element.classList, classSet[key]);
    }
  }

  changeClass(element, key) {
    this._changeClass(element, 'add', this._add, key);
    this._changeClass(element, 'remove', this._remove, key);
  }

  containsClass(element, key) {
    if (key in this._contains && this._contains[key].length) {
      return element.classList.contains.apply(element.classList, this._contains[key]);
    }
  }
}

let cachedInstruction = {
  removeClass: {},
  addClass: {}
};

/**
 * An implementation of the Animator using CSS3-Animations.
 */
export class CssAnimator {
  /**
   * Creates an instance of CssAnimator.
   */
  constructor() {
    this.useAnimationDoneClasses = false;
    this.animationEnteredClass = 'au-entered';
    this.animationLeftClass = 'au-left';
    this.doneClasses = {
      enter: this.animationEnteredClass,
      leave: this.animationLeftClass
    };

    this.isAnimating = false;
    // toggle this on to save performance at the cost of animations referring
    // to missing keyframes breaking detection of termination
    this.verifyKeyframesExist = true;
  }

  _removeDoneClasses(element, name) {
    if (self.useAnimationDoneClasses && name in this.doneClasses) {
      element.classList.remove(this.doneClasses.enter);
      element.classList.remove(this.doneClasses.leave);
    }
  }

  _addDoneClasses(element, name) {
    if (self.useAnimationDoneClasses && name in this.doneClasses) {
      element.classList.remove(this.doneClasses[name]);
    }
  }

  /**
   * Run an animation for the given element with the specified className
   *
   * @param element   the element to be animated
   * @param className the class to be added and removed
   * @returns {Promise<Boolean>}
   */
  _performSingleAnimate(element: HTMLElement, className: string): Promise<boolean> {
    this._triggerDOMEvent(animationEvent.animateBegin, element);
    return this.addClass(element, className, true)
      .then((result) => {
        this._triggerDOMEvent(animationEvent.animateActive, element);

        if (result !== false) {
          return this.removeClass(element, className, true)
            .then(() => {
              this._triggerDOMEvent(animationEvent.animateDone, element);
            });
        }

        return false;
      })
      .catch(() => {
        this._triggerDOMEvent(animationEvent.animateTimeout, element);
      });
  }

  /**
   * Triggers a DOM-Event with the given type as name and adds the provided element as detail
   * @param eventType the event type
   * @param element   the element to be dispatched as event detail
   */
  _triggerDOMEvent(eventType: string, element: HTMLElement): void {
    let evt = DOM.createCustomEvent(eventType, {bubbles: true, cancelable: true, detail: element});
    DOM.dispatchEvent(evt);
  }

  /**
   * Returns true if there is a new animation with valid keyframes
   * @param animationNames the current animation style.
   * @param prevAnimationNames the previous animation style
   * @private
   */
  _animationChangeWithValidKeyframe(animationNames: Array<string>, prevAnimationNames: Array<string>): bool {
    let newAnimationNames = animationNames.filter(name => prevAnimationNames.indexOf(name) === -1);

    return (newAnimationNames.length === 0)  ? false
         : (!this.verifyKeyframesExist)     ? true
         : keyframes.getKeyframeByAnimationNames(newAnimationNames);
  }

  /**
   * _runAnimationLifeCycle
   * @param  {Element} element The Element to run the LifeCycle against
   * @param  {AnimationInstruction} instruction [description]
   * @return {Promise}
   * @private
   */
  _runAnimationLifeCycle(element: HTMLElement, instruction: AnimationInstruction): Promise<boolean> {
    let self = this;
    let animationName = instruction.name;
    let beginEvent    = animationEvent[animationName + 'Begin'];
    let activeEvent   = animationEvent[animationName + 'Active'];
    let doneEvent     = animationEvent[animationName + 'Done'];
    let timeoutEvent  = animationEvent[animationName + 'Timeout'];
    let prevAnimationNames;
    let animStart;
    let animEnd;
    let canDispatch    = !instruction.suppressEvents;
    let useDoneClasses = instruction.useDoneClasses;

    let animationSteps = [];
    let begin, removeDoneClasses, prepare, bind, unbind, activate, cleanup;

    return new Promise((resolve, reject) => {
      if ('canAnimate' in instruction) {
        if (!instruction.containsClass(element, 'canAnimate')) {
          return resolve(false);
        }
      };

      // Step: Begin
      // Dispatch Event then set classNames
      canDispatch && self._triggerDOMEvent(beginEvent, element);

      instruction.changeClass(element, 'begin');
      useDoneClasses && self.removeDoneClasses(element, animationName);

      // Step: Prepare
      // Add animation preparation class then find prevAnimations
      instruction.changeClass(element, 'prepare');

      prevAnimationNames = animation.getNames(element);

      // Step: Bind
      // add animationstart Event Listeenr
      animStart = animation.subscribe(element, 'start', onAnimationStart, false);
      function onAnimationStart(evAnimStart) {
        self.isAnimating = true;
        canDispatch && self._triggerDOMEvent(activeEvent, element);

        // Stop event propagation, bubbling will otherwise prevent parent animation
        evAnimStart.stopPropagation();

        instruction.changeClass(element, 'start');
        animStart.dispose();
      }

      // Step: AnimationEnd
      // add animationEnd eventListener
      animEnd = animation.subscribe(element, 'end', onAnimationEnd, false);
      function onAnimationEnd(evAnimEnd) {
        if (!animStart.triggered) {
          if (animStart.bound) animStart.dispose();
          if (animEnd.bound) animEnd.dispose();
          return;
        }

        // AnimationEnd Step 1:
        // Stop event propagation, bubbling will otherwise prevent parent animation
        evAnimEnd.stopPropagation();

        // AnimationEnd Step 2:
        // Set Proper animationEnd classNames
        instruction.changeClass(element, 'end');

        // AnimationEnd Step 3:
        // remove animationend eventListener
        animEnd.dispose();

        // AnimationDone Step 1:
        // Set Proper animationDone classNames
        instruction.changeClass(element, 'done');
        useDoneClasses && self._addDoneClasses(element, animationName);

        self.isAnimating = false;

        // AnimationDone Step 2:
        // Dispatch Done Event
        canDispatch && self._triggerDOMEvent(doneEvent, element);
        resolve(true);
      }

      // Step Activate:
      let canStagger = false;
      let delay = 0;

      // Activate step 1:
      // check if parent element is defined to stagger animations otherwise trigger active immediately
      if (element.parentElement instanceof DOM.Element) {
        canStagger = instruction.containsClass(element, 'stagger');
      }

      if (canStagger) {
        let elemPos = Array.prototype.indexOf.call(parent.childNodes, element);
        delay = animation.getDelay(element) * elemPos;

        runTimeout(delay, ()=> {
          if (instruction.activate) {
            instruction.changeClass(element, 'activate');
          }
          cleanup();
        });
      } else {
        instruction.changeClass(element, 'activate');
        cleanup();
      }

      // Step cleanup:
      // if no animations scheduled cleanup animation classes
      function cleanup() {
        let animationNames = animation.getNames(element);
        // if (! this._animationChangeWithValidKeyframe(animationNames, prevAnimationNames)) {
        if (! animationNames.length) {
          instruction.changeClass(element, 'clean');

          if (!instruction.suppressEvents) {
            self._triggerDOMEvent(timeoutEvent, element);
          }
          resolve(false);
        }
      }
    });
  }

  /* Public API Begin */
  /**
   * Execute a single animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use. For css animators this represents the className to be added and removed right after the animation is done.
   * @param options options for the animation (duration, easing, ...)
   * @returns Resolved when the animation is done
   */
  animate(element: HTMLElement | Array<HTMLElement>, className: string): Promise<boolean> {
    logger(element);
    if (Array.isArray(element)) {
      return Promise.all(element.map( (el) => {
        return this._performSingleAnimate(el, className);
      }));
    }

    return this._performSingleAnimate(element, className);
  }

  /**
   * Run a sequence of animations one after the other.
   * @param sequence An array of effectNames or classNames
   * @returns Resolved when all animations are done
   */
  runSequence(animations: Array<CssAnimation>): Promise<boolean> {
    this._triggerDOMEvent(animationEvent.sequenceBegin, null);

    return animations.reduce((p, anim) => {
      logger(anim.element);
      return p.then(() => { return this.animate(anim.element, anim.className); });
    }, Promise.resolve(true) ).then(() => {
      this._triggerDOMEvent(animationEvent.sequenceDone, null);
    });
  }

  /**
   * Execute an 'enter' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  enter(element: HTMLElement): Promise<boolean> {
    logger(element);
    let self = this;

    if (!this.enterInstruction) {
      let instruction = {name:'enter', prefix: 'au-'};
      this.enterInstruction = AnimationInstruction.animate(instruction);
    }
    return this._runAnimationLifeCycle(element, this.enterInstruction);
  }

  /**
   * Execute a 'leave' animation on an element
   * @param element Element to animate
   * @returns Resolved when the animation is done
   */
  leave(element: HTMLElement): Promise<boolean> {
    logger(element);
    let self = this;

    if (!this.leaveInstruction) {
      let instruction = {name:'leave', prefix: 'au-'};
      this.leaveInstruction = AnimationInstruction.animate(instruction);
    }
    return this._runAnimationLifeCycle(element, this.leaveInstruction);
  }

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @param suppressEvents Indicates whether or not to suppress animation events.
   * @returns Resolved when the animation is done
   */
  removeClass(element: HTMLElement, className: string, suppressEvents: boolean = false): Promise<boolean> {
    logger(element);
    if (!(className in cachedInstruction.removeClass)) {
      cachedInstruction.removeClass[className] = AnimationInstruction.removeClass({
        name: 'removeClass',
        className: className,
        suppressEvents: suppressEvents
      });
    }
    return this._runAnimationLifeCycle(element, cachedInstruction.removeClass[className]);
  }

  /**
   * Add a class to an element to trigger an animation.
   * @param element Element to animate
   * @param className Properties to animate or name of the effect to use
   * @param suppressEvents Indicates whether or not to suppress animation events.
   * @returns Resolved when the animation is done
   */
  addClass(element: HTMLElement, className: string, suppressEvents: boolean = false): Promise<boolean> {
    logger(element);
    if (!(className in cachedInstruction.addClass)) {
      cachedInstruction.addClass[className] = AnimationInstruction.addClass({
        name: 'addClass',
        className: className,
        suppressEvents: suppressEvents
      });
    }
    return this._runAnimationLifeCycle(element, cachedInstruction.addClass[className]);
  }
  /* Public API End */
}




/**
 * Configuires the CssAnimator as the default animator for Aurelia.
 * @param config The FrameworkConfiguration instance.
 * @param callback A configuration callback provided by the plugin consumer.
 */
export function configure(config: Object, callback?:(animator:CssAnimator) => void): void {
  let animator = config.container.get(CssAnimator);
  config.container.get(TemplatingEngine).configureAnimator(animator);
  if (typeof callback === 'function') { callback(animator); }
}
