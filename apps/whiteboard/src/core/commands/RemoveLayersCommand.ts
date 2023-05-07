import {type WhiteboardApp, type WhiteboardCommand} from '~core/WhiteboardApp';
import {type Patch} from '~core/types';
import {type Layer} from '~core/layers';

export function removeLayersCommand(
	app: WhiteboardApp,
	layers: Layer[],
): WhiteboardCommand {
	const beforeLayers: Record<string, Patch<Layer> | undefined> = {};
	const afterLayers: Record<string, Patch<Layer> | undefined> = {};

	layers.forEach(layer => {
		beforeLayers[layer.id] = layer;
		afterLayers[layer.id] = undefined;
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
