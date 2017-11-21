/**
 * Hub for triggerable application events.
 */
export class EventEmitter {
    /**
     * Binds an event listener to an event name.
     *
     * @param eventName   Name of an event.
     * @param listener   Listener for the event.
     */
    public on(eventName: string, listener: (...args: {}[]) => void): void {
        return;
    }

    /**
     * Binds an event listener to the first time an event name.
     *
     * @param eventName   Name of an event.
     * @param listener   Listener for the event.
     * @remarks If the event name was already fired, it's immediately called with the args from the first event.
     */
    public onFirst(eventName: string, listener: (...args: {}[]) => void): void {
        return;
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
        return;
    }

    /**
     * Emits an event, along with any amount of additional information.
     *
     * @param eventName   Name of an event.
     * @param args   Any additional information for the event.
     */
    public emit(eventName: string, ...args: {}[]): void {
        return;
    }

    /**
     * Creates a Promise to be resolved the next time an event is fired.
     *
     * @param eventName   Name of an event.
     * @returns A Promise to be resolved with the first object passed with the event.
     */
    public waitFor(eventName: string): Promise<{}> {
        return Promise.resolve({});
    }

    /**
     * Creates a Promise to be resolved the first time an event is fired.
     *
     * @param eventName   Name of an event.
     * @returns A Promise to be resolve with the first object passed with the first event.
     * @remarks If the event name was already fired, it's immediately resolved with the args from the first event.
     */
    public waitForFirst(eventName: string): Promise<{}> {
        return Promise.resolve({});
    }
}
