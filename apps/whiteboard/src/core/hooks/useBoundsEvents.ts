import React from 'react';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {type BoundsEventHandler, BoundsHandle, type PointerEventHandler} from '~core/types';

export type BoundsEventHandlers = {
	onPointerMove: BoundsEventHandler;
	onPointerDown: BoundsEventHandler;
	onPointerUp: BoundsEventHandler;
};

export function useBoundsEvents(): BoundsEventHandlers {
	const {pointerEvent} = useWhiteboard();

	return React.useMemo(() => ({
		onPointerDown(e: React.PointerEvent, handle: BoundsHandle) {
			e.currentTarget.setPointerCapture(e.pointerId);
			pointerEvent.onBoundsDown(e, handle);
			pointerEvent.onPointerDown(e, 'bounds');
		},
		onPointerMove(e: React.PointerEvent, handle: BoundsHandle) {
			pointerEvent.onBoundsMove(e, handle);
			pointerEvent.onPointerMove(e, 'bounds');
		},
		onPointerUp(e: React.PointerEvent, handle: BoundsHandle) {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget?.releasePointerCapture(e.pointerId);
			}

			pointerEvent.onBoundsUp(e, handle);
			pointerEvent.onPointerUp(e, 'bounds');
		},
	}), [pointerEvent]);
}

export function useBoundsHandleEvents(events: BoundsEventHandlers, handle = BoundsHandle.NONE): {
	onPointerMove: PointerEventHandler;
	onPointerDown: PointerEventHandler;
	onPointerUp: PointerEventHandler;
} {
	return React.useMemo(() => ({
		onPointerDown(e: React.PointerEvent) {
			events.onPointerDown(e, handle);
		},
		onPointerMove(e: React.PointerEvent) {
			events.onPointerMove(e, handle);
		},
		onPointerUp(e: React.PointerEvent) {
			events.onPointerUp(e, handle);
		},
	}), [events, handle]);
}
