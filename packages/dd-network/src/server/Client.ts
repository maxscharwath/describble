import {WebSocket} from 'ws';
import {createSignature} from '../utils';
import * as secp256k1 from '@noble/secp256k1';
import {hkdf} from '@noble/hashes/hkdf';
import {sha256} from '@noble/hashes/sha256';
import * as cbor from 'cbor-x';
import {encodeMessage, parseBuffer} from './serialization';
import {AuthenticationSchema, ChallengeResponseMessageSchema, EncryptedMessageSchema} from './schemas';
import {match} from 'ts-pattern';
import {PublicKeyHelper} from './Server';

type SignalingClientConfig = {
	publicKey: Uint8Array;
	privateKey: Uint8Array;
	connection: (publicKey: Uint8Array) => Connection;
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

interface Connection {
	onData: (callback: (data: Uint8Array) => void) => void;
	onClose: (callback: (error: Error) => void) => void;
	off: () => void;
	send: (data: Uint8Array) => void;
	close: (cause: string) => void;
}

export class WebSocketConnection implements Connection {
	private readonly socket: WebSocket;

	constructor(url: string, publicKey: Uint8Array) {
		this.socket = new WebSocket(url, {
			headers: {
				'x-public-key': PublicKeyHelper.encode(publicKey),
			},
		});
	}

	onData(callback: (data: Uint8Array) => void) {
		this.socket.on('message', callback);
	}

	onClose(callback: (error: Error) => void) {
		this.socket.on('close', callback);
		this.socket.on('error', callback);
	}

	off() {
		this.socket.removeAllListeners();
	}

	close(cause: string) {
		this.socket.close(1000, cause);
		this.socket.terminate();
	}

	send(data: Uint8Array) {
		this.socket.send(data);
	}
}

export const webSocketConnection = (url: string) => (publicKey: Uint8Array) =>
	new WebSocketConnection(url, publicKey);

type Message = {
	type: string;
	from: Uint8Array;
	to: Uint8Array;
	data: unknown;
};

export class SignalingClient {
	private connection?: Connection;
	private readonly privateKey: Uint8Array;
	private readonly publicKey: Uint8Array;
	private readonly authenticating = new Deferred<void>();
	private handleMessage?: (data: Message) => void;

	constructor(private readonly config: SignalingClientConfig) {
		this.publicKey = config.publicKey;
		this.privateKey = config.privateKey;
	}

	/**
	 * Connects to the server, sends public key in the header to be used for authentication
	 */
	async connect() {
		const connection = this.config.connection(this.publicKey);

		const timeout = setTimeout(() => {
			connection.close('Connection timeout');
			this.authenticating.reject(new Error('Connection timeout'));
		}, 5000);

		connection.onClose(error => {
			clearTimeout(timeout);
			this.authenticating.reject(error);
		});

		connection.onData(async data => {
			// Parse incoming messages according to the AuthenticationSchema
			const message = await parseBuffer(AuthenticationSchema, data);
			void match(message)
				.with({success: true, data: {type: 'challenge'}}, async ({data: {challenge}}) => {
					// On receiving a challenge, sign the challenge and send it back
					connection.send(await encodeMessage(ChallengeResponseMessageSchema, {
						type: 'challenge-response',
						signature: await createSignature(challenge, this.privateKey),
					}));
				})
				.with({success: true, data: {type: 'authenticated'}}, () => {
					// If authenticated, remove all listeners, declare the websocket ready, resolve the promise
					clearTimeout(timeout);
					connection.off();
					this.connection = connection;
					this.authenticating.resolve();
					this.onReady();
					return console.log('Successfully authenticated');
				})
				.otherwise(() => console.error('Unexpected message', message));
		});
		// Returns a promise that resolves when authentication completes
		return this.authenticating.promise;
	}

	/**
	 * Disconnects from the server.
	 */
	disconnect() {
		this.connection?.close('Client disconnected');
	}

	/**
	 * Sends a message to the server. The message is encrypted using AES-GCM with a shared secret derived from the recipient's public key.
	 * @param message The message to send.
	 */
	public async send(message: {type: string; to: Uint8Array; data: any}) {
		if (!this.connection) {
			throw new Error('Not authenticated');
		}

		const encryptedData = await this.encryptMessage(cbor.encode(message.data), message.to);
		const encodedMessage = await encodeMessage(EncryptedMessageSchema, {
			type: message.type,
			from: this.publicKey,
			to: message.to,
			data: encryptedData,
		});
		this.connection.send(encodedMessage);
	}

	public onMessage(callback: (data: Message) => void) {
		this.handleMessage = callback;
	}

	/**
	 * Sets up message handling after connection is established and authenticated
	 */
	private onReady() {
		this.connection!.onData(async (data: Uint8Array) => {
			const message = await parseBuffer(EncryptedMessageSchema, data);
			if (message.success) {
				const decrypted = await this.decryptMessage(message.data.data, message.data.from);
				this.handleMessage?.({
					type: message.data.type,
					from: message.data.from,
					to: message.data.to,
					data: cbor.decode(decrypted),
				});
			}
		});
	}

	/**
	 * Generates an AES key using HKDF with a shared secret and a salt
	 * @param publicKey The recipient's public key
	 * @param salt A random salt
	 */
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

	/**
	 * Encrypts a message using AES-GCM
	 * @param data The data to encrypt
	 * @param publicKey The recipient's public key
	 */
	private async encryptMessage(data: Uint8Array, publicKey: Uint8Array) {
		// Generate Initialization Vector (iv) and salt
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const salt = crypto.getRandomValues(new Uint8Array(16));

		// Generate AES Key based on public key and salt
		const key = await this.generateAESKey(publicKey, salt);

		// Encrypt the data
		const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, data));

		// Prepare the result - concatenate iv, salt and ciphertext
		const result = new Uint8Array(iv.length + salt.length + ciphertext.length);
		result.set(iv, 0);
		result.set(salt, iv.length);
		result.set(ciphertext, iv.length + salt.length);

		return result;
	}

	/**
	 * Decrypts the provided data using the given public key.
	 *
	 * @param data - The data to be decrypted, which includes the initialization vector (IV), salt, and the ciphertext.
	 * @param publicKey - The public key to use for decryption.
	 *
	 * @returns The decrypted message as a Uint8Array.
	 */
	private async decryptMessage(data: Uint8Array, publicKey: Uint8Array): Promise<Uint8Array> {
		// Extract the initialization vector (iv), salt, and ciphertext from the data
		const iv = data.subarray(0, 12);
		const salt = data.subarray(12, 28);
		const ciphertext = data.subarray(28);

		// Generate the AES key from the public key and salt
		const key = await this.generateAESKey(publicKey, salt);

		// Decrypt the ciphertext and return the decrypted data
		return new Uint8Array(await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, ciphertext));
	}
}
