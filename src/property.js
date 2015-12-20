import {DOM} from 'aurelia-pal';
import {PropertyInstruction} from './instruction';
import {logger} from './animator';

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

