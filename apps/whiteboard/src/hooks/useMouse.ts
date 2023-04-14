import {type PointerEvent, useRef, useState} from 'react';

import {usePointerEvents} from './usePointerEvents';

export const useMouseState = () => {
	const [state, setState] = useState({x: 0, y: 0, clicked: false});
	const [activePointerId, setActivePointerId] = useState<number | null>(null);
	const windowRef = useRef(window);

	const handleMouse = (e: PointerEvent<Window>) => {
		if (e.pointerType === 'touch' && e.pointerId !== activePointerId) {
			return;
		}

		setState({x: e.clientX, y: e.clientY, clicked: e.buttons > 0});
	};

	usePointerEvents(windowRef, {
		onPointerDown(e: PointerEvent<Window>) {
			if (activePointerId === null) {
				setActivePointerId(e.pointerId);
			}

			handleMouse(e);
		},
		onPointerMove: handleMouse,
		onPointerUp(e: PointerEvent<Window>) {
			if (e.pointerId === activePointerId) {
				setActivePointerId(null);
			}

			handleMouse(e);
		},
	});

	return state;
};
