import Emittery from 'emittery';

/**
 * Events that a connection might emit
 */
type ConnectionEvents = {
	data: Uint8Array;
	close: Error;
};

/**
 * Abstract class Connection. This serves as a blueprint for creating more specific types of connections.
 * It extends the Emittery class, allowing it to emit events of the types defined in ConnectionEvents.
 */
export abstract class Connection extends Emittery<ConnectionEvents> {
	/**
   * Send data through the connection. The specifics are left to the concrete classes that extend Connection.
   * @param data - The data to be sent.
   */
	public abstract send(data: Uint8Array): void;

	/**
   * Close the connection for a specific reason. The specifics are left to the concrete classes that extend Connection.
   * @param cause - The reason for closing the connection.
   */
	public abstract close(cause: string): void;

	/**
   * Check if the connection is currently active. The specifics are left to the concrete classes that extend Connection.
   */
	public abstract isConnected(): boolean;
}

