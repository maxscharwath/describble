import {act, renderHook} from '@testing-library/react';
import {useMouseState} from '../../src/hooks/useMouse';

describe('useMouseState', () => {
	const fireEventAndUpdateState = (eventType: string, eventInit: PointerEventInit, expectedState: {
		x: number;
		y: number;
		clicked: boolean;
	}, isTouch = false, activePointerId: number | null = null) => {
		const {result} = renderHook(() => useMouseState());

		expect(result.current).toEqual({x: 0, y: 0, clicked: false});

		act(() => {
			// Using MouseEvent instead of PointerEvent because jsdom doesn't support PointerEvent
			const event = new MouseEvent(eventType, eventInit);
			Object.defineProperty(event, 'pointerType', {value: isTouch ? 'touch' : 'mouse'});
			Object.defineProperty(event, 'pointerId', {value: activePointerId});
			window.dispatchEvent(event);
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

	it('should not update state when pointerType is touch and pointerId is not the activePointerId', () => {
		fireEventAndUpdateState(
			'pointermove',
			{clientX: 30, clientY: 40, buttons: 1},
			{x: 0, y: 0, clicked: false},
			true,
			2,
		);
	});

	it('should set activePointerId to null on pointerup event when e.pointerId === activePointerId', () => {
		fireEventAndUpdateState(
			'pointerdown',
			{clientX: 10, clientY: 20, buttons: 1},
			{x: 10, y: 20, clicked: true},
			false,
			1,
		);
		fireEventAndUpdateState(
			'pointerup',
			{clientX: 50, clientY: 60, buttons: 0},
			{x: 50, y: 60, clicked: false},
			false,
			1,
		);
	});

	it('should set activePointerId to e.pointerId on pointerdown event when activePointerId is null', () => {
		fireEventAndUpdateState(
			'pointerdown',
			{clientX: 10, clientY: 20, buttons: 1},
			{x: 10, y: 20, clicked: true},
			false,
			null,
		);
	});
});
