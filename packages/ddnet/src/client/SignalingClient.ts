import {v4 as uuidv4} from 'uuid';
import Emittery from 'emittery';
import type {Connection, NetworkAdapter} from '../network';
import {decodeMessage, encodeMessage, type Message} from '../Message';
import {ClientAuthenticator} from '../authenticator/ClientAuthenticator';

/**
 * Configuration for the SignalingClient.
 */
export type SignalingClientConfig = {
	publicKey: Uint8Array; // Client's public key
	privateKey: Uint8Array; // Client's private key
	network: NetworkAdapter; // Network adapter to use for connection
};

/**
 * Event type for the SignalingClient.
 */
type SignalingClientEvent = {
	message: Message<any>; // Any received message
};

/**
 * Class representing a signaling client.
 */
export class SignalingClient extends Emittery<SignalingClientEvent> {
	private connection?: Connection;
	private readonly _clientId: Uint8Array;

	public constructor(private readonly config: SignalingClientConfig) {
		super();
		this._clientId = SignalingClient.generateClientId();
	}

	/**
   * Getter for the client's public key.
   */
	public get publicKey() {
		return new Uint8Array(this.config.publicKey);
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
	public async connect() {
		const {publicKey, privateKey, network} = this.config;
		const authenticator = new ClientAuthenticator(privateKey);
		this.connection = await authenticator.authenticate(
			network.createConnection(publicKey, this._clientId),
		);
		this.connection.on('data', async data => {
			void this.emit('message', await decodeMessage(data, privateKey));
		});
	}

	/**
   * Disconnects the client from the signaling server.
   */
	public async disconnect() {
		if (!this.connection) {
			throw new Error('Not connected');
		}

		this.connection.close('Disconnect from client');
	}

	/**
   * Sends a message to the signaling server.
   * @param message - The message to send.
   */
	public async sendMessage<TData>(message: Omit<Message<TData>, 'from'>) {
		if (!this.connection) {
			throw new Error('Not connected');
		}

		this.connection.send(
			await encodeMessage({
				...message,
				from: {
					publicKey: this.config.publicKey,
					clientId: this._clientId,
				},
			}, this.config.privateKey),
		);
	}

	/**
   * Generates a unique client ID.
   */
	private static generateClientId() {
		return uuidv4({}, new Uint8Array(16));
	}
}
