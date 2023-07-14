import WebSocket from 'isomorphic-ws';
import {base58} from '@describble/base-x';
import {Connection} from '../Connection';

/**
 * Class that represents a connection via WebSocket.
 * It extends the abstract class Connection, providing concrete implementation of its abstract methods.
 */
export class WebSocketConnection extends Connection {
	/**
   * The WebSocketConnection constructor.
   * @param socket - The WebSocket object to wrap.
   */
	protected constructor(private readonly socket: WebSocket) {
		super();
		this.socket.binaryType = 'arraybuffer';

		// Setup event listeners for the WebSocket events
		this.socket.onmessage = event => {
			// Emit a 'message' event whenever a message event is received from the socket
			void this.emit('data', new Uint8Array(event.data as ArrayBuffer));
		};

		this.socket.onclose = event => {
			// Emit a 'close' event whenever a close event is received from the socket
			void this.emit('close', new Error(event.reason));
		};

		this.socket.onerror = event => {
			// Emit a 'close' event whenever an error event is received from the socket
			void this.emit('close', event.error as Error);
		};
	}

	/**
   * Close the WebSocket connection for a specific reason.
   * @param cause - The reason for closing the connection.
   */
	public close(cause: string): void {
		// Close the socket connection and remove all listeners
		this.socket.close(1000, cause);
		this.clearListeners();
	}

	/**
   * Send data through the WebSocket connection.
   * @param data - The data to be sent.
   */
	public send(data: Uint8Array): void {
		this.socket.send(data);
	}

	/**
   * Check if the WebSocket connection is currently active.
   */
	public isConnected(): boolean {
		// The connection is open if the readyState of the socket is OPEN
		return this.socket.readyState === WebSocket.OPEN;
	}

	/**
   * Create a new WebSocketConnection from an url, a public key, and a client id.
   * @param url - The URL to connect to.
   * @param publicKey - The public key to use.
   * @param clientId - The client id to use.
   */
	public static create(url: string, publicKey: Uint8Array, clientId: Uint8Array) {
		// Create a new WebSocketConnection by wrapping a new WebSocket object
		const urlObject = new URL(url);
		urlObject.searchParams.set('publicKey', base58.encode(publicKey));
		urlObject.searchParams.set('clientId', base58.encode(clientId));
		return new WebSocketConnection(new WebSocket(urlObject));
	}

	/**
   * Create a new WebSocketConnection from an existing WebSocket.
   * @param socket - The existing WebSocket to wrap.
   */
	public static fromSocket(socket: WebSocket) {
		return new WebSocketConnection(socket);
	}
}
