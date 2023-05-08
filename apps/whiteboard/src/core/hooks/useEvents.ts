import {type EventHandler, type RefObject, useEffect} from 'react';

export type EventElement = Element | Document | Window;

/**
 * Hook to add an event listener to an element
 * @param ref - ref to the element
 * @param event - event name
 * @param handler - event handler
 * @param options
 */
export const useEvent = <TEvent extends EventElement, THandler extends EventHandler<any>> (
	ref: RefObject<TEvent>,
	event: string,
	handler: THandler | undefined,
	options?: AddEventListenerOptions) => {
	useEffect(() => {
		const element = ref.current;
		if (!handler || !element) {
			return;
		}

		element.addEventListener(event, handler, options);

		return () => {
			element.removeEventListener(event, handler);
		};
	}, [ref, event, handler]);
};

type EventHandlerWithType<T extends Event> = (event: T) => void;

type EventHandlers<T> = {
	[K in keyof T]: EventHandlerWithType<T[K] extends EventHandlerWithType<infer U> ? U : never> | undefined;
};

/**
 * Hook to add multiple event listeners to an element
 * @param ref - ref to the element
 * @param events - object containing event names and handlers
 * @param options
 */
export const useEvents = <
	TEvent extends EventElement,
	THandlers extends EventHandlers<THandlers>,
> (
	ref: RefObject<TEvent>,
	events: THandlers,
	options?: AddEventListenerOptions,
) => {
	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}

		const eventListeners = Object.entries(events).map(([event, handler]) => {
			if (handler) {
				element.addEventListener(event, handler as EventHandler<any>, options);
			}

			return {event, handler};
		});

		return () => {
			for (const {event, handler} of eventListeners) {
				if (handler) {
					element.removeEventListener(event, handler as EventHandler<any>);
				}
			}
		};
	}, [ref, events]);
};

