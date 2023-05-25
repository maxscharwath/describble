import React from 'react';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {type PointerEventHandler} from '~core/types';

export type HandleEventHandlers = (handle: number) => {
	onPointerMove: PointerEventHandler;
	onPointerDown: PointerEventHandler;
	onPointerUp: PointerEventHandler;
};

export const useHandleEvents = (): HandleEventHandlers => {
	const {pointerEvent} = useWhiteboard();

	return React.useCallback(handle => ({
		onPointerDown(e: React.PointerEvent) {
			e.currentTarget.setPointerCapture(e.pointerId);
			pointerEvent.onHandleDown(e, handle);
			pointerEvent.onPointerDown(e, 'handle');
		},
		onPointerMove(e: React.PointerEvent) {
			pointerEvent.onHandleMove(e, handle);
			pointerEvent.onPointerMove(e, 'handle');
		},
		onPointerUp(e: React.PointerEvent) {
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget?.releasePointerCapture(e.pointerId);
			}

			pointerEvent.onHandleUp(e, handle);
			pointerEvent.onPointerUp(e, 'handle');
		},
	}), [pointerEvent]);
};
