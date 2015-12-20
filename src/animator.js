import {animationEvent} from 'aurelia-templating';
import {Property} from './property';
import {DOM} from 'aurelia-pal';

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
        canAnimate: ['au-animate'],
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
      suppressEvents: instruction.suppressEvents
    });
  }

  constructor(instruction) {
    this.name      = instruction.name || false;
    this.doneClass = instruction.doneClass || this.doneClass;
    this.suppressEvents = instruction.suppressEvents || false;
    this.doneClasses  = instruction.doneClasses || false;
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
    this._animation = animation;
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
      if (!element.classList.contains('au-animate')) {
      // if (!instruction.containsClass(element, 'canAnimate')) {
        return resolve(false);
      }

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
        delay = (animation.getDelay(element) * elemPos) || delay;

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



