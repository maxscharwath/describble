import {authenticateClient} from './authenticateClient';
import {encodeMessage, safeParseBuffer} from './serialization';
import {EncryptedMessageSchema} from './schemas';
import {type Connection, type ConnectionServerAdapter} from './adapter';
import {type PublicKey, PublicKeyHelper} from '../utils';

/**
 * Class for representing a client.
 */
class Client {
	private readonly publicKey: Uint8Array;
	private readonly sockets = new Set<Connection>();
	private messageHandler?: (connection: Connection, data: Uint8Array) => void;

	/**
   * Create a new client.
   * @param publicKey - The public key of the client
   */
	constructor(publicKey: PublicKey) {
		this.publicKey = PublicKeyHelper.parse(publicKey);
	}

	/**
   * Get the client's public key.
   */
	get public() {
		return this.publicKey;
	}

	/**
   * Adds a WebSocket to the client's set of sockets.
   * Also removes the socket from the set when it closes.
   * @param connection - The Connection to add
   */
	addSocket(connection: Connection) {
		this.sockets.add(connection);
		connection.onData((data: Uint8Array) => {
			this.messageHandler?.(connection, data);
		});
		connection.onClose(() => {
			this.removeSocket(connection);
		});
	}

	/**
   * Removes a WebSocket from the client's set of sockets.
   * @param connection - The Connection to remove
   */
	removeSocket(connection: Connection) {
		this.sockets.delete(connection);
	}

	get numSockets() {
		return this.sockets.size;
	}

	setMessageHandler(handler: (connection: Connection, data: Uint8Array) => void) {
		this.messageHandler = handler;
	}

	broadcast(data: Uint8Array) {
		for (const socket of this.sockets) {
			socket.send(data);
		}
	}
}

type SignalingServerConfig = {
	maxAuthAttempts?: number;
	authTimeout?: number;
	adapter: ConnectionServerAdapter;
};

/**
 * Class for the signaling server.
 */
export class SignalingServer {
	private readonly adapter: ConnectionServerAdapter;
	private readonly clients = new Map<string, Client>();
	private readonly config: Required<Omit<SignalingServerConfig, 'adapter'>>;

	/**
   * Create a new signaling server.
   */
	constructor({adapter, ...config}: SignalingServerConfig) {
		this.config = {
			maxAuthAttempts: 3,
			authTimeout: 10000,
			...config,
		};
		this.adapter = adapter;
		this.adapter.onConnection(authenticateClient(this.config, (connection, publicKey) => {
			this.addConnection(publicKey, connection);
		}));
	}

	/**
   * Starts the server listening for connections.
   */
	public listen() {
		this.adapter.listen();
	}

	/**
   * Stops the server from listening for new connections.
   */
	public async stop() {
		return this.adapter.stop();
	}

	private addConnection(publicKey: PublicKey, connection: Connection) {
		const address = PublicKeyHelper.encode(publicKey);
		let client = this.clients.get(address);
		if (!client) {
			client = new Client(address);
			client.setMessageHandler((connection, data) => {
				void this.handleMessage(client!, connection, data);
			});
			this.clients.set(address, client);
		}

		client.addSocket(connection);
	}

	private removeConnection(publicKey: PublicKey, connection: Connection) {
		const address = PublicKeyHelper.encode(publicKey);
		const client = this.clients.get(address);
		if (client) {
			client.removeSocket(connection);
			if (client.public === publicKey && client.numSockets === 0) {
				this.clients.delete(address);
			}
		}
	}

	private async handleMessage(client: Client, _connection: Connection, data: Uint8Array) {
		const message = await safeParseBuffer(EncryptedMessageSchema, data);
		if (!message.success) {
			console.error('Could not decode incoming message', message.error);
			return;
		}

		const address = PublicKeyHelper.encode(message.data.to);
		const toClient = this.clients.get(address);
		if (!toClient) {
			console.warn(`Client ${address} not found`);
			return;
		}

		toClient.broadcast(await encodeMessage(EncryptedMessageSchema, {
			type: message.data.type,
			from: client.public,
			to: toClient.public,
			data: message.data.data,
		}));
	}
}
