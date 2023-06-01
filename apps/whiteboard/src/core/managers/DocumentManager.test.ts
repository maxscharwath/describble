import {describe} from 'vitest';
import {DocumentManager} from '~core/managers/DocumentManager';

describe('DocumentManager', () => {
	it('should be able to create a new instance', () => {
		const stateManager = new DocumentManager({
			id: 'test',
			camera: {x: 0, y: 0, zoom: 1},
			layers: {},
			assets: {},
		});
		stateManager.patch({
			assets: {
				test: {id: 'test', src: 'test'},
			},
		}, 'test');
		stateManager.camera = {x: 1};
		expect(stateManager).toBeDefined();
		expect(stateManager.state).toEqual({
			id: 'test',
			camera: {x: 1, y: 0, zoom: 1},
			layers: {},
			assets: {
				test: {id: 'test', src: 'test'},
			},
		});
	});
});
