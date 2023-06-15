import {type WebSocket} from 'ws';
import {type IncomingMessage} from 'http';
import {verifySignature} from '../utils';
import {PublicKeyHelper} from './Server';
import {encodeMessage, parseBuffer} from './serialization';
import {AuthenticatedMessageSchema, ChallengeMessageSchema, ChallengeResponseMessageSchema} from './schemas';

/**
 * The configuration for client authentication.
 */
type AuthenticateClientConfig = {
	authTimeout: number;
	maxAuthAttempts: number;
};

/**
 * Error codes and corresponding messages used by the Authenticator.
 */
enum ErrorMessages {
	MISSING_PUBLIC_KEY = 'Missing public key',
	AUTH_TIMEOUT = 'Timeout',
	TOO_MANY_TRIES = 'Too many tries',
	INVALID_MESSAGE_TYPE = 'Invalid message type',
}

/**
 * Handles the authentication of a client connection.
 */
class Authenticator {
	private ws!: WebSocket;
	private base58PublicKey!: string;
	private nbTries = 0;
	private timeout?: NodeJS.Timeout;
	private challenge?: Uint8Array;

	/**
	 * Creates an Authenticator instance.
	 * @param config The configuration for client authentication.
	 * @param callback The callback to be invoked upon successful authentication.
	 */
	constructor(
		private readonly config: AuthenticateClientConfig,
		private readonly callback: (ws: WebSocket, publicKey: string) => void,
	) {}

	/**
	 * Initiate authentication of the client.
	 * @param ws The client's WebSocket connection.
	 * @param request The HTTP request from the client.
	 */
	public authenticateClient = (ws: WebSocket, request: IncomingMessage): void => {
		this.ws = ws;
		this.base58PublicKey = request.headers['x-public-key'] as string;
		if (!this.base58PublicKey) {
			return this.ws.close(1008, ErrorMessages.MISSING_PUBLIC_KEY);
		}

		this.timeout = setTimeout(() => this.closeConnection(1008, ErrorMessages.AUTH_TIMEOUT), this.config.authTimeout);

		this.ws.on('message', this.handleResponse);

		void this.sendChallenge();
	};

	/**
	 * Sends a challenge to the client.
	 */
	private readonly sendChallenge = async (): Promise<void> => {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		this.ws.send(await encodeMessage(ChallengeMessageSchema, {type: 'challenge', challenge}));
		this.challenge = challenge;
	};

	/**
	 * Closes the connection.
	 * @param code The WebSocket close code.
	 * @param reason The reason for closing the connection.
	 */
	private readonly closeConnection = (code: number, reason: string): void => {
		clearTimeout(this.timeout);
		this.ws.close(code, reason);
	};

	/**
	 * Sends the authentication status to the client and invokes the callback.
	 */
	private readonly sendAuthStatusAndCallback = async (): Promise<void> => {
		clearTimeout(this.timeout);
		this.ws.removeAllListeners();
		this.ws.send(await encodeMessage(AuthenticatedMessageSchema, {type: 'authenticated'}, false));
		return this.callback(this.ws, this.base58PublicKey);
	};

	/**
	 * Handles the client's response to a challenge.
	 * @param data The client's response data.
	 */
	private readonly handleResponse = async (data: Uint8Array): Promise<void> => {
		if (this.nbTries++ > this.config.maxAuthAttempts) {
			return this.closeConnection(1008, ErrorMessages.TOO_MANY_TRIES);
		}

		const response = await parseBuffer(ChallengeResponseMessageSchema, data);
		if (!response.success) {
			return this.closeConnection(1008, ErrorMessages.INVALID_MESSAGE_TYPE);
		}

		const publicKey = PublicKeyHelper.parse(this.base58PublicKey);
		const {signature} = response.data;
		if (this.challenge && verifySignature(this.challenge, signature, publicKey)) {
			return this.sendAuthStatusAndCallback();
		}

		return this.sendChallenge();
	};
}

/**
 * Exported function for client authentication.
 * @param config The configuration for client authentication.
 * @param callback The callback to be invoked upon successful authentication.
 */
export const authenticateClient = (config: AuthenticateClientConfig, callback: (ws: WebSocket, publicKey: string) => void) =>
	(ws: WebSocket, request: IncomingMessage) => {
		const authenticator = new Authenticator(config, callback);
		authenticator.authenticateClient(ws, request);
	};
