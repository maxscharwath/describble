import {useWhiteboardContext} from '../WhiteboardContext';
import React, {useMemo, useState} from 'react';
import {Selection, type SelectionBox} from '../Selection';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {computePointerPosition, invertPointerPosition} from './Tools';

/**
 * This tool allows the user to select a region of the canvas.
 * @constructor
 */
export const SelectedTool: React.FC = () => {
	const {canvasRef} = useWhiteboardContext();
	const {camera} = useWhiteboardContext();
	const [selection, setSelection] = useState<SelectionBox | null>(null);

	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			const point = computePointerPosition(event, camera);
			setSelection({
				p1: point,
				p2: point,
			});
		},
		onPointerUp() {
			setSelection(null);
		},
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			const point = computePointerPosition(event, camera);
			if (selection) {
				setSelection({
					...selection,
					p2: point,
				});
			}
		},
	});

	const remappedSelection = useMemo(() => {
		if (selection) {
			const {p1, p2} = selection;
			return {
				p1: invertPointerPosition(p1, camera),
				p2: invertPointerPosition(p2, camera),
			};
		}
	}, [selection, camera]);

	return remappedSelection ? <Selection box={remappedSelection}/> : null;
};
