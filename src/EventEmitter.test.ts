import { EventEmitter } from "./index";

describe("EventEmitter", () => {
    describe("on", () => {
        it("triggers a listener when an event is fired after attaching the listener", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();

            emitter.on(eventName, listener);

            // Act
            emitter.emit(eventName);

            // Assert
            expect(listener).toHaveBeenCalled();
        });

        it("triggers a listener with args when an event is fired with args", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();
            const args = [{}, {}];

            emitter.on(eventName, listener);

            // Act
            emitter.emit(eventName, ...args);

            // Assert
            expect(listener).toHaveBeenCalledWith(...args);
        });

        it("triggers multiple listeners when an event is fired after attaching the listeners", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const firstListener = jasmine.createSpy("first");
            const secondListener = jasmine.createSpy("second");
            const args = [{}, {}];

            emitter.on(eventName, firstListener);
            emitter.on(eventName, secondListener);

            // Act
            emitter.emit(eventName, ...args);

            // Assert
            expect(firstListener).toHaveBeenCalledWith(...args);
            expect(secondListener).toHaveBeenCalledWith(...args);
        });

        it("triggers a listener twice when an event is fired after attaching the listener twice", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();

            emitter.on(eventName, listener);
            emitter.on(eventName, listener);

            // Act
            emitter.emit(eventName);

            // Assert
            expect(listener).toHaveBeenCalledTimes(2);
        });

        it("doesn't trigger a listener when an event is fired before attaching the listener", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();

            // Act
            emitter.emit(eventName);

            // Assert
            expect(listener).not.toHaveBeenCalled();
        });

        it("doesn't trigger a listener after the event is cleared with off", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();
            emitter.on(eventName, listener);

            // Act
            emitter.off(eventName, listener);
            emitter.emit(eventName);

            // Assert
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe("onFirst", () => {
        it("triggers a listener when an event is first fired after attaching the listener", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();

            emitter.onFirst(eventName, listener);

            // Act
            emitter.emit(eventName);

            // Assert
            expect(listener).toHaveBeenCalled();
        });

        it("triggers multiple listeners when an event is first fired after attaching the listeners", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const firstListener = jasmine.createSpy("first");
            const secondListener = jasmine.createSpy("second");
            const args = [{}, {}];

            emitter.onFirst(eventName, firstListener);
            emitter.onFirst(eventName, secondListener);

            // Act
            emitter.emit(eventName, ...args);

            // Assert
            expect(firstListener).toHaveBeenCalledWith(...args);
            expect(secondListener).toHaveBeenCalledWith(...args);
        });

        it("triggers a listener with the first args when an event was already fired and then fired after attaching the listener", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();
            const args = [{}, {}];

            emitter.emit(eventName, ...args);
            emitter.onFirst(eventName, listener);

            // Act
            emitter.emit(eventName, "bad");

            // Assert
            expect(listener).toHaveBeenCalledWith(...args);
        });

        it("doesn't trigger a listener after the event is cleared with off", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();

            emitter.onFirst(eventName, listener);
            emitter.off(eventName, listener);

            // Act
            emitter.emit(eventName);

            // Assert
            expect(listener).not.toHaveBeenCalled();
        });

        it("uses the new first event when the event is cleared with off", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();
            const args = [{}, {}];

            emitter.emit(eventName, "bad");
            emitter.onFirst(eventName, listener);
            emitter.off(eventName);
            emitter.onFirst(eventName, listener);

            // Act
            emitter.emit(eventName, ...args);

            // Assert
            expect(listener).toHaveBeenCalledWith(...args);
        });

        it("uses the original first event when the listener is cleared with off then called again", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();
            const args = [{}, {}];

            emitter.emit(eventName, ...args);
            emitter.onFirst(eventName, listener);
            emitter.off(eventName, listener);
            emitter.onFirst(eventName, listener);

            // Act
            emitter.emit(eventName, "bad");

            // Assert
            expect(listener).toHaveBeenCalledWith(...args);
        });
    });

    describe("off", () => {
        it("clears event listener when the listener is registered multiple times", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const listener = jasmine.createSpy();

            emitter.on(eventName, listener);
            emitter.on(eventName, listener);
            emitter.onFirst(eventName, listener);
            emitter.onFirst(eventName, listener);

            // Act
            emitter.off(eventName, listener);
            emitter.emit(eventName);

            // Assert
            expect(listener).not.toHaveBeenCalled();
        });

        it("clears just the passed event listener when passed an event name and listener", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const permanentListener = jasmine.createSpy();
            const temporaryListener = jasmine.createSpy();

            emitter.on(eventName, permanentListener);
            emitter.on(eventName, temporaryListener);

            // Act
            emitter.off(eventName, temporaryListener);
            emitter.emit(eventName);

            // Assert
            expect(temporaryListener).not.toHaveBeenCalled();
            expect(permanentListener).toHaveBeenCalled();
        });

        it("clears all event listeners when passed just an event name", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const secondListener = jasmine.createSpy("second");
            const firstListener = jasmine.createSpy("first");

            emitter.on(eventName, secondListener);
            emitter.on(eventName, firstListener);

            // Act
            emitter.off(eventName);
            emitter.emit(eventName);

            // Assert
            expect(firstListener).not.toHaveBeenCalled();
            expect(secondListener).not.toHaveBeenCalled();
        });

        it("clears all events and event listeners when passed nothing", () => {
            // Arrange
            const emitter = new EventEmitter();
            const firstEventName = "first-event";
            const secondEventName = "second-event";
            const secondListener = jasmine.createSpy("second");
            const firstListener = jasmine.createSpy("first");

            emitter.on(firstEventName, secondListener);
            emitter.on(secondEventName, firstListener);

            // Act
            emitter.off();
            emitter.emit(firstEventName);
            emitter.emit(secondEventName);

            // Assert
            expect(firstListener).not.toHaveBeenCalled();
            expect(secondListener).not.toHaveBeenCalled();
        });

        it("throws an error when an unregistered listener is passed", () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";

            // Act
            const action = (): void => {
                emitter.off(eventName, jasmine.createSpy());
            };

            // Assert
            expect(action).toThrow(`Tried to remove a non-existent listener for event name '${eventName}'.`);
        });
    });

    describe("waitFor", () => {
        it("resolves when the event is fired", async () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";

            // Act
            const action = emitter.waitFor(eventName);
            emitter.emit(eventName);

            // Assert
            await action;
        });

        it("resolves with the first passed arg when the event is fired with args", async () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const arg = {};

            // Act
            const action = emitter.waitFor(eventName);
            emitter.emit(eventName, arg);

            // Assert
            expect(await action).toBe(arg);
        });

        it("resolves with the next fired event if attached after the event was already fired", async () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const arg = {};

            emitter.emit("bad");

            // Act
            const action = emitter.waitFor(eventName);
            emitter.emit(eventName, arg);

            // Assert
            expect(await action).toBe(arg);
        });
    });

    describe("waitForFirst", () => {
        it("resolves when an event is first fired after attaching the listener", async () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";

            // Act
            const action = emitter.waitForFirst(eventName);
            emitter.emit(eventName);

            // Assert
            await action;
        });

        it("resolves with the first args object when an event was already fired and then fired after attaching the listener", async () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            const arg = {};

            // Act
            emitter.emit("bad");
            const action = emitter.waitForFirst(eventName);
            emitter.emit(eventName, arg);

            // Assert
            expect(await action).toBe(arg);
        });

        it("doesn't (quickly) resolve when the event is fired before registration", async () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            let resolved = false;

            emitter.emit(eventName);

            // Act
            // tslint:disable-next-line no-floating-promises
            emitter.waitFor(eventName)
                .then(() => {
                    resolved = true;
                });

            // Assert
            await Promise.resolve();
            expect(resolved).toBe(false);
        });

        it("doesn't (quickly) resolve after the event is cleared with off", async () => {
            // Arrange
            const emitter = new EventEmitter();
            const eventName = "event-name";
            let resolved = false;

            // Act
            // tslint:disable-next-line no-floating-promises
            emitter.waitForFirst(eventName)
                .then(() => {
                    resolved = true;
                });
            emitter.off(eventName);
            emitter.emit(eventName);

            // Assert
            await Promise.resolve();
            expect(resolved).toBe(false);
        });
    });
});
