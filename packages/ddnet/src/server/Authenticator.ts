import Emittery from 'emittery';
import {type Connection} from '../Connection';
import {type Network} from './Network';
import {sha256} from '@noble/hashes/sha256';
import * as secp256k1 from '@noble/secp256k1';
import {decode, encode} from 'cbor-x';

// Defining the different types of messages that can be sent during the authentication process.
type ChallengeMessage = {type: 'challenge'; challenge: Uint8Array};
type ValidationMessage = {type: 'validation'; message: string};
type ChallengeResponseMessage = {type: 'challenge-response'; signature: Uint8Array};

/**
 * Configurations for the authenticator.
 */
type AuthenticatorConfig = {
	authenticatorTimeout?: number;
};

/**
 * Events emitted by the Authenticator.
 */
type AuthenticatorEvents = {
	authenticated: {publicKey: Uint8Array; clientId: Uint8Array; connection: Connection};
};

/**
 * The Authenticator is a helper class that can be used to authenticate incoming connections.
 * It handles the authentication process by sending a challenge to the client, then verifying the response.
 * The connection is considered authenticated and trusted if the response is valid.
 * If the response is invalid, the connection is closed.
 */
export class Authenticator extends Emittery<AuthenticatorEvents> {
	/**
	 * The Authenticator constructor.
	 * @param network - The network object to be used.
	 * @param authenticatorTimeout - The timeout duration for the authentication process. Default is 10,000 ms.
	 */
	public constructor(private readonly network: Network, {authenticatorTimeout = 10000}: AuthenticatorConfig = {}) {
		super();

		// Listen to the 'connection' event of the network object.
		this.network.on('connection', async ({publicKey, clientId, connection}) => {
			// Send a challenge to the client.
			const challenge = this.sendChallenge(connection);

			// Setup a timer to close the connection if no response is received within the timeout duration.
			const timeoutId = setTimeout(() => {
				connection.close('Handshake timeout, did not receive response in time');
			}, authenticatorTimeout);

			// Wait for the client's response.
			void connection.once('data').then(response => {
				clearTimeout(timeoutId);

				// Verify the client's response.
				if (this.verifyResponse(challenge, response, publicKey)) {
					this.sendValidations(connection);

					// Emit the 'authenticated' event if the response is valid.
					void this.emit('authenticated', {publicKey, clientId, connection});
				} else {
					// Close the connection if the response is invalid.
					connection.close('Signature verification failed, signature does not match public key');
				}
			});
		});
	}

	/**
	 * Generate a random challenge and send it to the client.
	 * @param connection - The connection object representing the client's connection.
	 * @returns - The challenge sent to the client.
	 */
	private sendChallenge(connection: Connection) {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		connection.send(encode({
			type: 'challenge',
			challenge,
		} as ChallengeMessage));
		return challenge;
	}

	/**
	 * Verify the client's response.
	 * @param challenge - The challenge sent to the client.
	 * @param response - The client's response.
	 * @param publicKey - The client's public key.
	 * @returns - true if the response is valid; false otherwise.
	 */
	private verifyResponse(challenge: Uint8Array, response: Uint8Array, publicKey: Uint8Array) {
		const {type, signature} = decode(response) as ChallengeResponseMessage;
		if (type !== 'challenge-response') {
			return false;
		}

		return secp256k1.verify(signature, sha256(challenge), publicKey);
	}

	/**
	 * Send a validation message to the client.
	 * @param connection - The connection object representing the client's connection.
	 */
	private sendValidations(connection: Connection) {
		connection.send(encode({
			type: 'validation',
			message: 'Authentication successful',
		} satisfies ValidationMessage));
	}
}
