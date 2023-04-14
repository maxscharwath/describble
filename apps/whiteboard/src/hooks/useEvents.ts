import {type EventHandler, type RefObject, type SyntheticEvent, useEffect} from 'react';

export type EventElement = Element | Document | Window;

export const useEvent = <TEvent extends EventElement, THandler extends EventHandler<any>> (ref: RefObject<TEvent>, event: string, handler: THandler | undefined) => {
	useEffect(() => {
		const element = ref.current;
		if (!handler || !element) {
			return;
		}

		element.addEventListener(event, handler);

		return () => {
			element.removeEventListener(event, handler);
		};
	}, [ref, event, handler]);
};

type EventHandlerWithType<T extends Event> = (event: T) => void;

type EventHandlers<T, E extends EventElement> = {
	[K in keyof T]: EventHandlerWithType<T[K] extends EventHandlerWithType<infer U> ? U : never> | undefined;
};

export const useEvents = <
	TEvent extends EventElement,
	THandlers extends EventHandlers<THandlers, TEvent>,
> (
	ref: RefObject<TEvent>,
	events: THandlers,
) => {
	for (const [event, handler] of Object.entries(events)) {
		useEvent(ref, event, handler as EventHandler<SyntheticEvent<TEvent>>);
	}
};

