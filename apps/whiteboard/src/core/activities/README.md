# Activities

The `activities` folder contains a collection of activity classes that represent various interactions and operations that can be performed on the whiteboard application. Activities handle different phases of user interactions, such as starting an operation, updating it while in progress, and completing or aborting it.

## Activity Lifecycle

Each activity class has a specific lifecycle, which consists of the following methods:

1. **Constructor**: The constructor is called when the activity is first instantiated. It initializes the activity and sets up any required properties or data. It typically takes a `WhiteboardApp` instance as a parameter to allow the activity to interact with the application state.

2. **start**: The `start` method is called when the activity begins. It initializes the state related to the activity and can return a `WhiteboardPatch`, which is a set of partial changes to be applied to the whiteboard state. In some cases, it may return `void` if no state changes are required.

3. **update**: The `update` method is called repeatedly while the activity is in progress. It is responsible for updating the state of the activity based on the user's input or other changes in the application. Similar to `start`, it can return a `WhiteboardPatch` or `void`.

4. **complete**: The `complete` method is called when the activity is successfully completed. It finalizes the activity and returns either a `WhiteboardPatch`, a `WhiteboardCommand`, or `void`. The `WhiteboardCommand` return type is used when the activity requires undo/redo functionality.

5. **abort**: The `abort` method is called when the activity is canceled or interrupted. It is responsible for reverting any changes made during the activity and returning the whiteboard state to its previous state. It can return a `WhiteboardPatch` or `void`.

## Return Types

The activity methods can return different types: `WhiteboardPatch`, `WhiteboardCommand`, or `void`. Each of these return types serves a specific purpose in updating the state of the whiteboard or controlling the flow of the application.

1. **WhiteboardPatch**: Represents partial changes to be applied to the whiteboard state. When a method returns a `WhiteboardPatch`, it provides a set of changes that should be merged into the current state of the whiteboard.

2. **WhiteboardCommand**: Represents a pair of state changes used for undo/redo functionality. The `before` property represents the state before the action, and the `after` property represents the state after the action. This allows the application to easily switch between the two states when performing undo/redo operations.

3. **void**: Indicates that the method does not provide any state changes. In some cases, a method might not need to return anything, as the changes to the whiteboard state are already handled elsewhere in the code.

In summary, activities play a crucial role in managing user interactions and controlling the whiteboard application's state. The activity lifecycle methods and their return types help determine how the state of the whiteboard should be updated and provide a mechanism for implementing undo/redo functionality.
