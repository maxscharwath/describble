import {useWhiteboard} from '../useWhiteboard';
import React from 'react';

export function usePointerEvents() {
	const {pointerEvent} = useWhiteboard();

	return React.useMemo(() => ({
		onPointerDown(e: React.PointerEvent) {
			e.currentTarget.setPointerCapture(e.pointerId);
			pointerEvent.onPointerDown(e);
		},
		onPointerMove(e: React.PointerEvent) {
			pointerEvent.onPointerMove(e);
		},
		onPointerUp(e: React.PointerEvent) {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget?.releasePointerCapture(e.pointerId);
			}

			pointerEvent.onPointerUp(e);
		},
	}), [pointerEvent]);
}
