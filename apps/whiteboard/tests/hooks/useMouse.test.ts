import {renderHook, act} from '@testing-library/react';
import {useMouseState} from '../../src/hooks/useMouse';

describe('useMouseState', () => {
	const fireEventAndUpdateState = (eventType: string, eventInit: PointerEventInit, expectedState: {x: number; y: number; clicked: boolean}) => {
		const {result} = renderHook(() => useMouseState());

		expect(result.current).toEqual({x: 0, y: 0, clicked: false});

		act(() => {
			// Using MouseEvent instead of PointerEvent because jsdom doesn't support PointerEvent
			window.dispatchEvent(new MouseEvent(eventType, eventInit));
		});

		expect(result.current).toEqual(expectedState);
	};

	it('should update state with correct values on pointerdown event', () => {
		fireEventAndUpdateState(
			'pointerdown',
			{clientX: 10, clientY: 20, buttons: 1},
			{x: 10, y: 20, clicked: true},
		);
	});

	it('should update state with correct values on pointermove event', () => {
		fireEventAndUpdateState(
			'pointermove',
			{clientX: 30, clientY: 40, buttons: 1},
			{x: 30, y: 40, clicked: true},
		);
	});

	it('should update state with correct values on pointerup event', () => {
		fireEventAndUpdateState(
			'pointerup',
			{clientX: 50, clientY: 60, buttons: 0},
			{x: 50, y: 60, clicked: false},
		);
	});
});
