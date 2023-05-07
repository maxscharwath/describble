# State Manager

The `StateManager` class provides a state management solution for the whiteboard application. It uses Zustand and IndexedDB to manage the application state, handle state mutations, and persist the state across sessions. By utilizing `StateManager`, the application can maintain a clean and organized codebase, making development and maintenance easier.

## Key Features

The `StateManager` offers several important features:

1. **State Management**: The `StateManager` is responsible for managing the application state using Zustand. It provides methods for updating (patching) the state, applying commands, resetting the state to initial values, and forcing updates.

2. **State Persistence**: The `StateManager` uses IndexedDB to persist the application state across sessions, ensuring that user data is not lost when the application is closed or refreshed.

3. **State Versioning**: The `StateManager` allows for state migration when updates are made to the application. This ensures that previous versions of the application state can still be used and do not cause issues when new features or changes are introduced.

4. **State History**: The `StateManager` maintains a history of state commands, allowing for undo and redo functionality. This helps to provide a better user experience by allowing users to revert changes made to the application state.

## Implementation Details

The `StateManager` uses several methods to manage the state and its updates:

1. **applyPatch**: This method is used for applying a patch (partial update) to the state without persisting it. It takes a patch object and an optional ID for the patch.

2. **setState**: This method is used for applying a command to the state and persisting the changes. It takes a command object and an optional ID for the command.

3. **persist**: This method is responsible for persisting the state to IndexedDB. It takes a patch object and an optional ID for the patch.

4. **migrate**: This method is used to migrate state from a previous version of the application. It takes the previous state object and returns the new, migrated state object.

5. **cleanup**: This method is called before updating the state. It allows for any necessary clean up or state validation before the update is applied. It takes the nextState, prevState, patch, and an optional ID.

6. **undo** and **redo**: These methods provide the ability to undo and redo previous state updates using the command stack.

## Using the State Manager

The `StateManager` is typically instantiated within the `WhiteboardApp` class and is used to manage the application state. The state is accessed through the various public methods provided by the `StateManager`, such as `patchState`, `setState`, `undo`, and `redo`.

Here's an example of how the state manager is used in the `WhiteboardApp` class:

```ts
const stateManager = new StateManager<AppState>(initialState, id);

stateManager.patchState(patch, 'activity_start');
```

In summary, the `StateManager` is a critical component for managing the state of the whiteboard application. It provides an organized and efficient way to handle state updates, persist the state, maintain state history, and migrate state across application versions.
