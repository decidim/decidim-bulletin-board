import {
  EventManager,
  MESSAGE_PROCESSED,
  MESSAGE_RECEIVED,
} from "./event_manager";

describe("EventManager", () => {
  const eventManager = new EventManager();

  describe("subscribe", () => {
    it("calls the function when an event is broadcast", () => {
      const someCallbackFn = jest.fn();
      eventManager.subscribe(someCallbackFn);
      eventManager.events.next();
      expect(someCallbackFn).toHaveBeenCalled();
    });

    it("returns a subscription", () => {
      const someCallbackFn = jest.fn();
      const subscription = eventManager.subscribe(someCallbackFn);
      subscription.unsubscribe();
      eventManager.events.next();
      expect(someCallbackFn).not.toHaveBeenCalled();
    });
  });

  describe("broadcastMessageReceived", () => {
    it("emits a message received event", (done) => {
      const subscription = eventManager.subscribe(({ type, message }) => {
        expect(type).toEqual(MESSAGE_RECEIVED);
        expect(message).toEqual("foo");
        done();
      });
      eventManager.broadcastMessageReceived("foo");
      subscription.unsubscribe();
    });
  });

  describe("broadcastMessageProcessed", () => {
    it("emits a message processed event", (done) => {
      const subscription = eventManager.subscribe(
        ({ type, message, result }) => {
          expect(type).toEqual(MESSAGE_PROCESSED);
          expect(message).toEqual("foo");
          expect(result).toEqual("bar");
          done();
        }
      );
      eventManager.broadcastMessageProcessed("foo", "bar");
      subscription.unsubscribe();
    });
  });
});
