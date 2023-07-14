import {SignalingServer, WebSocketNetwork} from '@ddnet/core/node';

const server = new SignalingServer({
	network: new WebSocketNetwork({
		host: '0.0.0.0',
		port: 8080,
	}),
});

server.listen().then(() => {
	console.log('Signaling server listening on port 8080');
}).catch(console.error);
