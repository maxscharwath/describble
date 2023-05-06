import {useWhiteboard} from './useWhiteboard';
import React from 'react';

export function useCanvasEvents() {
	const {pointerEvent} = useWhiteboard();

	return React.useMemo(() => ({
		onPointerDown(e: React.PointerEvent) {
			e.currentTarget.setPointerCapture(e.pointerId);
			pointerEvent.onCanvasDown(e);
			pointerEvent.onPointerDown(e, 'canvas');
		},
		onPointerMove(e: React.PointerEvent) {
			pointerEvent.onCanvasMove(e);
			pointerEvent.onPointerMove(e, 'canvas');
		},
		onPointerUp(e: React.PointerEvent) {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget?.releasePointerCapture(e.pointerId);
			}

			pointerEvent.onCanvasUp(e);
			pointerEvent.onPointerUp(e, 'canvas');
		},
	}), [pointerEvent]);
}
