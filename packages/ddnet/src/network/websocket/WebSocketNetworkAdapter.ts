import {type Connection} from '../Connection';
import {WebSocketConnection} from './WebSocketConnection';
import {type NetworkAdapter} from '../NetworkAdapter';

/**
 * Class implementing NetworkAdapter interface with WebSocket connections.
 */
export class WebSocketNetworkAdapter implements NetworkAdapter {
	/**
   * Constructor for WebsocketAdapter.
   * @param url - URL to establish WebSocket connection.
   */
	public constructor(private readonly url: string) {
	}

	/**
   * Creates a new WebSocket connection.
   * @param publicKey - Public key used for connection.
   * @param clientId - Unique ID for the client.
   * @returns - WebSocketConnection object.
   */
	public createConnection(publicKey: Uint8Array, clientId: Uint8Array): Connection {
		return WebSocketConnection.create(this.url, publicKey, clientId);
	}
}
