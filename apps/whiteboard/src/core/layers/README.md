# Layers Folder

The `layers` folder contains various layer classes and utilities that represent different types of objects that can be placed and manipulated on the whiteboard application. Layers can be simple shapes like circles and rectangles or more complex objects like images and paths. Each layer type has its own set of properties and methods for working with them.

## BaseLayer and BaseLayerUtil

The `BaseLayer` interface is the foundation for all layer types. It includes common properties such as `id`, `name`, `type`, `visible`, `zIndex`, and `style`. Each layer type extends this interface to include its specific properties.

The `BaseLayerUtil` abstract class provides utility methods for working with layers. It has methods for creating, resizing, and getting the bounds of a layer. Each layer type has a corresponding `LayerUtil` class that extends the `BaseLayerUtil` class and implements its abstract methods.

## LayerUtils

The `LayerUtils` type is a collection of utility classes for different layer types, organized as a Record keyed by the layer type string. It allows you to easily find the appropriate utility class for a given layer type.

The `createLayerUtils` function is used to create a `LayerUtils` instance from an array of `BaseLayerUtil` instances, which are then organized by their type. This enables you to work with different layer types in a consistent and organized manner.

## index.ts and Adding New Layers

The `index.ts` file exports several utility instances for each layer type, as well as a `layerUtils` object and helper functions for working with layers. When creating a new layer type, you need to update the `index.ts` file to include the new layer utility in the exported `layerUtils` object. This ensures that the whiteboard core can utilize the new layer type.

To add a new layer type, follow these steps:

1. Create a new utility class that extends `BaseLayerUtil` and implements its abstract methods.
2. Update the `index.ts` file to import the new utility class and create a new instance of it.
3. Add the new utility instance to the `createLayerUtils` function call in `index.ts`.

By following these steps, you ensure that the whiteboard core is aware of the new layer type and can utilize it as part of its functionality.
