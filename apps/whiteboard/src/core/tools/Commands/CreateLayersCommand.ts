import {type WhiteboardApp, type WhiteboardCommand} from '../../WhiteboardApp';
import {type Layer} from '../../layers';
import {type Patch} from '../../types';

export function createLayersCommand(
	app: WhiteboardApp,
	layers: Layer[],
): WhiteboardCommand {
	const beforeShapes: Record<string, Patch<Layer> | undefined> = {};
	const afterShapes: Record<string, Patch<Layer> | undefined> = {};

	layers.forEach(shape => {
		beforeShapes[shape.id] = undefined;
		afterShapes[shape.id] = shape;
	});

	return {
		id: 'create-layers',
		before: {
			document: {
				layers: beforeShapes,
			},
		},
		after: {
			document: {
				layers: afterShapes,
			},
		},
	};
}
