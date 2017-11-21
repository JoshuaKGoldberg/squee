# _Squee!_

💨✨ _**S**uper **Qu**ick **E**vent **E**mitters!_ ✨💨

Squee lets you create a hub for triggerable application events your components need to fire and/or listen to.
Event emitters provide both traditional Node-based `.on()` and Promise-based `waitFor` hooks.

_No_ dependencies. _Tiny_ size. _Easy_ breezy.

## Usage

When in Node or bundled environments like Browserify or Webpack, import from `"squee"` directly:

```javascript
import { EventEmitter } from "squee";

const emitter = new EventEmitter();

emitter.on("noise", sound => console.log(`${sound}!`));
emitter.emit("noise", "MOO"); // "MOO!"
```

Squee also ships with `dist/(amd|system)-(es3|es2015).js` files.
So, to use a version that works in all browsers with RequireJS, use `dist/amd-es3.js`.

### Examples

Emitting an event every seconds for ten seconds:

```javascript
import { EventEmitter } from "squee";

const emitter = new EventEmitter();
const listener = sound => console.log(`${sound}!`);

emitter.on("noise", listener);

setInterval(
    () => emitter.emit("noise", "MOO"),
    1000);

setTimeout(
    () => emitter.off("noise", listener),
    10000);
```

Waiting for events with `Promise`s:

```javascript
import { EventEmitter } from "squee";

const emitter = new EventEmitter();

emitter.emit("noise", "Warm it up");

emitter.waitFor("noise")
    .then(sound => console.log(`Later: ${sound}!`));

emitter.emit("noise", "All nine thousand taste buds");

emitter.waitForFirst("noise")
    .then(sound => console.log(`First: ${sound}!`));
```

```text
Later: All nine thousand taste buds!
First: Warm it up!
```

#### Usage with TypeScript

Good news: Squee is written in TypeScript!
You'll never have to worry about `@types` mismatches here!

`EventEmitter`s may optionally specify a templated interface or type mapping event name keys to their expected argument type.
Very snazzy.

```typescript
import { EventEmitter } from "squee";

interface IEventEmissions {
    noise: string;
    taste: number;
}

const emitter = new EventEmitter<IEventEmissions>();

emitter.emit("noise", "MOO");
emitter.emit("taste", 9000);

// These will give compiler errors:
emitter.emit("unknown");
emitter.emit("noise", true);
```

Note that until TypeScript supports variadic kinds ([issue here](https://github.com/Microsoft/TypeScript/issues/5453)), only one type is supported for all arguments.
If you need complex objects it's probably semantically more clear to pass an object with multiple fields anyway.

## API

#### `on`

Binds an event listener to an event name.

Parameters:

* `eventName: string`
* `listener: (...args: any[]) => void`

#### `off`

Removes an event listener from an event name.
If no listener is provided, it removes _all_ listeners for that event name.

Parameters:

* `eventName: string`
* `listener?: (...args: any[]) => void`

Throws an error if the listener wasn't added for that event name.

#### `emit`

Emits an event, along with any amount of additional information.

Parameters:

* `eventName: string`
* `...args: any[]`

#### `waitFor`

Creates a `Promise` to be resolved the next time an event is fired.
The `Promise` is resolved with the `args` passed with the event.

Parameters:

* `eventName: string`

#### `waitForFirst`

Creates a `Promise` to be resolved once an event has fired.
If the event was already fired, it resolves immediately.
The `Promise` is resolved with the `args` passed with the _first_ event of that name.

Parameters:

* `eventName: string`

## Comparison with `event-emitter`

`event-emitter` is a very popular package used in many other npm packages.
However, it has two dependencies (`es5-ext` and `d`), the size of which are concerning for performance-critical applications.
