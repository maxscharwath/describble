import {WebSocket, WebSocketServer} from 'ws';
import {PublicKeyHelper} from './Server';
import {Server} from 'http';

/**
 * The interface for a connection.
 */
export interface Connection {
	/**
	 * Handle incoming data from the connection.
	 */
	onData: (callback: (data: Uint8Array) => void) => void;

	/**
	 * Handle when the connection closes or encounters an error.
	 */
	onClose: (callback: (error: Error) => void) => void;

	/**
	 * Remove all listeners from the connection.
	 */
	off: () => void;

	/**
	 * Send data over the connection.
	 */
	send: (data: Uint8Array) => void;

	/**
	 * Close the connection with a specific cause.
	 */
	close: (cause: string) => void;
}

/**
 * The WebSocketConnection implements the Connection interface using a WebSocket.
 */
export class WebSocketConnection implements Connection {
	/**
	 * The WebSocketConnection constructor.
	 * @param socket - The WebSocket object to wrap.
	 */
	protected constructor(private readonly socket: WebSocket) {}

	/**
	 * Handle incoming data from the connection.
	 */
	public onData(callback: (data: Uint8Array) => void) {
		this.socket.on('message', callback);
	}

	/**
	 * Handle when the connection closes or encounters an error.
	 */
	public onClose(callback: (error: Error) => void) {
		this.socket.on('close', callback);
		this.socket.on('error', callback);
	}

	/**
	 * Remove all listeners from the connection.
	 */
	public off() {
		this.socket.removeAllListeners();
	}

	/**
	 * Close the connection with a specific cause.
	 */
	public close(cause: string) {
		this.socket.close(1000, cause);
		this.socket.terminate();
	}

	/**
	 * Send data over the connection.
	 */
	public send(data: Uint8Array) {
		this.socket.send(data);
	}

	/**
	 * Create a new WebSocketConnection from a url and a public key.
	 */
	public static create(url: string, publicKey: Uint8Array) {
		return new WebSocketConnection(new WebSocket(url, {
			headers: {
				'x-public-key': PublicKeyHelper.encode(publicKey),
			},
		}));
	}

	/**
	 * Create a new WebSocketConnection from an existing WebSocket.
	 */
	public static fromSocket(socket: WebSocket) {
		return new WebSocketConnection(socket);
	}
}

/**
 * Create a WebSocketConnection adapter.
 */
export const webSocketAdapter = (url: string) => (publicKey: Uint8Array) => WebSocketConnection.create(url, publicKey);

/**
 * The interface for a connection server adapter.
 */
export interface ConnectionServerAdapter {
	/**
	 * Handle new connections.
	 */
	onConnection: (callback: (connection: Connection, publicKey: Uint8Array) => void) => void;

	/**
	 * Start listening for new connections.
	 */
	listen: () => void;

	/**
	 * Stop listening for new connections.
	 */
	stop: (callback?: () => void) => void;

	/**
	 * Send data over a connection.
	 */
	send: (socket: Connection, data: Uint8Array) => void;
}

/**
 * The WebSocketServerAdapter implements the ConnectionServerAdapter interface using a WebSocket server.
 */
export class WebSocketServerAdapter implements ConnectionServerAdapter {
	private readonly server: Server;
	private readonly wss: WebSocketServer;

	/**
	 * The WebSocketServerAdapter constructor.
	 * @param config - The configuration for the server (host and port).
	 */
	constructor(private readonly config: {host: string; port: number}) {
		this.server = new Server();
		this.wss = new WebSocketServer({
			server: this.server,
		});
	}

	/**
	 * Handle new connections.
	 */
	onConnection(callback: (socket: Connection, publicKey: Uint8Array) => void) {
		this.wss.on('connection', (ws, req) => {
			const publicKey = PublicKeyHelper.parse(req.headers['x-public-key'] as string);
			const connection = WebSocketConnection.fromSocket(ws);
			callback(connection, publicKey);
		});
	}

	/**
	 * Start listening for new connections.
	 */
	listen() {
		this.server.listen(this.config.port, this.config.host, () => {
			console.log(`Server is listening on ${this.config.host}:${this.config.port}`);
		});
	}

	/**
	 * Stop listening for new connections.
	 */
	stop(callback?: () => void) {
		this.wss.close(() => {
			this.server.close(callback);
		});
	}

	/**
	 * Send data over a connection.
	 */
	send(socket: Connection, data: Uint8Array) {
		socket.send(data);
	}
}
