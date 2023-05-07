# Commands

The `commands` folder contains various command files that represent different actions performed on the whiteboard application. Commands are used to manipulate the whiteboard state in a consistent and structured way, which makes it easier to manage undo and redo actions.

Each command file exports a function that creates a `WhiteboardCommand` object. This object contains two key properties: `before` and `after`. These properties store the state of the whiteboard before and after the command is executed, allowing you to easily undo or redo the command by reverting to the previous state.

## How to Use Commands

To use a command, you need to import its corresponding function and execute it by passing the required parameters. After obtaining the `WhiteboardCommand` object, you can use it to modify the whiteboard state accordingly.

Here's an example of how to use the `CreateLayersCommand`:

```ts
import { createLayersCommand } from '~core/commands/CreateLayersCommand';
import { someWhiteboardAppInstance, someLayers } from '...';

const command = createLayersCommand(someWhiteboardAppInstance, someLayers);
someWhiteboardAppInstance.setState(command);
```

## Adding New Commands

To create a new command, follow these steps:

1. Create a new file in the `commands` folder.
2. Define a command function that takes the necessary parameters and returns a `WhiteboardCommand` object containing the `before` and `after` states.
3. Export the command function from the new file.
4. Import the command function where you need it and use it to generate a `WhiteboardCommand` object.

By using commands to manipulate the whiteboard state, you can maintain a consistent structure and easily implement undo/redo functionality.
