import {createSignature, Deferred} from '../utils';
import * as cbor from 'cbor-x';
import {encodeMessage, safeParseBuffer} from './serialization';
import {AuthenticationSchema, ChallengeResponseMessageSchema, EncryptedMessageSchema} from './schemas';
import {match} from 'ts-pattern';
import {type Connection} from './adapter';
import {decryptMessage, encryptMessage} from '../crypto';

type SignalingClientConfig = {
	publicKey: Uint8Array;
	privateKey: Uint8Array;
	adapter: (publicKey: Uint8Array) => Connection;
};

export type Message<T=unknown> = {
	type: string;
	from: Uint8Array;
	to: Uint8Array;
	data: T;
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
		const connection = this.config.adapter(this.publicKey);

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
			const message = await safeParseBuffer(AuthenticationSchema, data);
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

		const encryptedData = await encryptMessage(
			cbor.encode(message.data),
			this.privateKey,
			message.to,
		);

		const encodedMessage = await encodeMessage(EncryptedMessageSchema, {
			type: message.type,
			from: this.publicKey,
			to: message.to,
			data: encryptedData,
		});
		this.connection.send(encodedMessage);
	}

	public onMessage<T>(callback: (data: Message<T>) => void) {
		this.handleMessage = callback as (data: Message) => void;
	}

	/**
	 * Sets up message handling after connection is established and authenticated
	 */
	private onReady() {
		this.connection?.onData(async (data: Uint8Array) => {
			const message = await safeParseBuffer(EncryptedMessageSchema, data);
			if (message.success) {
				const decrypted = await decryptMessage(message.data.data, this.privateKey, message.data.from);
				this.handleMessage?.({
					type: message.data.type,
					from: message.data.from,
					to: message.data.to,
					data: cbor.decode(decrypted),
				});
			} else {
				console.error('Failed to parse message', message);
			}
		});
	}
}
