import {type Connection} from '../Connection';
import {type Network} from './Network';
import {Authenticator} from './Authenticator';
import {verifyMessage} from '../Message';
import {base58, baseHelper, type BufferLike} from 'base-x';

// Helper object for base58 encoding/decoding.
const base58Helper = baseHelper(base58);

/**
 * Class for managing connections.
 * It's responsible for maintaining a registry of active connections.
 */
class ConnectionRegistry {
	private readonly registry = new Map<string, Map<string, Connection>>();

	/**
	 * Register a new connection.
	 * @param publicKey - The public key of the connection.
	 * @param clientId - The client ID of the connection.
	 * @param connection - The connection object.
	 */
	public registerConnection(publicKey: BufferLike, clientId: BufferLike, connection: Connection) {
		// Check if the connection is active.
		if (!connection.isConnected()) {
			console.warn('Connection is not connected');
			return;
		}

		// Convert the public key and client ID to base58 for storage.
		const encodedPublicKey = base58Helper.encode(publicKey);
		const encodedClientId = base58Helper.encode(clientId);

		// Retrieve the connections for the public key.
		const connectionsForPublicKey = this.registry.get(encodedPublicKey);

		// If there are existing connections for the public key, add this connection.
		// Otherwise, create a new map for this public key.
		if (connectionsForPublicKey) {
			connectionsForPublicKey.set(encodedClientId, connection);
		} else {
			this.registry.set(encodedPublicKey, new Map([[encodedClientId, connection]]));
		}

		// If the connection is closed, remove it from the registry.
		connection.on('close', () => {
			this.removeConnection(publicKey, clientId);
		});
	}

	/**
	 * Get all connections for a given public key.
	 * @param publicKey - The public key to get the connections for.
	 * @returns - A map of client IDs to connection objects.
	 */
	public getConnections(publicKey: BufferLike): Map<string, Connection> | undefined {
		return this.registry.get(base58Helper.encode(publicKey));
	}

	/**
	 * Retrieves a specific connection using the public key and client ID.
	 * @param publicKey - The public key to get the connection for.
	 * @param clientId - The client ID to get the connection for.
	 * @returns - The connection object, or undefined if no such connection exists.
	 */
	public getConnection(publicKey: BufferLike, clientId: BufferLike): Connection | undefined {
		return this.registry.get(base58Helper.encode(publicKey))?.get(base58Helper.encode(clientId));
	}

	/**
	 * Removes a specific connection from the registry.
	 * If the removed connection was the last one for its public key, the public key is also removed from the registry.
	 * @param publicKey - The public key of the connection to be removed.
	 * @param clientId - The client ID of the connection to be removed.
	 */
	public removeConnection(publicKey: BufferLike, clientId: BufferLike) {
		const encodedPublicKey = base58Helper.encode(publicKey);
		const encodedClientId = base58Helper.encode(clientId);
		const connectionsForPublicKey = this.registry.get(encodedPublicKey);
		if (connectionsForPublicKey) {
			const connection = connectionsForPublicKey.get(encodedClientId);
			if (connection) {
				connection.close('Client disconnected');
				connectionsForPublicKey.delete(encodedClientId);
				// If there are no more connections for this public key, remove the public key from the registry.
				if (connectionsForPublicKey.size === 0) {
					this.registry.delete(encodedPublicKey);
				}
			}
		}
	}

	/**
	 * Iterate over each connection in the registry.
	 * @param callback - The function to call for each connection.
	 */
	public forEach(callback: (connection: Connection) => void) {
		this.registry.forEach(connectionsForPublicKey => {
			connectionsForPublicKey.forEach(callback);
		});
	}
}

/**
 * Configuration object for the SignalingServer.
 */
type SignalingServerConfig = {
	network: Network; // The network to use for communication
};

/**
 * Class representing a signaling server.
 */
export class SignalingServer {
	private readonly registry = new ConnectionRegistry();
	private readonly network: Network;

	public constructor({network}: SignalingServerConfig) {
		this.network = network;
		const authenticator = new Authenticator(network);

		// Once a connection is authenticated, register it in the registry
		// and set up a listener for incoming data.
		authenticator.on('authenticated', ({publicKey, clientId, connection}) => {
			this.registry.registerConnection(publicKey, clientId, connection);
			connection.on('data', async data => this.handleMessage(data, connection));
		});
	}

	/**
	 * Begin listening for connections.
	 */
	public async listen() {
		return this.network.listen();
	}

	/**
	 * Close the server and all active connections.
	 */
	public async close() {
		return this.network.close();
	}

	/**
	 * Handle an incoming message.
	 * @param data - The message data.
	 * @param from - The connection the message was received from.
	 */
	private async handleMessage(data: Uint8Array, from: Connection) {
		const {verified, message} = verifyMessage(data);

		// If the message isn't valid, log a warning and return.
		if (!verified) {
			console.warn('Received invalid message', message);
			return;
		}

		const {publicKey, clientId} = message.to ?? {};

		// Check if the message has a target public key.
		if (publicKey) {
			// If it has a client ID, it's a direct message.
			if (clientId) {
				const connection = this.registry.getConnection(publicKey, clientId);
				if (connection) {
					this.network.send(connection, data);
				} else {
					console.warn('Received message for unknown client', base58Helper.encode(clientId));
				}
			} else { // Broadcast message to all connections for the public key except the sender
				const connections = this.registry.getConnections(publicKey);
				if (connections) {
					connections.forEach(connection => {
						if (connection !== from) {
							this.network.send(connection, data);
						}
					});
				} else {
					console.warn('Received message for unknown public key', base58Helper.encode(publicKey));
				}
			}
		} else {
			// Broadcast message to all connections except the sender
			this.registry.forEach(connection => {
				if (connection !== from) {
					this.network.send(connection, data);
				}
			});
		}
	}
}
