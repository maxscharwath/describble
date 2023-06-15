import {type WebSocket, WebSocketServer} from 'ws';
import base58 from 'bs58';
import {Server} from 'http';
import {authenticateClient} from './authenticateClient';
import {encodeMessage, parseBuffer} from './serialization';
import {EncryptedMessageSchema} from './schemas';

type PublicKey = Uint8Array | string;

/**
 * Helper for public key operations
 */
export const PublicKeyHelper = {
	/**
	 * Parses a public key.
	 * If the key is a string, it's decoded from base58,
	 * otherwise the original Uint8Array is returned.
	 * @param publicKey - The public key to parse
	 */
	parse: (publicKey: PublicKey): Uint8Array =>
		typeof publicKey === 'string' ? base58.decode(publicKey) : publicKey,

	/**
	 * Encodes a public key.
	 * If the key is a string, it's returned as is,
	 * otherwise it's encoded to base58.
	 * @param publicKey - The public key to encode
	 */
	encode: (publicKey: PublicKey): string =>
		typeof publicKey === 'string' ? publicKey : base58.encode(publicKey),
};

/**
 * Class for representing a client.
 */
class Client {
	private readonly publicKey: Uint8Array;
	private readonly sockets = new Set<WebSocket>();
	private messageHandler?: (socket: WebSocket, data: Uint8Array) => void;

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
	 * @param ws - The WebSocket to add
	 */
	addSocket(ws: WebSocket) {
		this.sockets.add(ws);
		ws.on('message', (data: Uint8Array) => {
			this.messageHandler?.(ws, data);
		});
		ws.on('close', () => {
			this.removeSocket(ws);
		});
	}

	/**
	 * Removes a WebSocket from the client's set of sockets.
	 * @param ws - The WebSocket to remove
	 */
	removeSocket(ws: WebSocket) {
		this.sockets.delete(ws);
	}

	get numSockets() {
		return this.sockets.size;
	}

	setMessageHandler(handler: (socket: WebSocket, data: Uint8Array) => void) {
		this.messageHandler = handler;
	}

	broadcast(data: Uint8Array) {
		for (const socket of this.sockets) {
			socket.send(data);
		}
	}
}

type SignalingServerConfig = {
	host: string;
	port: number;
	maxAuthAttempts: number;
	authTimeout: number;
};

/**
 * Class for the signaling server.
 */
export class SignalingServer {
	private readonly server: Server;
	private readonly wss: WebSocketServer;
	private readonly clients = new Map<string, Client>();
	private readonly config: SignalingServerConfig;

	/**
	 * Create a new signaling server.
	 */
	constructor(config: Partial<SignalingServerConfig> = {}) {
		this.config = {
			host: '0.0.0.0',
			port: 8080,
			maxAuthAttempts: 3,
			authTimeout: 10000,
			...config,
		};
		this.server = new Server();
		this.wss = new WebSocketServer({
			server: this.server,
		});
		this.wss.on('connection', authenticateClient(this.config, (ws, publicKey) => {
			this.addConnection(publicKey, ws);
		}));
	}

	/**
	 * Starts the server listening for connections.
	 */
	public listen() {
		this.server.listen(this.config.port, this.config.host, () => {
			console.log(`Server is listening on ${this.config.host}:${this.config.port}`);
		});
	}

	/**
	 * Stops the server from listening for new connections.
	 * This will not disconnect any existing connections.
	 */
	public stop(callback?: () => void) {
		this.wss.close(() => {
			this.server.close(callback);
		});
	}

	private addConnection(publicKey: PublicKey, ws: WebSocket) {
		const address = PublicKeyHelper.encode(publicKey);
		let client = this.clients.get(address);
		if (!client) {
			console.log(`New client: ${address}`);
			client = new Client(address);
			client.setMessageHandler((ws, data) => {
				void this.handleMessage(client!, ws, data);
			});
			this.clients.set(address, client);
		}

		client.addSocket(ws);
	}

	private removeConnection(publicKey: PublicKey, ws: WebSocket) {
		const address = PublicKeyHelper.encode(publicKey);
		const client = this.clients.get(address);
		if (client) {
			client.removeSocket(ws);
			if (client.public === publicKey && client.numSockets === 0) {
				this.clients.delete(address);
			}
		}
	}

	private async handleMessage(client: Client, ws: WebSocket, data: Uint8Array) {
		const message = await parseBuffer(EncryptedMessageSchema, data);
		if (!message.success) {
			console.error('Could not decode incoming message', message.error);
			return;
		}

		const address = PublicKeyHelper.encode(message.data.to);
		const toClient = this.clients.get(address);
		if (!toClient) {
			console.log(`Client ${address} not found`);
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
