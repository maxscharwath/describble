import {type PointerEvent, useRef} from 'react';

import {useEvent, usePointerEvents} from '~core/hooks';

type MouseState = {
	x: number;
	y: number;
	clicked: boolean;
	outside: boolean;
};
export const useMouseState = (handle?: (state: MouseState) => void) => {
	const windowRef = useRef(window);
	const activePointerIdRef = useRef<number | null>(null);
	const handleMouse = (e: PointerEvent<Window>, outside = false) => {
		if (e.pointerType === 'touch' && e.pointerId !== activePointerIdRef.current) {
			return;
		}

		handle?.({x: e.clientX, y: e.clientY, clicked: e.buttons > 0, outside});
	};

	useEvent(windowRef, 'pointerout', (e: PointerEvent<Window>) => {
		if (e.relatedTarget === null || e.relatedTarget === document.documentElement) {
			handleMouse(e, true);
		}
	}, {capture: true});
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
	}, {capture: true});
};
