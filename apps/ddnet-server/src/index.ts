import {SignalingServer} from 'ddnet/src/server/SignalingServer';
import {WebSocketNetwork} from 'ddnet/src/network/websocket/WebSocketNetwork';

const server = new SignalingServer({
	network: new WebSocketNetwork({
		host: '0.0.0.0',
		port: 8080,
	}),
});

server.listen().then(() => {
	console.log('Signaling server listening on port 8080');
}).catch(err => {
	console.error(err);
	process.exit();
});
