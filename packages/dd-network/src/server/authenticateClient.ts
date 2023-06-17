import {PublicKeyHelper, verifySignature} from '../utils';
import {encodeMessage, safeParseBuffer} from './serialization';
import {AuthenticatedMessageSchema, ChallengeMessageSchema, ChallengeResponseMessageSchema} from './schemas';
import {type Connection} from './adapter';

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
	private connection!: Connection;
	private publicKey!: Uint8Array;
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
		private readonly callback: (connection: Connection, publicKey: Uint8Array) => void,
	) {}

	/**
	 * Initiate authentication of the client.
	 * @param connection The client connection.
	 * @param publicKey The client's public key.
	 */
	public authenticateClient = (connection: Connection, publicKey: Uint8Array): void => {
		this.connection = connection;
		this.publicKey = publicKey;
		if (!this.publicKey) {
			return this.connection.close(ErrorMessages.MISSING_PUBLIC_KEY);
		}

		this.timeout = setTimeout(() => this.closeConnection(ErrorMessages.AUTH_TIMEOUT), this.config.authTimeout);

		this.connection.onData(this.handleResponse);

		void this.sendChallenge();
	};

	/**
	 * Sends a challenge to the client.
	 */
	private readonly sendChallenge = async (): Promise<void> => {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		this.connection.send(await encodeMessage(ChallengeMessageSchema, {type: 'challenge', challenge}));
		this.challenge = challenge;
	};

	/**
	 * Closes the connection.
	 * @param reason The reason for closing the connection.
	 */
	private readonly closeConnection = (reason: string): void => {
		clearTimeout(this.timeout);
		this.connection.close(reason);
	};

	/**
	 * Sends the authentication status to the client and invokes the callback.
	 */
	private readonly sendAuthStatusAndCallback = async (): Promise<void> => {
		clearTimeout(this.timeout);
		this.connection.off();
		this.connection.send(await encodeMessage(AuthenticatedMessageSchema, {type: 'authenticated'}, false));
		return this.callback(this.connection, this.publicKey);
	};

	/**
	 * Handles the client's response to a challenge.
	 * @param data The client's response data.
	 */
	private readonly handleResponse = async (data: Uint8Array): Promise<void> => {
		if (this.nbTries++ > this.config.maxAuthAttempts) {
			return this.closeConnection(ErrorMessages.TOO_MANY_TRIES);
		}

		const response = await safeParseBuffer(ChallengeResponseMessageSchema, data);
		if (!response.success) {
			return this.closeConnection(ErrorMessages.INVALID_MESSAGE_TYPE);
		}

		const publicKey = PublicKeyHelper.parse(this.publicKey);
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
export const authenticateClient = (config: AuthenticateClientConfig, callback: (connection: Connection, publicKey: Uint8Array) => void) =>
	(connection: Connection, publicKey: Uint8Array): void => {
		const authenticator = new Authenticator(config, callback);
		return authenticator.authenticateClient(connection, publicKey);
	};
