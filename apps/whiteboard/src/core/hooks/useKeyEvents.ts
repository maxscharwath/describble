import {useWhiteboard} from './useWhiteboard';
import React from 'react';

export function useKeyEvents() {
	const {keyboardEvent} = useWhiteboard();

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			keyboardEvent.onKeyDown(e);
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			keyboardEvent.onKeyUp(e);
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [keyboardEvent]);
}
