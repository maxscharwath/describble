import {StateManager} from '~core/state/StateManager';
import {expect} from 'vitest';

describe('StateManager', () => {
	it('should initialize with default state', () => {
		const initialState = {
			foo: 'bar',
		};
		const stateManager = new StateManager(initialState);
		expect(stateManager.state).toEqual(initialState);
		expect(stateManager.state).not.toBe(initialState);
	});

	it('should patch state', () => {
		const initialState = {
			foo: 'bar',
			nested: {
				bar: 'baz',
			},
		};
		const stateManager = new StateManager(initialState);
		stateManager.patchState({foo: 'baz'});
		expect(stateManager.state).toEqual({
			foo: 'baz',
			nested: {
				bar: 'baz',
			},
		});
	});
});
