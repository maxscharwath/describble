import {type Connection} from '../Connection';

/**
 * Class for managing connections.
 * It's responsible for maintaining a registry of active connections.
 */
export class ConnectionRegistry {
	private readonly registry = new Map<string, Map<string, Connection>>();

	/**
   * Register a new connection.
   * @param publicKey - The public key of the connection.
   * @param clientId - The client ID of the connection.
   * @param connection - The connection object.
   */
	public registerConnection(publicKey: Uint8Array, clientId: Uint8Array, connection: Connection) {
		// Check if the connection is active.
		if (!connection.isConnected()) {
			console.warn('Connection is not connected');
			return;
		}

		// Convert the public key and client ID to base58 for storage.
		const encodedPublicKey = this.encodeBuffer(publicKey);
		const encodedClientId = this.encodeBuffer(clientId);

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
	public getConnections(publicKey: Uint8Array): Map<string, Connection> | undefined {
		return this.registry.get(this.encodeBuffer(publicKey));
	}

	/**
   * Retrieves a specific connection using the public key and client ID.
   * @param publicKey - The public key to get the connection for.
   * @param clientId - The client ID to get the connection for.
   * @returns - The connection object, or undefined if no such connection exists.
   */
	public getConnection(publicKey: Uint8Array, clientId: Uint8Array): Connection | undefined {
		return this.registry.get(this.encodeBuffer(publicKey))?.get(this.encodeBuffer(clientId));
	}

	/**
   * Removes a specific connection from the registry.
   * If the removed connection was the last one for its public key, the public key is also removed from the registry.
   * @param publicKey - The public key of the connection to be removed.
   * @param clientId - The client ID of the connection to be removed.
   */
	public removeConnection(publicKey: Uint8Array, clientId: Uint8Array) {
		const encodedPublicKey = this.encodeBuffer(publicKey);
		const encodedClientId = this.encodeBuffer(clientId);
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

	private encodeBuffer(buffer: Uint8Array): string {
		return new TextDecoder().decode(buffer);
	}
}
