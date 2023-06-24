import Emittery from 'emittery';
import {type Connection} from './Connection';

/**
 * Events emitted by the Network class.
 */
type NetworkEvents = {
	/**
   * This event is emitted when a new connection is made to the network.
   * Note: The connection is not yet authenticated at this point and should not be trusted.
   */
	connection: {publicKey: Uint8Array; clientId: Uint8Array; connection: Connection};
};

/**
 * The Network class represents a network that can listen for connections, send data, and close connections.
 * It is an abstract class and should be extended for specific network implementations.
 */
export abstract class Network extends Emittery<NetworkEvents> {
	/**
   * Start listening for connections.
   * This method should be implemented by subclasses.
   */
	abstract listen(): Promise<void>;

	/**
   * Close the network.
   * This method should be implemented by subclasses.
   */
	abstract close(): Promise<void>;

	/**
   * Send data through a specific connection.
   * This method should be implemented by subclasses.
   * @param connection - The connection through which the data should be sent.
   * @param data - The data to send.
   */
	abstract send(connection: Connection, data: Uint8Array): void;
}

