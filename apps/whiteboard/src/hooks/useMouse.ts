import {type PointerEvent, useRef} from 'react';

import {usePointerEvents} from './usePointerEvents';

export const useMouseState = (handle?: (state: {x: number; y: number; clicked: boolean}) => void) => {
	const windowRef = useRef(window);
	const activePointerIdRef = useRef<number | null>(null);
	const handleMouse = (e: PointerEvent<Window>) => {
		if (e.pointerType === 'touch' && e.pointerId !== activePointerIdRef.current) {
			return;
		}

		handle?.({x: e.clientX, y: e.clientY, clicked: e.buttons > 0});
	};

	usePointerEvents(windowRef, {
		onPointerDown(e: PointerEvent<Window>) {
			if (activePointerIdRef.current === null) {
				activePointerIdRef.current = e.pointerId;
			}

			handleMouse(e);
		},
		onPointerMove: handleMouse,
		onPointerUp(e: PointerEvent<Window>) {
			if (e.pointerId === activePointerIdRef.current) {
				activePointerIdRef.current = null;
			}

			handleMouse(e);
		},
	});
};
