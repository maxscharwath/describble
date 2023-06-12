import Peer from 'simple-peer';
import wrtc from 'wrtc';
import * as secp256k1 from '@noble/secp256k1';
import {hkdf} from '@noble/hashes/hkdf';
import {sha256} from '@noble/hashes/sha256';
import {SignalingServer} from './server/Server';
import {SignalingClient} from './server/Client';

const createPeer = (initiator: boolean) => {
	const privateKey = secp256k1.utils.randomPrivateKey();
	const peer = new Peer({initiator, wrtc});
	return {
		privateKey,
		publicKey: secp256k1.getPublicKey(privateKey),
		peer,
		sharedSecret(publicKey: Uint8Array) {
			return secp256k1.getSharedSecret(privateKey, publicKey);
		},
	};
};

async function createSymetricKey(secret: Uint8Array, salt?: Uint8Array | string) {
	return crypto.subtle.importKey(
		'raw',
		hkdf(sha256, secret, salt, undefined, 32),
		{name: 'AES-GCM'},
		false,
		['encrypt', 'decrypt'],
	);
}

const server = new SignalingServer({
	host: 'localhost',
	port: 8080,
});

server.listen();

const aliceClient = new SignalingClient({
	url: 'ws://localhost:8080',
});

aliceClient.connect();

