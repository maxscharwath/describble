import {v4 as uuidv4} from 'uuid';
import Emittery from 'emittery';
import {decodeMessage, encodeMessage, type Message} from '../Message';
import {ClientAuthenticator} from '../authenticator/ClientAuthenticator';
import {type NetworkAdapter} from '../network/NetworkAdapter';
import {type Connection} from '../network/Connection';
import {type KeyPair} from '../keys/SessionManager';

/**
 * Configuration for the SignalingClient.
 */
export type SignalingClientConfig = {
	network: NetworkAdapter; // Network adapter to use for connection
};

/**
 * Event type for the SignalingClient.
 */
type SignalingClientEvent = {
	'connect': undefined; // Emitted when the client connects to the signaling server
	'disconnect': undefined; // Emitted when the client disconnects from the signaling server
	message: Message<any>; // Any received message
};

/**
 * Class representing a signaling client.
 */
export class SignalingClient extends Emittery<SignalingClientEvent> {
	private connection?: Connection;
	private readonly _clientId: Uint8Array;
	private credentials?: KeyPair;

	public constructor(private readonly config: SignalingClientConfig) {
		super();
		this._clientId = SignalingClient.generateClientId();
	}

	/**
   * Getter for the client's ID.
   */
	public get clientId() {
		return new Uint8Array(this._clientId);
	}

	/**
   * Returns whether the client is connected to the signaling server.
   */
	public get connected() {
		return this.connection?.isConnected() ?? false;
	}

	/**
   * Connects the client to the signaling server.
   */
	public async connect({publicKey, privateKey}: KeyPair) {
		const {network} = this.config;
		const authenticator = new ClientAuthenticator(privateKey);
		this.connection = await authenticator.authenticate(
			network.createConnection(publicKey, this._clientId),
		);
		this.credentials = {publicKey, privateKey};
		void this.emit('connect');
		console.log('Connected to signaling server');
		const unsubscribe = this.connection.on('data', async data => {
			void this.emit('message', await decodeMessage(data, privateKey));
		});
		this.connection.on('close', () => {
			console.log('Disconnected from signaling server');
			unsubscribe();
			void this.autoReconnect();
			void this.emit('disconnect');
		});
	}

	/**
   * Disconnects the client from the signaling server.
   */
	public async disconnect() {
		this.credentials = undefined;
		this.connection?.close('Disconnect from client');
	}

	/**
   * Sends a message to the signaling server.
   * @param message - The message to send.
   */
	public async sendMessage<TData>(message: Omit<Message<TData>, 'from'>) {
		if (!this.connection || !this.credentials) {
			throw new Error('Not connected');
		}

		this.connection.send(
			await encodeMessage({
				...message,
				from: {
					publicKey: this.credentials.publicKey,
					clientId: this._clientId,
				},
			}, this.credentials.privateKey),
		);
	}

	/**
	 * Automatically reconnects the client to the signaling server.
	 */
	private async autoReconnect() {
		const maxRetries = 5;
		let retries = 0;
		while (retries < maxRetries) {
			try {
				if (this.credentials) {
					// eslint-disable-next-line no-await-in-loop
					await this.connect(this.credentials);
					break;
				}
			} catch (err) {
				retries++;
				console.error(`Failed to reconnect, attempt #${retries}`, err);
				// eslint-disable-next-line no-await-in-loop,@typescript-eslint/no-loop-func
				await new Promise(resolve => {
					setTimeout(resolve, 1000 * (2 ** retries));
				}); // Exponential backoff
			}
		}

		if (retries >= maxRetries) {
			console.error('Max retries reached, giving up');
		}
	}

	/**
   * Generates a unique client ID.
   */
	private static generateClientId() {
		return uuidv4({}, new Uint8Array(16));
	}
}
