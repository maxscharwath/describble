import React from 'react';

/**
 * A state value that can be used in a React component.
 * Usefully to pass getters and setters to child components.
 */
export type Value<T> = {value: T; set: React.Dispatch<React.SetStateAction<T>>};

export function useValue<T>(initialValue: T): Value<T> {
	const [value, set] = React.useState<T>(initialValue);
	return Object.defineProperty({set}, 'value', {
		get: () => value,
		set,
	}) as Value<T>;
}
