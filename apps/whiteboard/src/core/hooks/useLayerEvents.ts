import React from 'react';
import {useWhiteboard} from '~core/hooks';

export function useLayerEvents(layerId: string) {
	const {pointerEvent} = useWhiteboard();

	return React.useMemo(() => ({
		onPointerDown(e: React.PointerEvent) {
			e.currentTarget.setPointerCapture(e.pointerId);
			pointerEvent.onLayerDown(e, layerId);
			pointerEvent.onPointerDown(e, layerId);
		},
		onPointerMove(e: React.PointerEvent) {
			pointerEvent.onLayerMove(e, layerId);
			pointerEvent.onPointerMove(e, layerId);
		},
		onPointerUp(e: React.PointerEvent) {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget?.releasePointerCapture(e.pointerId);
			}

			pointerEvent.onLayerUp(e, layerId);
			pointerEvent.onPointerUp(e, layerId);
		},
	}), [pointerEvent, layerId]);
}
