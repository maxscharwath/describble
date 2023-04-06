import {type EventHandler, type PointerEventHandler, type RefObject, useEffect} from 'react';

export const useEvent = <E extends EventTarget, T extends EventHandler<any>> (ref: RefObject<E>, event: string, handler: T | undefined) => {
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

export const usePointerEvents = <T extends EventTarget> (
	ref: RefObject<T>,
	events: {
		onPointerDown?: PointerEventHandler<T>;
		onPointerMove?: PointerEventHandler<T>;
		onPointerUp?: PointerEventHandler<T>;
	},
) => {
	useEvent(ref, 'pointerdown', events.onPointerDown);
	useEvent(ref, 'pointermove', events.onPointerMove);
	useEvent(ref, 'pointerup', events.onPointerUp);
};
