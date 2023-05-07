# Managers

The `managers` folder contains a collection of manager classes that are responsible for handling specific aspects of the whiteboard application. Managers help improve code organization and maintainability by encapsulating specific tasks and responsibilities related to the application's functionality.

By using managers, the application can easily delegate tasks to the appropriate manager class, keeping the code organized and readable. This approach helps keep the main `WhiteboardApp` class cleaner by offloading specific responsibilities to the manager classes.

## Key Managers

Below are the primary manager classes included in the `managers` folder:

1. **KeyboardEventManager**: This manager is responsible for handling keyboard events, such as key presses and key releases. It listens for these events and delegates the handling to the current tool in use, if applicable. By centralizing keyboard event handling in this manager, it becomes easier to manage and update keyboard interactions throughout the application.

2. **PointerEventManager**: This manager handles pointer events, such as touch or mouse interactions. Similar to the `KeyboardEventManager`, it delegates the event handling to the current tool in use. Centralizing pointer event handling in this manager makes it more maintainable and organized.

3. **ActivityManager**: This manager is responsible for managing the lifecycle of activities in the application. It provides methods for starting, completing, aborting, and updating activities. It also maintains a reference to the current activity, ensuring that only one activity can be active at a time. The `ActivityManager` helps to encapsulate the logic for controlling and managing user interactions and activities in the application.

4. **AssetManager**: This manager is responsible for managing assets used within the whiteboard application. It provides methods for loading, caching, and retrieving assets such as images or other media. By centralizing asset management in this manager, it simplifies the process of loading and using assets throughout the application.

## Using Managers in the Application

Managers are typically instantiated within the `WhiteboardApp` class and interact with other parts of the application through the `app` instance provided during their construction. This allows the managers to access the application state and other necessary resources while minimizing coupling between components.

For example, the `KeyboardEventManager` listens for keyboard events and calls the appropriate method on the currently active tool:

```ts
this.app.currentTool?.onKeyDown?.(event);
```

Similarly, the `ActivityManager` interacts with the `WhiteboardApp` instance to update the application state based on the current activity lifecycle:

```ts
this.app.patchState(patch, `activity_start_${this.activity.type}`);
```

In summary, managers play a crucial role in organizing and maintaining the whiteboard application's various functionalities. They help to encapsulate specific responsibilities and tasks, making it easier to understand and manage the application's codebase.
