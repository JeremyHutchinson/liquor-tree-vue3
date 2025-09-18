/**
 * Event bus implementation using mitt for tree internal communication
 * This replaces the Vue 2 instance-based event system
 */

import mitt from 'mitt';
import type { EventName, EventBus } from '../types';

// Define event map for stronger typing
type EventMap = {
  [K in EventName]: any;
};

/**
 * Creates a new event bus instance for a tree
 * Each tree gets its own isolated event bus
 */
export function createEventBus(): EventBus {
  const emitter = mitt<EventMap>();

  return {
    on(event: EventName, handler: (payload?: any) => void): void {
      emitter.on(event, handler);
    },

    off(event: EventName, handler?: (payload?: any) => void): void {
      if (handler) {
        emitter.off(event, handler);
      } else {
        // Remove all handlers for this event
        emitter.off(event);
      }
    },

    emit(event: EventName, payload?: any): void {
      emitter.emit(event, payload);
    }
  };
}

/**
 * Event bus adapter that provides compatibility with the old Vue 2 API
 * This bridges internal mitt events to Vue component events
 */
export class EventBusAdapter {
  private bus: EventBus;
  private silenced: boolean = false;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  /**
   * Listen to an event
   */
  on(event: EventName, handler: (payload?: any) => void): void {
    this.bus.on(event, handler);
  }

  /**
   * Listen to an event once
   */
  once(event: EventName, handler: (payload?: any) => void): void {
    const onceHandler = (payload?: any) => {
      handler(payload);
      this.bus.off(event, onceHandler);
    };
    this.bus.on(event, onceHandler);
  }

  /**
   * Stop listening to an event
   */
  off(event: EventName, handler?: (payload?: any) => void): void {
    this.bus.off(event, handler);
  }

  /**
   * Emit an event
   */
  emit(event: EventName, payload?: any): void {
    if (this.silenced) {
      return;
    }
    this.bus.emit(event, payload);
  }

  /**
   * Temporarily silence all events
   */
  silence(): void {
    this.silenced = true;
  }

  /**
   * Re-enable event emission
   */
  unsilence(): void {
    this.silenced = false;
  }

  /**
   * Check if events are silenced
   */
  isSilenced(): boolean {
    return this.silenced;
  }
}