import {type WhiteboardApp, type WhiteboardCommand} from '../WhiteboardApp';
import {type Layer} from '../layers';
import {type Patch} from '../types';

export function createLayersCommand(
	app: WhiteboardApp,
	layers: Layer[],
): WhiteboardCommand {
	const beforeLayers: Record<string, Patch<Layer> | undefined> = {};
	const afterLayers: Record<string, Patch<Layer> | undefined> = {};

	layers.forEach(shape => {
		beforeLayers[shape.id] = undefined;
		afterLayers[shape.id] = shape;
	});

	return {
		id: 'create-layers',
		before: {
			documents: {
				[app.currentDocumentId]: {
					layers: beforeLayers,
				},
			},
		},
		after: {
			documents: {
				[app.currentDocumentId]: {
					layers: afterLayers,
				},
			},
		},
	};
}
