import {type WhiteboardApp, type WhiteboardCommand} from '../WhiteboardApp';
import {type Patch} from '../types';
import {type Layer} from '../layers';

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
			document: {
				layers: beforeLayers,
			},
		},
		after: {
			document: {
				layers: afterLayers,
			},
		},
	};
}
