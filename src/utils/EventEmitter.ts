/**
 * Simple Event Emitter implementation
 */
export class EventEmitter {
  private events: Record<string, Function[]>;
  
  constructor() {
    this.events = {};
  }

  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   */
  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function to remove
   */
  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  /**
   * Add a one-time event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   */
  once(event: string, listener: Function) {
    const onceListener = (...args: unknown[]) => {
      this.off(event, onceListener);
      listener.apply(this, args);
    };
    this.on(event, onceListener);
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   */
  emit(event: string, ...args: unknown[]) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  removeAllListeners(event: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
} 