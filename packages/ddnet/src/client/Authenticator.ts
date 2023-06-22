import {sha256} from '@noble/hashes/sha256';
import * as secp256k1 from '@noble/secp256k1';
import {decode, encode} from 'cbor-x';
import {type Connection} from '../Connection';

// Define the different types of messages that can be used during the authentication process.
type ChallengeMessage = {type: 'challenge'; challenge: Uint8Array};
type ValidationMessage = {type: 'validation'; message: string};
type ChallengeResponseMessage = {type: 'challenge-response'; signature: Uint8Array};

/**
 * Authentication function to verify the client's identity by using a challenge-response mechanism.
 * @param connection - The connection object representing the client's connection.
 * @param privateKey - The client's private key.
 * @returns - A promise that resolves to the connection if authentication is successful.
 */
export async function authenticate(connection: Connection, privateKey: Uint8Array): Promise<Connection> {
	return new Promise((resolve, reject) => {
		// Listen for the 'close' event on the connection once.
		const promiseClose = connection.once('close');

		// Listen for the 'data' event on the connection.
		const unsubscribe = connection.on('data', async data => {
			// Decode the received data into a message.
			const message = decode(data) as ChallengeMessage | ValidationMessage;

			// Handle different types of messages.
			switch (message.type) {
				case 'challenge':
					try {
						// Sign the challenge using the client's private key.
						const signature = (await secp256k1.signAsync(sha256(message.challenge), privateKey)).toCompactRawBytes();

						// Send a response back to the server with the signed challenge.
						connection.send(encode({
							type: 'challenge-response',
							signature,
						} as ChallengeResponseMessage));
					} catch (error) {
						// Close the connection if there's an error when signing the challenge.
						connection.close('Failed to sign challenge');
						reject(error);
					}

					break;
				case 'validation':
					// Stop listening for data and close events once authentication is successful.
					unsubscribe();
					promiseClose.off();

					// Resolve the promise with the connection.
					resolve(connection);
					break;
				default:
					// Close the connection and reject the promise if an invalid message type is received.
					connection.close('Invalid message type');
					reject(new Error('Invalid message type'));
			}
		});

		// Reject the promise if the connection is closed before authentication could be completed.
		void promiseClose.then(cause => {
			unsubscribe();
			reject(new Error('Connection closed before authentication could be completed', {cause}));
		});
	});
}
