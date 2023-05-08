import {type WhiteboardApp, type WhiteboardCommand} from '~core/WhiteboardApp';
import {type Layer} from '~core/layers';
import {type Patch} from '~core/types';

export function patchLayersCommand(
	app: WhiteboardApp,
	layerIds: string[],
	patch: Patch<Layer>,
): WhiteboardCommand {
	const beforeLayers: Record<string, Patch<Layer> | undefined> = {};
	const afterLayers: Record<string, Patch<Layer> | undefined> = {};

	layerIds.forEach(layerId => {
		beforeLayers[layerId] = app.getLayer(layerId);
		afterLayers[layerId] = patch;
	});

	return {
		id: 'patch-layers',
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
