import {type Network} from './Network';
import {type Connection} from '../Connection';
import {verifyMessage} from '../Message';
import {base58} from 'base-x';
import {type ConnectionRegistry} from './ConnectionRegistry';

/**
 * MessageRouter class handles routing of messages.
 */
export class MessageRouter {
	/**
   * Constructor for the MessageRouter class.
   * @param registry - ConnectionRegistry instance to store and retrieve connections.
   * @param network - Network instance to handle communication tasks.
   */
	constructor(
		private readonly registry: ConnectionRegistry,
		private readonly network: Network,
	) {}

	/**
   * Function to route a message to appropriate targets.
   * @param data - The incoming message data.
   * @param from - The connection from which the message originated.
   */
	public routeIncomingData(data: Uint8Array, from: Connection): void {
		const {verified, message} = verifyMessage(data);

		// If the message isn't valid, log a warning and return.
		if (!verified) {
			console.warn('Received invalid message', message);
			return;
		}

		const {publicKey, clientId} = message.to ?? {};

		if (!publicKey) {
			// If no target public key is provided, broadcast to all connections
			return this.broadcastMessage(data, from);
		}

		if (!clientId) {
			// If no target client ID is provided, broadcast to all connections with the specified public key
			return this.broadcastMessageToPublicKey(publicKey, data, from);
		}

		// Otherwise, send a direct message to the specified client
		this.sendDirectMessage(publicKey, clientId, data);
	}

	/**
   * Function to send a direct message to a specific client.
   * @param publicKey - The public key of the target client.
   * @param clientId - The client ID of the target client.
   * @param data - The message data.
   */
	private sendDirectMessage(publicKey: Uint8Array, clientId: Uint8Array, data: Uint8Array): void {
		const connection = this.registry.getConnection(publicKey, clientId);

		if (!connection) {
			// If the specified client is not found, warn and exit
			return this.warnUnknown('client', clientId);
		}

		// Send the data to the target client
		this.network.send(connection, data);
	}

	/**
   * Function to broadcast a message to all connections with a specified public key.
   * @param publicKey - The public key of the target clients.
   * @param data - The message data.
   * @param from - The connection from which the message originated.
   */
	private broadcastMessageToPublicKey(publicKey: Uint8Array, data: Uint8Array, from: Connection): void {
		const connections = this.registry.getConnections(publicKey);

		if (!connections) {
			// If no clients with the specified public key are found, warn and exit
			return this.warnUnknown('public key', publicKey);
		}

		// Send the data to each connection with the specified public key, excluding the sender
		connections.forEach(connection => {
			if (connection !== from) {
				this.network.send(connection, data);
			}
		});
	}

	/**
   * Function to broadcast a message to all connections.
   * @param data - The message data.
   * @param from - The connection from which the message originated.
   */
	private broadcastMessage(data: Uint8Array, from: Connection): void {
		// Send the data to each connection in the registry, excluding the sender
		this.registry.forEach(connection => {
			if (connection !== from) {
				this.network.send(connection, data);
			}
		});
	}

	/**
   * Function to log a warning when a target entity (client or public key) is not found.
   * @param entityType - The type of the target entity ('client' or 'public key').
   * @param entityIdentifier - The identifier of the target entity.
   */
	private warnUnknown(entityType: string, entityIdentifier: Uint8Array): void {
		console.warn(`Received message for unknown ${entityType}`, base58.encode(entityIdentifier));
	}
}
