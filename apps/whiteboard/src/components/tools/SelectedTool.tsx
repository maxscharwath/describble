import {useWhiteboardContext} from '../WhiteboardContext';
import React, {useMemo, useState} from 'react';
import {Selection} from '../Selection';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {type Bounds} from '../../utils/types';
import {boundsToClientCoords, mouseEventToCanvasPoint} from '../../utils/coordinateUtils';

/**
 * This tool allows the user to select a region of the canvas.
 * @constructor
 */
export const SelectedTool: React.FC = () => {
	const {canvasRef} = useWhiteboardContext();
	const {camera} = useWhiteboardContext();
	const [selection, setSelection] = useState<Bounds | null>(null);

	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			if (event.buttons !== 1) {
				return;
			}

			const point = mouseEventToCanvasPoint(event, camera);
			setSelection({
				...point,
				width: 0,
				height: 0,
			});
		},
		onPointerUp() {
			setSelection(null);
		},
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			const point = mouseEventToCanvasPoint(event, camera);
			if (selection) {
				setSelection({
					...selection,
					width: point.x - selection.x,
					height: point.y - selection.y,
				});
			}
		},
	});

	const remappedSelection = useMemo(() => {
		if (selection) {
			return boundsToClientCoords(selection, camera);
		}
	}, [selection, camera]);

	return remappedSelection ? <Selection bounds={remappedSelection}/> : null;
};
