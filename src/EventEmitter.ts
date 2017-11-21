import { removeFromArray } from "./utils";

/**
 * Listeners and first args registered to events, keyed by event name.
 */
interface IRegistrations {
    [i: string]: IRegistration;
}

/**
 * Listeners and first args registered to an event.
 */
interface IRegistration {
    /**
     * Args sent by the first emission, if available yet.
     */
    firstArgs?: any[];

    /**
     * Registered listeners for first emissions
     */
    firstOnlyListeners: IListenerRegistrations;

    /**
     * Registered listeners for all emissions.
     */
    listeners: IListenerRegistrations;
}

/**
 * Listeners registered to an event.
 */
type IListenerRegistrations = IListener[];

/**
 * Listener for an event.
 *
 * @param args   Any args for the event.
 */
type IListener = (...args: any[]) => void;

/**
 * Hub for triggerable application events.
 */
export class EventEmitter {
    /**
     * Listeners and first args registered to events.
     */
    private readonly registrations: IRegistrations = {};

    /**
     * Binds an event listener to an event name.
     *
     * @param eventName   Name of an event.
     * @param listener   Listener for the event.
     */
    public on(eventName: string, listener: (...args: {}[]) => void): void {
        this.safelyGetRegistration(eventName)
            .listeners.push(listener);
    }

    /**
     * Binds an event listener to the first time an event name.
     *
     * @param eventName   Name of an event.
     * @param listener   Listener for the event.
     * @remarks If the event name was already fired, it's immediately called with the args from the first event.
     */
    public onFirst(eventName: string, listener: (...args: {}[]) => void): void {
        this.safelyGetRegistration(eventName)
            .firstOnlyListeners.push(listener);
    }

    /**
     * Removes an event listener from an event name.
     * If no listener is provided, it removes all listeners for that event name.
     * If no event name is provided, it removes all listeners for all event names.
     *
     * @param eventName   Name of an event, if not all events.
     * @param listener   Listener for the event, if not all listeners for the event(s).
     * @remarks Throws an error if the listener wasn't added for that event name.
     */
    public off(eventName?: string, listener?: (...args: {}[]) => void): void {
        if (eventName === undefined) {
            for (const registeredEventName of Object.keys(this.registrations)) {
                this.off(registeredEventName);
            }

            return;
        }

        const registration = this.safelyGetRegistration(eventName);

        if (listener === undefined) {
            registration.firstOnlyListeners.length = 0;
            registration.listeners.length = 0;
            return;
        }

        const wasInListeners = removeFromArray(registration.listeners, listener);
        const wasInFirstOnlyListeners = removeFromArray(registration.firstOnlyListeners, listener);

        if (!wasInListeners && !wasInFirstOnlyListeners) {
            throw new Error(`Tried to remove a non-existent listener for event name '${eventName}'.`);
        }
    }

    /**
     * Emits an event, along with any amount of additional information.
     *
     * @param eventName   Name of an event.
     * @param args   Any additional information for the event.
     */
    public emit(eventName: string, ...args: {}[]): void {
        const registration = this.registrations[eventName];
        if (registration === undefined) {
            return;
        }

        if (registration.firstArgs === undefined) {
            for (const firstOnlyListener of registration.firstOnlyListeners) {
                firstOnlyListener(...args);
            }

            registration.firstArgs = args;
        }

        for (const listener of registration.listeners) {
            listener(...args);
        }
    }

    /**
     * Creates a Promise to be resolved the next time an event is fired.
     *
     * @param eventName   Name of an event.
     * @returns A Promise to be resolved with the first object passed with the event.
     */
    public waitFor(eventName: string): Promise<{}> {
        return new Promise((resolve) => {
            const listener = (arg: any) => {
                resolve(arg);
                this.off(eventName, listener);
            };

            this.on(eventName, listener);
        });
    }

    /**
     * Creates a Promise to be resolved the first time an event is fired.
     *
     * @param eventName   Name of an event.
     * @returns A Promise to be resolve with the first object passed with the first event.
     * @remarks If the event name was already fired, it's immediately resolved with the args from the first event.
     */
    public waitForFirst(eventName: string): Promise<{}> {
        return new Promise((resolve) => {
            const listener = (arg: any) => {
                resolve(arg);
                this.off(eventName, listener);
            };

            this.onFirst(eventName, listener);
        });
    }

    /**
     * Ensures the registrations object for an event exists.
     *
     * @param eventName   Name of an event.
     * @returns Registrations for the event.
     */
    private safelyGetRegistration(eventName: string): IRegistration {
        if (this.registrations[eventName] === undefined) {
            this.registrations[eventName] = {
                firstOnlyListeners: [],
                listeners: [],
            };
        }

        return this.registrations[eventName];
    }
}
