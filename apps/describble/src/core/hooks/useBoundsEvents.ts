import React from 'react';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {BoundsHandle, type PointerEventHandler} from '~core/types';

export type BoundsEventHandlers = (handle?: BoundsHandle) => {
	onPointerMove: PointerEventHandler;
	onPointerDown: PointerEventHandler;
	onPointerUp: PointerEventHandler;
};

export const useBoundsEvents = (): BoundsEventHandlers => {
	const {pointerEvent} = useWhiteboard();

	return React.useCallback((handle = BoundsHandle.NONE) => ({
		onPointerDown(e: React.PointerEvent) {
			e.currentTarget.setPointerCapture(e.pointerId);
			pointerEvent.onBoundsDown(e, handle);
			pointerEvent.onPointerDown(e, 'bounds');
		},
		onPointerMove(e: React.PointerEvent) {
			pointerEvent.onBoundsMove(e, handle);
			pointerEvent.onPointerMove(e, 'bounds');
		},
		onPointerUp(e: React.PointerEvent) {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget?.releasePointerCapture(e.pointerId);
			}

			pointerEvent.onBoundsUp(e, handle);
			pointerEvent.onPointerUp(e, 'bounds');
		},
	}), [pointerEvent]);
};
