import {describe, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {type PointerEventHandler} from 'react';
import {usePointerEvents} from '~core/hooks/usePointerEvents';

describe('usePointerEvents', () => {
	let target: HTMLDivElement;
	let onPointerDown: PointerEventHandler;
	let onPointerMove: PointerEventHandler;
	let onPointerUp: PointerEventHandler;

	beforeEach(() => {
		target = document.createElement('div');
		onPointerDown = vi.fn();
		onPointerMove = vi.fn();
		onPointerUp = vi.fn();
	});

	it('should attach and remove the pointer event listeners', () => {
		const ref = {current: target};
		const {unmount} = renderHook(() =>
			usePointerEvents(ref, {
				onPointerDown,
				onPointerMove,
				onPointerUp,
			}),
		);

		target.dispatchEvent(new Event('pointerdown'));
		expect(onPointerDown).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('pointermove'));
		expect(onPointerMove).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('pointerup'));
		expect(onPointerUp).toHaveBeenCalledTimes(1);

		unmount();
		target.dispatchEvent(new Event('pointerdown'));
		target.dispatchEvent(new Event('pointermove'));
		target.dispatchEvent(new Event('pointerup'));
		expect(onPointerDown).toHaveBeenCalledTimes(1);
		expect(onPointerMove).toHaveBeenCalledTimes(1);
		expect(onPointerUp).toHaveBeenCalledTimes(1);
	});

	it('should handle optional event listeners', () => {
		const ref = {current: target};
		const {unmount} = renderHook(() =>
			usePointerEvents(ref, {
				onPointerDown,
				onPointerUp,
			}),
		);

		target.dispatchEvent(new Event('pointerdown'));
		expect(onPointerDown).toHaveBeenCalledTimes(1);

		target.dispatchEvent(new Event('pointermove'));
		expect(onPointerMove).toHaveBeenCalledTimes(0);

		target.dispatchEvent(new Event('pointerup'));
		expect(onPointerUp).toHaveBeenCalledTimes(1);

		unmount();
	});
});
