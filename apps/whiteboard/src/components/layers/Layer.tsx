import type React from 'react';
import {memo} from 'react';
import {PathFactory} from './factory/PathFactory';
import {RectangleFactory} from './factory/RectangleFactory';
import {CircleFactory} from './factory/CircleFactory';
import {ImageFactory} from './factory/ImageFactory';
import {LayerFactoryManager, type LayerFactoryManagerData} from './LayerFactoryManager';
import {type LayerFactory} from './factory/LayerFactory';

/**
 * List of all layer factories available
 */
export const Layers = new LayerFactoryManager(
	new PathFactory(),
	new RectangleFactory(),
	new CircleFactory(),
	new ImageFactory(),
);

/**
 * The schema for all layer data
 */
export type LayerData = LayerFactoryManagerData<typeof Layers>;

/**
 * A generic layer component that uses a factory to create the appropriate layer component
 */
export const Layer = memo((props: LayerData) => {
	const factory = Layers.getFactory(props.type) as LayerFactory | undefined;
	if (!factory) {
		console.error(`Unknown layer type: ${props.type}`);
		return null;
	}

	const parsed = factory.schema.safeParse(props);

	if (parsed.success) {
		return factory.createComponent(parsed.data);
	}

	return null;
});
Layer.displayName = 'Layer';
