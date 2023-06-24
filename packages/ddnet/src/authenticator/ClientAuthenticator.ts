import {Authenticator} from './Authenticator';
import {createSignature} from '../crypto';
import {type Connection} from '../network';

/**
 * The ClientAuthenticator is a helper class that can be used to authenticate client connections.
 * It handles the authentication process by responding to a server challenge and waiting for server validation.
 */
export class ClientAuthenticator extends Authenticator {
	/**
   * The ClientAuthenticator constructor.
   * @param privateKey - The client's private key.
   */
	public constructor(private readonly privateKey: Uint8Array) {
		super();
	}

	/**
   * Authentication methode to verify the client's identity by using a challenge-response mechanism.
   * @param connection - The connection object representing the client's connection.
   * @returns - A promise that resolves to the connection if authentication is successful.
   */
	async authenticate(connection: Connection): Promise<Connection> {
		return new Promise((resolve, reject) => {
			const handleClose = connection.once('close');

			const cleanup = (callback: () => void) => {
				handleClose.off();
				unsubHandleData();
				callback();
			};

			const handleData = async (data: Uint8Array) => {
				const message = await this.decodeData(data);

				switch (message.type) {
					case 'challenge':
						try {
							const signature = await createSignature(message.challenge, this.privateKey);
							await this.sendData(connection, {type: 'challenge-response', signature});
						} catch (error) {
							connection.close('Failed to sign challenge');
							cleanup(() => reject(error));
						}

						break;
					case 'validation':
						cleanup(() => resolve(connection));
						break;
					default:
						connection.close('Invalid message type');
						cleanup(() => reject(new Error('Invalid message type')));
				}
			};

			void handleClose.then(cause => {
				cleanup(() => reject(new Error('Connection closed before authentication could be completed', {cause})));
			});

			// Subscribe to 'data' event and keep reference to unsubscribe function.
			const unsubHandleData = connection.on('data', handleData);
		});
	}
}
