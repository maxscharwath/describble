import {type PointerEventHandler, type RefObject} from 'react';
import {type Elements, useEvents} from './useEvents';

export const usePointerEvents = <E extends Elements> (
	ref: RefObject<E>,
	events: {
		onPointerDown?: PointerEventHandler<E>;
		onPointerMove?: PointerEventHandler<E>;
		onPointerUp?: PointerEventHandler<E>;
	},
) => {
	useEvents(ref, {
		pointerdown: events.onPointerDown,
		pointermove: events.onPointerMove,
		pointerup: events.onPointerUp,
	});
};
