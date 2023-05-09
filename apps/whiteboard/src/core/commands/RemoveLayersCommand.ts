import {type WhiteboardApp, type WhiteboardCommand} from '~core/WhiteboardApp';
import {type Patch} from '~core/types';
import {type Layer} from '~core/layers';

export function removeLayersCommand(
	app: WhiteboardApp,
	layerIds: string[],
): WhiteboardCommand {
	const beforeLayers: Record<string, Patch<Layer> | undefined> = {};
	const afterLayers: Record<string, Patch<Layer> | undefined> = {};

	layerIds.forEach(layerId => {
		beforeLayers[layerId] = app.getLayer(layerId);
		afterLayers[layerId] = undefined;
	});

	return {
		id: 'create-layers',
		before: {
			documents: {
				[app.currentDocumentId]: {
					layers: beforeLayers,
				},
			},
			appState: {
				selectedLayers: app.selectedLayers,
			},
		},
		after: {
			documents: {
				[app.currentDocumentId]: {
					layers: afterLayers,
				},
			},
			appState: {
				selectedLayers: app.selectedLayers.filter(id => !layerIds.includes(id)),
			},
		},
	};
}
