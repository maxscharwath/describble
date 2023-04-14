import {describe, type Mock, vi} from 'vitest';
import {useEvent, useEvents} from '../../src/hooks/useEvents';
import {renderHook} from '@testing-library/react';
import {type PointerEventHandler} from 'react';

describe('useEvents', () => {
	let target: HTMLDivElement;
	let handler: Mock;

	beforeEach(() => {
		target = document.createElement('div');
		handler = vi.fn();
	});

	it('should attach and remove the event listener', () => {
		const ref = {current: target};
		const {unmount} = renderHook(() => useEvent(ref, 'click', handler));

		target.dispatchEvent(new Event('click'));
		expect(handler).toHaveBeenCalledTimes(1);

		unmount();
		target.dispatchEvent(new Event('click'));
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('should not attach the event listener if handler is not provided', () => {
		const ref = {current: target};
		const {unmount} = renderHook(() => useEvent(ref, 'click', undefined));

		target.dispatchEvent(new Event('click'));
		expect(handler).toHaveBeenCalledTimes(0);
		unmount();
	});
});

describe('useEvents', () => {
	let target: HTMLDivElement;
	let onClick: PointerEventHandler;
	let onPointerMove: Mock;
	let onMouseUp: Mock;

	beforeEach(() => {
		target = document.createElement('div');
		onClick = vi.fn();
		onPointerMove = vi.fn();
		onMouseUp = vi.fn();
	});

	it('should attach and remove the pointer event listeners', () => {
		const ref = {current: target};
		const {unmount} = renderHook(() =>
			useEvents(ref, {
				click: onClick,
				pointermove: onPointerMove,
				mouseup: onMouseUp,
			}),
		);

		target.dispatchEvent(new Event('click'));
		expect(onClick).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('pointermove'));
		expect(onPointerMove).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('mouseup'));
		expect(onMouseUp).toHaveBeenCalledTimes(1);

		unmount();
		target.dispatchEvent(new Event('click'));
		expect(onClick).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('pointermove'));
		expect(onPointerMove).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('mouseup'));
		expect(onMouseUp).toHaveBeenCalledTimes(1);
	});

	it('should handle optional event listeners', () => {
		const ref = {current: target};
		const {unmount} = renderHook(() =>
			useEvents(ref, {
				click: onClick,
				pointermove: onPointerMove,
			}),
		);

		target.dispatchEvent(new Event('click'));
		expect(onClick).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('pointermove'));
		expect(onPointerMove).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('mouseup'));
		expect(onMouseUp).toHaveBeenCalledTimes(0);

		unmount();
	});
});
