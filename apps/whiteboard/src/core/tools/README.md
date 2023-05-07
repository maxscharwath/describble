# Tools

The Tools folder contains the logic for various tools in the Whiteboard application. Each tool is represented by a class that extends the `BaseTool` class, and they handle user interactions specific to their functionality. Examples of tools are `RectangleTool`, `CircleTool`, `ImageTool`, `PathTool`, `SelectTool`, and `MoveTool`. Tools can also make use of activities to handle more complex behavior.

## Tool Lifecycle

Each tool has its own set of event handlers for user interactions, such as `onPointerDown`, `onPointerMove`, `onPointerUp`, and `onPointerCancel`. These event handlers are responsible for the tool's behavior during its lifecycle. Additionally, tools have the following lifecycle methods:

- `onActivate`: This method is called when the tool becomes active. It can be used to set up any necessary state or configurations for the tool.

- `onDeactivate`: This method is called when the tool is deactivated, allowing for any necessary cleanup or resetting of the tool's state.

- `onAbort`: This method is called when the tool should be aborted, typically in response to the user pressing the Escape key. It should handle any necessary cleanup and revert the tool to its initial state.

The `status` property of the tool is used to represent the tool's current state in its lifecycle. The `Status` enum defines the common statuses, such as `Idle`, `Creating`, and `Dragging`. Tools can also have custom statuses, if needed.

## Utility Functions

- `createTools`: This function takes an array of tool instances as input and returns an object with keys representing the tool types and values as the corresponding tool instances. This allows for easier access and management of tools within the application.

- `ToolsKey`: This type alias extracts the tool keys from the Tools object created by the `createTools` function.

- `ToolsValue`: This type alias extracts the corresponding tool instances from the Tools object created by the `createTools` function.

- `makeGetTools`: This function takes a Tools object as input and returns a function that accepts a tool key and returns the corresponding tool instance.

## Usage

To use a tool, create an instance of the desired tool class and pass it to the `createTools` function. This will generate a Tools object that can be used to manage the tools within the application. The `makeGetTools` function can be used to create a function that retrieves the tool instance for a specific tool key.

Example:

```ts
import {RectangleTool, CircleTool, ImageTool, PathTool, SelectTool, MoveTool} from '~core/tools';

const tools = createTools(
  new RectangleTool(this),
  new CircleTool(this),
  new ImageTool(this),
  new PathTool(this),
  new SelectTool(this),
  new MoveTool(this),
);

```
TThe tools object can then be used to manage and access the individual tool instances. To change the active tool within the application, simply use the setTool method provided by the WhiteboardApp class.

Example:

```ts
// Set the current tool to the RectangleTool
whiteboardApp.setTool('rectangle');
```
By understanding and utilizing the tools, their lifecycle methods, and the relationship between tools and activities, you can create a powerful and interactive Whiteboard application.
