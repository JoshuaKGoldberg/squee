/**
 * Removes any instances of an item from an array.
 *
 * @template TItem   Types of items in the array.
 * @param array   Array of items.
 * @param item   Item to remove.
 * @returns Whether any number of that item was removed.
 */
const removeFromArray = <TItem>(array: TItem[], item: TItem): boolean => {
    let removed = false;

    for (let i = 0; i < array.length; i += 1) {
        if (array[i] === item) {
            removed = true;
            array.splice(i, 1);
            i -= 1;
        }
    }

    return removed;
};

/**
 * Creates a new, blank registration.
 *
 * @returns A new, blank registration.
 */
const createNewRegistration = () => ({
    firstOnlyListeners: [],
    listeners: [],
});

/**
 * Listeners and first args registered to events, keyed by event name.
 *
 * @template TEvents   Types of events supported for registration.
 */
type IEventRegistrations<TEvents extends string> = {
    [EventName in TEvents]?: IRegistration | undefined;
};

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
 * Submits application events.
 *
 * @template TTypes   Event names linked to their arg types.
 */
export interface IEventSubmitter<TTypes = any> {
    /**
     * Emits an event, along with any amount of additional information.
     *
     * @param eventName   Name of an event.
     * @param args   Any additional information for the event.
     */
    emit<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, ...args: TTypes[TEventName][]): void;
}

/**
 * Receives application events.
 *
 * @template TTypes   Event names linked to their arg types.
 */
export interface IEventReceiver<TTypes = any> {
    /**
     * Binds an event listener to an event name.
     *
     * @param eventName   Name of an event.
     * @param listener   Listener for the event.
     */
    on<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, listener: (...args: TTypes[TEventName][]) => void): void;

    /**
     * Binds an event listener to the first time an event name.
     *
     * @param eventName   Name of an event.
     * @param listener   Listener for the event.
     * @remarks If the event name was already fired, it's immediately called with the args from the first event.
     */
    onFirst<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, listener: (...args: TTypes[TEventName][]) => void): void;

    /**
     * Binds an event listener to all events.
     *
     * @param listener   Called on any event with the event name and args.
     */
    onAny(listener: <TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, ...args: TTypes[TEventName][]) => void): void;

    /**
     * Removes an event listener from an event name.
     * If no listener is provided, it removes all listeners for that event name.
     * If no event name is provided, it removes all listeners for all event names.
     *
     * @param eventName   Name of an event, if not all events.
     * @param listener   Listener for the event, if not all listeners for the event(s).
     * @remarks Throws an error if the listener wasn't added for that event name.
     */
    off<TEventName extends Extract<keyof TTypes, string>>(eventName?: TEventName, listener?: (...args: TTypes[TEventName][]) => void): void;

    /**
     * Unbinds/removes an event listener from all the event names.
     *
     * @param listener Listener to be removed.
     */
    offAny<TEventName extends Extract<keyof TTypes, string>>(listener: (...args: TTypes[TEventName][]) => void): void;

    /**
     * Creates a Promise to be resolved the next time an event is fired.
     *
     * @param eventName   Name of an event.
     * @returns A Promise to be resolved with the first object passed with the event.
     */
    waitFor<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName): Promise<TTypes[TEventName]>;

    /**
     * Creates a Promise to be resolved the first time an event is fired.
     *
     * @param eventName   Name of an event.
     * @returns A Promise to be resolve with the first object passed with the first event.
     * @remarks If the event name was already fired, it's immediately resolved with the args from the first event.
     */
    waitForFirst<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName): Promise<TTypes[TEventName]>;
}

/**
 * Hub for triggerable application events.
 *
 * @template TTypes   Event names linked to their arg types.
 */
export class EventEmitter<TTypes = any> implements IEventSubmitter<TTypes> {
    /**
     * Listeners to fire on all events.
     */
    private readonly anyRegistrations: IListener[] = [];

    /**
     * Listeners and first args registered to events.
     */
    private registrations: IEventRegistrations<Extract<keyof TTypes, string>> = {};

    /**
     * Binds an event listener to an event name.
     *
     * @param eventName   Name of an event.
     * @param listener   Listener for the event.
     */
    public on<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, listener: (...args: TTypes[TEventName][]) => void): void {
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
    public onFirst<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, listener: (...args: TTypes[TEventName][]) => void): void {
        const registration = this.safelyGetRegistration(eventName);

        if (registration.firstArgs !== undefined) {
            listener(...registration.firstArgs);
        }

        registration.firstOnlyListeners.push(listener);
    }

    /**
     * Binds an event listener to all events.
     *
     * @param listener   Called on any event with the event name and args.
     */
    public onAny(listener: <TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, ...args: TTypes[TEventName][]) => void): void {
        this.anyRegistrations.push(listener);
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
    public off<TEventName extends Extract<keyof TTypes, string>>(eventName?: TEventName, listener?: (...args: TTypes[TEventName][]) => void): void {
        if (eventName === undefined) {
            this.registrations = {};
            return;
        }

        if (listener === undefined) {
            this.registrations[eventName] = createNewRegistration();
            return;
        }

        const registration = this.safelyGetRegistration(eventName);

        const wasInListeners = removeFromArray(registration.listeners, listener);
        const wasInFirstOnlyListeners = removeFromArray(registration.firstOnlyListeners, listener);

        if (!wasInListeners && !wasInFirstOnlyListeners) {
            throw new Error(`Tried to remove a non-existent listener for event name '${eventName}'.`);
        }
    }

    /**
     * Unbinds/removes an event listener from all the event names.
     *
     * @param listener Listener to be removed.
     */
    public offAny<TEventName extends Extract<keyof TTypes, string>>(listener: (...args: TTypes[TEventName][]) => void): void {
        removeFromArray(this.anyRegistrations, listener);

        for (const eventName of Object.keys(this.registrations)) {
            const registration = this.registrations[eventName as TEventName] as IRegistration;
            removeFromArray(registration.listeners, listener);
            removeFromArray(registration.firstOnlyListeners, listener);
        }
    }

    /**
     * Emits an event, along with any amount of additional information.
     *
     * @param eventName   Name of an event.
     * @param args   Any additional information for the event.
     */
    public emit<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName, ...args: TTypes[TEventName][]): void {
        const registration = this.safelyGetRegistration(eventName);

        if (registration.firstArgs === undefined) {
            for (const firstOnlyListener of registration.firstOnlyListeners) {
                firstOnlyListener(...args);
            }

            registration.firstArgs = args;
            registration.firstOnlyListeners = [];
        }

        for (const listener of registration.listeners) {
            listener(...args);
        }

        for (const listener of this.anyRegistrations) {
            listener(eventName, ...args);
        }
    }

    /**
     * Creates a Promise to be resolved the next time an event is fired.
     *
     * @param eventName   Name of an event.
     * @returns A Promise to be resolved with the first object passed with the event.
     */
    public waitFor<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName): Promise<TTypes[TEventName]> {
        return new Promise((resolve) => {
            const listener = (arg: TTypes[TEventName]) => {
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
    public waitForFirst<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName): Promise<TTypes[TEventName]> {
        return new Promise((resolve) => {
            const listener = (arg: TTypes[TEventName]) => {
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
    private safelyGetRegistration<TEventName extends Extract<keyof TTypes, string>>(eventName: TEventName): IRegistration {
        if (this.registrations[eventName] === undefined) {
            this.registrations[eventName] = createNewRegistration();
        }

        // See https://github.com/Microsoft/TypeScript/issues/10530
        return this.registrations[eventName] as IRegistration;
    }
}

export const Squee = EventEmitter;
