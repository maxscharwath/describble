import {type EventHandler, type PointerEventHandler, type RefObject, type SyntheticEvent, useEffect} from 'react';

type Elements = Element | Document | Window;

export const useEvent = <E extends Elements, H extends EventHandler<any>> (ref: RefObject<E>, event: string, handler: H | undefined) => {
	useEffect(() => {
		const element = ref.current;
		if (!handler || !element) {
			return;
		}

		element.addEventListener(event, handler as unknown as EventListener);

		return () => {
			element.removeEventListener(event, handler as unknown as EventListener);
		};
	}, [ref, event, handler]);
};

export const useEvents = <
	E extends Elements,
	H extends Partial<Record<string, EventHandler<SyntheticEvent<E>>>>,
>(
	ref: RefObject<E>,
	events: H,
) => {
	for (const [event, handler] of Object.entries(events)) {
		useEvent(ref, event, handler);
	}
};

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
