import {SignalingServer} from './server/Server';
import {SignalingClient} from './server/Client';
import * as secp256k1 from '@noble/secp256k1';
import {webSocketAdapter, WebSocketServerAdapter} from './server/adapter';
import SimplePeer, {type SignalData} from 'simple-peer';
import wrtc from '@koush/wrtc';

const genKeyPair = () => {
	const privateKey = secp256k1.utils.randomPrivateKey();
	const publicKey = secp256k1.getPublicKey(privateKey, true);
	return {privateKey, publicKey};
};

(async () => {
	const server = new SignalingServer({
		adapter: new WebSocketServerAdapter({
			host: 'localhost',
			port: 8080,
		}),
	});

	server.listen();

	const aliceKeys = genKeyPair();
	const bobKeys = genKeyPair();

	const aliceClient = new SignalingClient({
		adapter: webSocketAdapter('ws://localhost:8080'),
		...aliceKeys,
	});

	const bobClient = new SignalingClient({
		adapter: webSocketAdapter('ws://localhost:8080'),
		...bobKeys,
	});

	await aliceClient.connect().catch(reason => console.log('Alice failed to connect', reason));
	await bobClient.connect().catch(reason => console.log('Bob failed to connect', reason));

	const alicePeer = new SimplePeer({initiator: true, wrtc});
	const bobPeer = new SimplePeer({initiator: false, wrtc});
	alicePeer.on('connect', () => {
		console.log('Alice connected');
		alicePeer.send('Hello Bob');
	});
	alicePeer.on('data', (data: Uint8Array) => {
		console.log('Alice received', data.toString());
	});
	bobPeer.on('connect', () => {
		console.log('Bob connected');
		bobPeer.send('Hello Alice');
	});
	bobPeer.on('data', (data: Uint8Array) => {
		console.log('Bob received', data.toString());
	});

	bobClient.onMessage<SignalData>(message => {
		console.log('Bob received signal', message.data);
		bobPeer.signal(message.data);
	});

	aliceClient.onMessage<SignalData>(message => {
		console.log('Alice received signal', message.data);
		alicePeer.signal(message.data);
	});

	alicePeer.on('signal', data => {
		void aliceClient.send({
			type: 'signal',
			to: bobKeys.publicKey,
			data,
		});
	});

	bobPeer.on('signal', data => {
		void bobClient.send({
			type: 'signal',
			to: aliceKeys.publicKey,
			data,
		});
	});
})();

/*
GOAL:
1. Client A ask for a specific document with a list of clients
2. Server will check if clients are online
3. Server will ask clients if he wants to share the document with client A
4. Clients who want to share the document will share their WebRTC connection details with client A
5. Client A will connect to the clients who want to share the document ( can receive multiple connections )

This schema can be scaled to a decentralized network where clients can ask their peers for a specific document.
That's why we need to encrypt data end-to-end.
 */

