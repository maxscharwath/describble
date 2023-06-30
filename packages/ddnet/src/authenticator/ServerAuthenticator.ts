import type {Connection, Network} from '../network';
import {Authenticator} from './Authenticator';
import {verifySignature} from '../crypto';

/**
 * Events emitted by the Authenticator.
 */
type AuthenticatorEvents = {
	authenticated: {publicKey: Uint8Array; clientId: Uint8Array; connection: Connection};
};

/**
 * Configurations for the authenticator.
 */
type AuthenticatorConfig = {
	authenticatorTimeout?: number;
};

/**
 * The Authenticator is a helper class that can be used to authenticate incoming connections.
 * It handles the authentication process by sending a challenge to the client, then verifying the response.
 * The connection is considered authenticated and trusted if the response is valid.
 * If the response is invalid, the connection is closed.
 */
export class ServerAuthenticator extends Authenticator<AuthenticatorEvents> {
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
			const challenge = await this.sendChallenge(connection);

			// Set up a timer to close the connection if no response is received within the timeout duration.
			const timeoutId = setTimeout(() => {
				connection.close('Handshake timeout, did not receive response in time');
			}, authenticatorTimeout);

			// Wait for the client's response.
			void connection.once('data').then(async response => {
				clearTimeout(timeoutId);

				// Verify the client's response.
				if (await this.verifyResponse(challenge, response, publicKey)) {
					await this.sendValidations(connection);

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
	private async sendChallenge(connection: Connection) {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		await this.sendData(connection, {
			type: 'challenge',
			challenge,
		});
		return challenge;
	}

	/**
   * Verify the client's response.
   * @param challenge - The challenge sent to the client.
   * @param response - The client's response.
   * @param publicKey - The client's public key.
   * @returns - true if the response is valid; false otherwise.
   */
	private async verifyResponse(challenge: Uint8Array, response: Uint8Array, publicKey: Uint8Array) {
		const message = await this.decodeData(response);
		if (message.type !== 'challenge-response') {
			return false;
		}

		return verifySignature(challenge, message.signature, publicKey);
	}

	/**
   * Send a validation message to the client.
   * @param connection - The connection object representing the client's connection.
   */
	private async sendValidations(connection: Connection) {
		return this.sendData(connection, {
			type: 'validation',
			message: 'Authentication successful',
		});
	}
}
