import {SignalingServer} from './server/Server';
import {SignalingClient} from './server/Client';
import * as secp256k1 from '@noble/secp256k1';

const genKeyPair = () => {
	const privateKey = secp256k1.utils.randomPrivateKey();
	const publicKey = secp256k1.getPublicKey(privateKey, true);
	return {privateKey, publicKey};
};

(async () => {
	const server = new SignalingServer({
		host: 'localhost',
		port: 8080,
	});

	server.listen();

	const aliceKeys = genKeyPair();
	const bobKeys = genKeyPair();

	const aliceClient1 = new SignalingClient({
		url: 'ws://localhost:8080',
		...aliceKeys,
	});

	const aliceClient2 = new SignalingClient({
		url: 'ws://localhost:8080',
		...aliceKeys,
	});

	const bobClient = new SignalingClient({
		url: 'ws://localhost:8080',
		...bobKeys,
	});

	await aliceClient1.connect();
	await aliceClient2.connect();
	await bobClient.connect();

	await bobClient.send({
		type: 'offer',
		to: aliceKeys.publicKey,
		data: {
			type: 'offer',
			sdp: 'alice',
		},
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

