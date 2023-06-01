import {DistributedStateManager} from '~core/state/DistributedStateManager';

describe('DistributedStateManager', () => {
	it('should be able to create a new instance', () => {
		const stateManager = DistributedStateManager.create({
			id: 'test',
			folder: 'test',
		});
		expect(stateManager).toBeDefined();

		stateManager.change(doc => {
			doc.folder = 'test2';
		}, 'test');
		expect(stateManager.state).toEqual({
			id: 'test',
			folder: 'test2',
		});
	});

	it('should be able to use destructuring in object', () => {
		const stateManager = DistributedStateManager.create({
			id: 'test',
			folders: {test: 'test'},
		});
		expect(stateManager).toBeDefined();
		stateManager.change(({folders}) => {
			folders.test = 'test2';
		}, 'test');
		expect(stateManager.state).toEqual({
			id: 'test',
			folders: {test: 'test2'},
		});
	});

	it('should be able to commit', () => {
		const stateManager = DistributedStateManager.create({
			id: 'test',
			layers: {name: 'test', camera: {x: 0, y: 0, zoom: 1}},
		});

		stateManager.change(state => {
			state.layers.name = 'test2';
			state.id = 'test2';
		});

		expect(stateManager.state).toEqual({
			id: 'test2',
			layers: {name: 'test2', camera: {x: 0, y: 0, zoom: 1}},
		});
	});

	it('should be able to patch commit', () => {
		const stateManager = DistributedStateManager.create({
			id: 'test',
			layers: {name: 'test', camera: {x: 0, y: 0, zoom: 1}},
			person: ['John'],
		});

		stateManager.patch({
			id: 'test2',
			layers: {name: 'test2', camera: {y: 2}},
			person: ['John', 'Doe'],
		}, 'update camera x');

		expect(stateManager.state).toEqual({
			id: 'test2',
			layers: {name: 'test2', camera: {x: 0, y: 2, zoom: 1}},
			person: ['John', 'Doe'],
		});
	});
});
