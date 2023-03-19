import {Room} from '../src';

(async () => {
	const roomA = new Room('yolo');
	const roomB = new Room('yolo');

	roomA.on('join', id => {
		console.log('A joined:', id);
	});
	roomA.on('data', message => {
		console.log('A received:', message);
	});

	roomB.on('join', id => {
		console.log('B joined:', id);
	});

	roomB.on('data', message => {
		console.log('B received:', message);
	});

	await roomA.send('Hello from A');
	await roomB.send('Hello from B');
})();
