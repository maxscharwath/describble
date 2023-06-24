import {type Connection} from '../Connection';
import {Server} from 'http';
import {WebSocketServer} from 'ws';
import {base58} from 'base-x';
import {Network} from '../Network';
import {WebSocketConnection} from './WebSocketConnection';

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
			// Public key and client ID are sent as headers in base58 encoding.
			const publicKey = base58.decode(req.headers['x-public-key'] as string);
			const clientId = base58.decode(req.headers['x-client-id'] as string);

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
