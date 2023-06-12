import {WebSocket} from 'ws';
import base58 from 'bs58';
import {PublicKeyHelper} from './Server';
import {createSignature} from '../utils';
import * as secp256k1 from '@noble/secp256k1';
type PublicKey = Uint8Array | string;

type SignalingClientConfig = {
	url: string;
};

export class SignalingClient {
	private ws?: WebSocket;
	private readonly publicKey: PublicKey;
	private readonly serverUrl: string;
	private readonly privateKey: Uint8Array;

	constructor(config: SignalingClientConfig) {
		this.privateKey = secp256k1.utils.randomPrivateKey();
		this.publicKey = secp256k1.getPublicKey(this.privateKey, true);
		this.serverUrl = config.url;
	}

	/**
   * Connects to the server.
   */
	connect() {
		this.ws = new WebSocket(this.serverUrl, {
			headers: {
				'x-public-key': PublicKeyHelper.encode(this.publicKey),
			},
		});

		this.ws.on('open', () => {
			console.log('Connected to the server');
		});

		this.ws.on('message', (data: Uint8Array) => {
			void this.handleChallenge(data);
		});

		this.ws.on('error', (err: Error) => {
			console.log('Error occurred: ', err);
		});

		this.ws.on('close', (code: number, reason: string) => {
			console.log(`Connection closed, code: ${code}, reason: ${reason}`);
		});
	}

	/**
   * Disconnects from the server.
   */
	disconnect() {
		this.ws?.close();
	}

	/**
   * Handles the authentication challenge.
   * @param challenge - The challenge received from the server
   */
	private async handleChallenge(challenge: Uint8Array) {
		console.log(`Received challenge: ${base58.encode(challenge)}`);
		const signature = await createSignature(challenge, this.privateKey);
		this.ws?.send(signature);
	}
}
