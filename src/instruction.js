import {DOM} from 'aurelia-pal';

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
  var node = document.createElement('div');
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

  var element = document.createElement('div');
      element.className = 'au-animated-test';
      element.style.width = 0;
      element.style.height = 0;
      element.style.overflow = 'hidden';

  var style = document.createElement('style');
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
