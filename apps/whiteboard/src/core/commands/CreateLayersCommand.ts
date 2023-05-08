import {type WhiteboardApp, type WhiteboardCommand} from '~core/WhiteboardApp';
import {type Layer} from '~core/layers';
import {type Patch} from '~core/types';

export function createLayersCommand(
	app: WhiteboardApp,
	layers: Layer[],
): WhiteboardCommand {
	const beforeLayers: Record<string, Patch<Layer> | undefined> = {};
	const afterLayers: Record<string, Patch<Layer> | undefined> = {};

	layers.forEach(layer => {
		beforeLayers[layer.id] = undefined;
		afterLayers[layer.id] = layer;
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
