import {WebSocket} from 'ws';
import {PublicKeyHelper} from './Server';
import {createSignature} from '../utils';
import * as secp256k1 from '@noble/secp256k1';
import {hkdf} from '@noble/hashes/hkdf';
import {sha256} from '@noble/hashes/sha256';
import * as cbor from 'cbor-x';
import * as process from 'process';

type SignalingClientConfig = {
	publicKey: Uint8Array;
	privateKey: Uint8Array;
	url: string;
};

class Deferred<T> {
	resolve!: (value: T) => void;
	reject!: (reason?: any) => void;
	promise: Promise<T>;

	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

export class SignalingClient {
	private ws?: WebSocket;
	private readonly privateKey: Uint8Array;
	private readonly publicKey: Uint8Array;
	private readonly serverUrl: string;
	private readonly authenticating = new Deferred<void>();

	constructor(config: SignalingClientConfig) {
		this.publicKey = config.publicKey;
		this.privateKey = config.privateKey;
		this.serverUrl = config.url;
	}

	/**
   * Connects to the server.
   */
	async connect() {
		const ws = new WebSocket(this.serverUrl, {
			headers: {
				'x-public-key': PublicKeyHelper.encode(this.publicKey),
			},
		});
		ws.once('close', (code, reason) => {
			console.error('Connection closed', code, reason);
			this.authenticating.reject(new Error('Connection closed'));
		});
		ws.on('message', async (data: Uint8Array) => {
			const message = cbor.decode(data) as {type: string; challenge: Uint8Array};
			switch (message.type) {
				case 'challenge':
					ws.send(cbor.encode({
						type: 'challenge-response',
						signature: await createSignature(message.challenge, this.privateKey),
					}));
					break;

				case 'authenticated':
					ws.removeAllListeners();
					this.ws = ws;
					this.onReady();
					this.authenticating.resolve();
					return console.log('Successfully authenticated');
				default:
					console.warn('Unknown message type', message.type);
					break;
			}
		});
		return this.authenticating.promise;
	}

	/**
   * Disconnects from the server.
   */
	disconnect() {
		this.ws?.close();
	}

	public async send(message: {
		type: string;
		to: Uint8Array;
		data: any;
	}) {
		if (!this.ws) {
			throw new Error('Not authenticated');
		}

		const start = process.hrtime();

		const key = await this.generateAESKey(message.to);
		this.ws.send(cbor.encode({
			...message,
			data: await this.encryptMessage(cbor.encode(message.data), key),
		}));

		const end = process.hrtime(start);
		console.log(`Sent message to ${PublicKeyHelper.encode(message.to)}:`, message.data, `(encrypted in ${(end[0] * 1e3) + (end[1] / 1e6)}ms)`);
	}

	private onReady() {
		this.ws!.on('message', async (data: Uint8Array) => {
			const start = process.hrtime();
			const message = cbor.decode(data) as {type: string; from: Uint8Array; data: Uint8Array};
			const key = await this.generateAESKey(message.from);
			const decrypted = await this.decryptMessage(message.data, key);
			const end = process.hrtime(start);
			console.log(`Received message (${message.type}) from ${PublicKeyHelper.encode(message.from)}:`, cbor.decode(decrypted), `(decrypted in ${(end[0] * 1e3) + (end[1] / 1e6)}ms)`);
		});
	}

	private async generateAESKey(publicKey: Uint8Array, salt?: Uint8Array | string) {
		const secret = secp256k1.getSharedSecret(this.privateKey, publicKey);
		return crypto.subtle.importKey(
			'raw',
			hkdf(sha256, secret, salt, undefined, 32),
			{name: 'AES-GCM'},
			false,
			['encrypt', 'decrypt'],
		);
	}

	private async encryptMessage(data: Uint8Array, key: CryptoKey) {
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const ciphertext = await crypto.subtle.encrypt(
			{name: 'AES-GCM', iv},
			key,
			data,
		);
		return new Uint8Array([...iv, ...new Uint8Array(ciphertext)]);
	}

	private async decryptMessage(data: Uint8Array, key: CryptoKey) {
		const iv = data.slice(0, 12);
		const ciphertext = data.slice(12);
		return new Uint8Array(
			await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, ciphertext),
		);
	}
}
