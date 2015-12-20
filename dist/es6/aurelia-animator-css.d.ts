declare module 'aurelia-animator-css' {
  import { DOM }  from 'aurelia-pal';
  import { animationEvent, TemplatingEngine }  from 'aurelia-templating';
  export interface CssAnimation {
    className: string;
    element: HTMLElement;
  }
  export class PropertyInstruction {
    static animation(): PropertyInstruction;
    static transition(): PropertyInstruction;
    static transform(): PropertyInstruction;
    static keyframes(): PropertyInstruction;
    constructor(instruction: Object, init: Function);
    initialize(instance: Property): void;
  }
  class KeyframesProperty {
    constructor(instruction: Object);
    createSheet(): any;
    getKeyframeByAnimationNames(animNames: String): Boolean;
  }
  export class Property {
    static animation(): Property;
    static transition(): Property;
    static transform(): Property;
    static keyframes(): KeyframesProperty;
    constructor(instruction: Object);
    setStyle(node: Node, propName: String, propValue: String): Node;
    assignStyle(node: Node, styles: Object): Node;
    getComputedValue(node: Node, propName: String): String;
    subscribe(element: undefined, eventName: String, callback: Function, bubbles: Boolean): Object;
    unsubscribe(element: undefined, eventName: String, callback: Function, bubbles: Boolean): any;
  }
  export function logger(element: any): any;
  class AnimationInstruction {
    static animate(instruction: any): any;
    static addClass(instruction: any): any;
    static removeClass(instruction: any): any;
    name: any;
    doneClasses: any;
    suppressEvents: any;
    constructor(instruction: any);
    changeClass(element: any, key: any): any;
    containsClass(element: any, key: any): any;
  }
  
  /**
   * An implementation of the Animator using CSS3-Animations.
   */
  export class CssAnimator {
    
    /**
       * Creates an instance of CssAnimator.
       */
    constructor();
    
    /* Public API Begin */
    /**
       * Execute a single animation.
       * @param element Element to animate
       * @param className Properties to animate or name of the effect to use. For css animators this represents the className to be added and removed right after the animation is done.
       * @param options options for the animation (duration, easing, ...)
       * @returns Resolved when the animation is done
       */
    animate(element: HTMLElement | Array<HTMLElement>, className: string): Promise<boolean>;
    
    /**
       * Run a sequence of animations one after the other.
       * @param sequence An array of effectNames or classNames
       * @returns Resolved when all animations are done
       */
    runSequence(animations: Array<CssAnimation>): Promise<boolean>;
    
    /**
       * Execute an 'enter' animation on an element
       * @param element Element to animate
       * @returns Resolved when the animation is done
       */
    enter(element: HTMLElement): Promise<boolean>;
    
    /**
       * Execute a 'leave' animation on an element
       * @param element Element to animate
       * @returns Resolved when the animation is done
       */
    leave(element: HTMLElement): Promise<boolean>;
    
    /**
       * Add a class to an element to trigger an animation.
       * @param element Element to animate
       * @param className Properties to animate or name of the effect to use
       * @param suppressEvents Indicates whether or not to suppress animation events.
       * @returns Resolved when the animation is done
       */
    removeClass(element: HTMLElement, className: string, suppressEvents?: boolean): Promise<boolean>;
    
    /**
       * Add a class to an element to trigger an animation.
       * @param element Element to animate
       * @param className Properties to animate or name of the effect to use
       * @param suppressEvents Indicates whether or not to suppress animation events.
       * @returns Resolved when the animation is done
       */
    addClass(element: HTMLElement, className: string, suppressEvents?: boolean): Promise<boolean>;
  }
  
  /* Public API End */
  /**
   * Configuires the CssAnimator as the default animator for Aurelia.
   * @param config The FrameworkConfiguration instance.
   * @param callback A configuration callback provided by the plugin consumer.
   */
  export function configure(config: Object, callback?: ((animator: CssAnimator) => void)): void;
}