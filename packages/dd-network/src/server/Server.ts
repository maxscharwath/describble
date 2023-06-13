import {type WebSocket, WebSocketServer} from 'ws';
import {verifySignature} from '../utils';
import base58 from 'bs58';
import {Server, type IncomingMessage} from 'http';
import crypto from 'crypto';
import * as cbor from 'cbor-x';

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
	parse: (publicKey: PublicKey) => typeof publicKey === 'string' ? base58.decode(publicKey) : publicKey,

	/**
	 * Encodes a public key.
	 * If the key is a string, it's returned as is,
	 * otherwise it's encoded to base58.
	 * @param publicKey - The public key to encode
	 */
	encode: (publicKey: PublicKey) => typeof publicKey === 'string' ? publicKey : base58.encode(publicKey),
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
		this.wss.on('connection', (ws, request) => {
			this.authenticateClient(ws, request, (ws, publicKey) => {
				this.addConnection(publicKey, ws);
			});
		});
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

	/**
	 * Authenticate a client using a WebSocket and a request.
	 * If authentication is successful, the provided callback is called.
	 * @param ws - The WebSocket used for the authentication process
	 * @param request - The request containing the public key for authentication
	 * @param callback - The callback to call if authentication is successful
	 */
	private authenticateClient(ws: WebSocket, request: IncomingMessage, callback: (ws: WebSocket, publicKey: PublicKey) => void) {
		const base58PublicKey = request.headers['x-public-key'];
		if (!base58PublicKey || typeof base58PublicKey !== 'string') {
			ws.close(1008, 'Missing public key');
			return;
		}

		const publicKey = PublicKeyHelper.parse(base58PublicKey);
		let nbTries = 0;
		const timeout = setTimeout(() => {
			ws.close(1008, 'Authentication timeout');
		}, this.config.authTimeout);
		let challenge = this.createChallenge();

		ws.on('message', (data: Uint8Array) => {
			if (nbTries++ > this.config.maxAuthAttempts) {
				clearTimeout(timeout);
				ws.close(1008, 'Too many tries');
				return;
			}

			const {type, signature} = cbor.decode(data) as {type: string; signature: Uint8Array};

			if (type !== 'challenge-response') {
				clearTimeout(timeout);
				ws.close(1008, 'Invalid message type');
				return;
			}

			if (verifySignature(challenge, signature, publicKey)) {
				clearTimeout(timeout);
				ws.removeAllListeners();
				ws.send(cbor.encode({
					type: 'authenticated',
				}));
				return callback(ws, base58PublicKey);
			}

			challenge = this.createChallenge();
			ws.send(cbor.encode({
				type: 'challenge',
				challenge,
			}));
		});
		ws.send(cbor.encode({
			type: 'challenge',
			challenge,
		}));
	}

	/**
	 * Creates a random challenge for the authentication process.
	 */
	private createChallenge() {
		return crypto.randomBytes(32);
	}

	private addConnection(publicKey: PublicKey, ws: WebSocket) {
		const address = PublicKeyHelper.encode(publicKey);
		let client = this.clients.get(address);
		if (!client) {
			console.log(`New client: ${address}`);
			client = new Client(address);
			client.setMessageHandler((ws, data) => {
				this.handleMessage(client!, ws, data);
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

	private handleMessage(client: Client, ws: WebSocket, data: Uint8Array) {
		const {type, to, data: message} = cbor.decode(data) as {type: string; to: Uint8Array; data: Uint8Array};
		const address = PublicKeyHelper.encode(to);
		const toClient = this.clients.get(address);
		if (!toClient) {
			console.log(`Client ${address} not found`);
			return;
		}

		toClient.broadcast(cbor.encode({
			type,
			from: client.public,
			data: message,
		}));
	}
}
