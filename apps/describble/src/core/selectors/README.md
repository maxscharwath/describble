# Selectors

The `selectors` folder contains a collection of selector functions used to extract specific parts of the whiteboard application state. Selectors provide an efficient and organized way to access state data and improve the performance of the application when using Zustand's `useStore()` hook.

Selectors are simple functions that take the application state as input and return a subset of the state. They allow for more precise and efficient state updates by only rerendering components when the data they depend on has changed.

## Using Selectors

Selectors are typically used with Zustand's `useStore()` hook to subscribe to specific data within the application state. By using selectors, the components will only rerender when the extracted data changes, improving rendering performance.

Here's an example of how to use a selector with Zustand's `useStore()`:

```ts
const camera = app.useStore(cameraSelector, shallow);
const selection = app.useStore(selectionSelector, shallow);
```

In this example, the `camera` and `selection` variables are extracted from the application state using the `cameraSelector` and `selectionSelector` selectors. The `shallow` parameter is used for a shallow comparison to ensure that the component will only rerender when these specific parts of the state change.

In summary, the `selectors` folder provides an organized and efficient way to access specific parts of the whiteboard application state. By using selectors with Zustand's `useStore()` hook, rendering performance can be improved, leading to a better user experience and smoother application performance.
