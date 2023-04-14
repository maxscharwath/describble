import {type PointerEvent, useRef, useState} from 'react';

import {usePointerEvents} from './usePointerEvents';

export const useMouseState = () => {
	const [state, setState] = useState({x: 0, y: 0, clicked: false});
	const windowRef = useRef(window);

	const handleMouse = (e: PointerEvent<Window>) => {
		setState({x: e.clientX, y: e.clientY, clicked: e.buttons > 0});
	};

	usePointerEvents(windowRef, {
		onPointerDown: handleMouse,
		onPointerMove: handleMouse,
		onPointerUp: handleMouse,
	});

	return state;
};
