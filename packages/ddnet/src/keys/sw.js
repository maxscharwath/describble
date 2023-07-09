
const cache = new Map();

self.addEventListener('message', event => {
	const message = event.data;
	switch (message.type) {
		case 'get': {
			return event.ports[0].postMessage(cache.get(message.key));
		}

		case 'delete': {
			return event.ports[0].postMessage(cache.delete(message.key));
		}

		case 'set': {
			cache.set(message.key, message.data);
			return event.ports[0].postMessage(undefined);
		}

		default: {
			return event.ports[0].postMessage(undefined);
		}
	}
});
