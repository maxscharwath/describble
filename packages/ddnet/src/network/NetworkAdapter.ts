import {type Connection} from './Connection';

/**
 * NetworkAdapter interface.
 * Contains method signatures for creating connections.
 */
export interface NetworkAdapter {
	/**
   * Creates a new connection.
   * @param publicKey - Public key used for connection.
   * @param clientId - Unique ID for the client.
   * @returns - Connection object.
   */
	createConnection (publicKey: Uint8Array, clientId: Uint8Array): Connection;
}
