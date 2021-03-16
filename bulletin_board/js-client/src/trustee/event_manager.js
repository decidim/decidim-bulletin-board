import { Subject } from "rxjs";
import { tap } from "rxjs/operators";

export const MESSAGE_RECEIVED = "[Message] Received";
export const MESSAGE_PROCESSED = "[Message] Processed";

/**
 * This class encapsulates a stream of events that can be used by other classes.
 */
export class EventManager {
  /**
   * Initializes an empty stream of events.
   *
   * @constructor
   */
  constructor() {
    this.events = new Subject();
  }

  /**
   * Receives a callback function and creates a new stream that will call
   * that function whenever a new event is emitted.
   *
   * @param {fn} Function - A callback function.
   * @returns {Subscription}
   */
  subscribe(fn) {
    return this.events.pipe(tap(fn)).subscribe();
  }

  /**
   * Emits a new "message received" event through the stream.
   *
   * @returns {undefined}
   */
  broadcastMessageReceived(message) {
    this.events.next({
      type: MESSAGE_RECEIVED,
      message,
    });
  }

  /**
   * Emits a new "message processed" event through the stream.
   *
   * @returns {undefined}
   */
  broadcastMessageProcessed(message, result) {
    this.events.next({
      type: MESSAGE_PROCESSED,
      message,
      result,
    });
  }
}
