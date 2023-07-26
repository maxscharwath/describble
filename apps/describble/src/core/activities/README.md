# Activities

The `activities` folder contains a collection of activity classes that represent various interactions and operations that can be performed on the whiteboard application. Activities handle different phases of user interactions, such as starting an operation, updating it while in progress, and completing or aborting it.

## Activity Lifecycle

Each activity class has a specific lifecycle, which consists of the following methods:

1. **Constructor**: The constructor is called when the activity is first instantiated. It initializes the activity and sets up any required properties or data. It typically takes a `WhiteboardApp` instance as a parameter to allow the activity to interact with the application state.

2. **start**: The `start` method is called when the activity begins. It initializes the state related to the activity.

3. **update**: The `update` method is called repeatedly while the activity is in progress. It is responsible for updating the state of the activity based on the user's input or other changes in the application.

4. **complete**: The `complete` method is called when the activity is successfully completed. It finalizes the activity, It's here we can add features like undo/redo functionality.

5. **abort**: The `abort` method is called when the activity is canceled or interrupted. It is responsible for reverting any changes made during the activity.

In summary, activities play a crucial role in managing user interactions and controlling the whiteboard application's state. The activity lifecycle methods and their return types help determine how the state of the whiteboard should be updated and provide a mechanism for implementing undo/redo functionality.
