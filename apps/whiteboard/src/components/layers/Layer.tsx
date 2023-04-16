import React, {memo} from 'react';
import {PathFactory} from './factory/PathFactory';
import {RectangleFactory} from './factory/RectangleFactory';
import {CircleFactory} from './factory/CircleFactory';
import {ImageFactory} from './factory/ImageFactory';
import {LayerFactoryManager, type LayerFactoryManagerData} from './LayerFactoryManager';
import {type LayerFactory} from './factory/LayerFactory';
import {type ZodSchema} from 'zod';

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
export const Layer = memo(({layer, ...props}: {layer: LayerData} & React.SVGProps<SVGElement>) => {
	const factory = Layers.getFactory(layer.type) as LayerFactory<ZodSchema<LayerData>> | undefined;
	if (!factory) {
		console.error(`Unknown layer type: ${layer.type}`);
		return null;
	}

	const parsed = factory.schema.safeParse(layer);

	if (parsed.success) {
		return (
			<factory.component data={parsed.data} {...props as React.SVGProps<never>} />
		);
	}

	return null;
});
Layer.displayName = 'Layer';

export const PreviewLayer = memo(({layer, ...props}: {layer: LayerData} & React.SVGProps<SVGSVGElement>) => {
	const factory = Layers.getFactory(layer.type) as LayerFactory<ZodSchema<LayerData>> | undefined;
	if (!factory) {
		return null;
	}

	const parsed = factory.schema.safeParse(layer);

	if (parsed.success) {
		const {x, y, width, height} = factory.getBounds(parsed.data);
		return (
			<svg {...props} viewBox={`${x} ${y} ${width} ${height}`}>
				<factory.component data={parsed.data} />
			</svg>
		);
	}

	return null;
});
PreviewLayer.displayName = 'PreviewLayer';
