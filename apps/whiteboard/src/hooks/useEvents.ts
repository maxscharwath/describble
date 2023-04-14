import {type EventHandler, type RefObject, type SyntheticEvent, useEffect} from 'react';

export type Elements = Element | Document | Window;

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

type EventHandlerWithType<T extends Event> = (event: T) => void;

type EventHandlers<T, E extends Elements> = {
	[K in keyof T]: EventHandlerWithType<T[K] extends EventHandlerWithType<infer U> ? U : never> | undefined;
};

export const useEvents = <
	E extends Elements,
	H extends EventHandlers<H, E>,
>(
	ref: RefObject<E>,
	events: H,
) => {
	for (const [event, handler] of Object.entries(events)) {
		useEvent(ref, event, handler as EventHandler<SyntheticEvent<E>>);
	}
};

