import Emittery from 'emittery';
import {type Connection, WebSocketConnection} from '../Connection';
import {Server} from 'http';
import {WebSocketServer} from 'ws';

/**
 * Events emitted by the Network class.
 */
type NetworkEvents = {
	/**
	 * This event is emitted when a new connection is made to the network.
	 * Note: The connection is not yet authenticated at this point and should not be trusted.
	 */
	connection: {publicKey: string; clientId: string; connection: Connection};
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

/**
 * WebSocketNetwork is an implementation of the Network abstract class using WebSockets.
 */
export class WebSocketNetwork extends Network {
	private readonly server: Server;
	private readonly wss: WebSocketServer;

	/**
	 * The WebSocketNetwork constructor.
	 * @param config - The configuration object containing the host and port to listen on.
	 */
	public constructor(private readonly config: {host: string; port: number}) {
		super();

		this.server = new Server();
		this.wss = new WebSocketServer({
			server: this.server,
		});

		// Listen for 'connection' events on the WebSocketServer.
		this.wss.on('connection', (ws, req) => {
			const publicKey = req.headers['x-public-key'] as string;
			const clientId = req.headers['x-client-id'] as string;

			// Create a new WebSocketConnection from the WebSocket object.
			const connection = WebSocketConnection.fromSocket(ws);

			// Emit the 'connection' event.
			void this.emit('connection', {publicKey, clientId, connection});
		});
	}

	/**
	 * Start listening for connections on the configured host and port.
	 * @returns A promise that resolves when the server starts listening.
	 */
	public async listen() {
		return new Promise<void>(resolve => {
			this.server.listen(this.config.port, this.config.host, () => {
				resolve();
			});
		});
	}

	/**
	 * Close the WebSocketServer and the underlying HTTP server.
	 * @returns A promise that resolves when the server is closed.
	 */
	public async close() {
		return new Promise<void>((resolve, reject) => {
			this.wss.close(error => {
				if (error) {
					reject(error);
				} else {
					this.server.close(error => {
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					});
				}
			});
		});
	}

	/**
	 * Send data through a specific connection.
	 * @param connection - The connection through which the data should be sent.
	 * @param data - The data to send.
	 */
	public send(connection: Connection, data: Uint8Array) {
		connection.send(data);
	}
}
