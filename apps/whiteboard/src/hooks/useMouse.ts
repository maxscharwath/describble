import {useEffect, useState} from 'react';

export const useMouseState = () => {
	const [state, setState] = useState({x: 0, y: 0, clicked: false});
	useEffect(() => {
		const handleMouse = (e: MouseEvent) => {
			setState({x: e.pageX, y: e.pageY, clicked: e.buttons > 0});
		};

		const events = ['pointermove', 'pointerdown', 'pointerup'] as const;
		events.forEach(e => {
			window.addEventListener(e, handleMouse);
		});
		return () => {
			events.forEach(e => {
				window.removeEventListener(e, handleMouse);
			});
		};
	}, []);
	return state;
};
