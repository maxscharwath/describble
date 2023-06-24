import Emittery from 'emittery';
import {type Connection} from '../Connection';
import {z} from 'zod';
import {decode, encode} from 'cbor-x';

/**
 * Define the structure of a challenge message using Zod schema.
 */
const challengeMessageSchema = z.object({
	type: z.literal('challenge'),
	challenge: z.instanceof(Uint8Array),
});

/**
 * Define the structure of a validation message using Zod schema.
 */
const validationMessageSchema = z.object({
	type: z.literal('validation'),
	message: z.string(),
});

/**
 * Define the structure of a challenge response message using Zod schema.
 */
const challengeResponseMessageSchema = z.object({
	type: z.literal('challenge-response'),
	signature: z.instanceof(Uint8Array),
});

/**
 * The Authenticator is a helper class that can authenticate incoming connections.
 * It sends a challenge to the client and verifies the response.
 * If the response is valid, the connection is considered authenticated and trusted.
 * If the response is invalid, the connection is closed.
 */
export abstract class Authenticator<T={}> extends Emittery<T> {
	// A verifier that validates messages based on predefined schemas.
	protected readonly verifier = z.discriminatedUnion('type', [challengeMessageSchema, validationMessageSchema, challengeResponseMessageSchema]);

	/**
   * Sends a validated message to a connection. The data to send is validated using the predefined verifier.
   *
   * @param connection - The connection to send the message to.
   * @param data - The data to send.
   */
	protected async sendData(connection: Connection, data: z.infer<typeof this.verifier>) {
		connection.send(encode(await this.verifier.parseAsync(data)));
	}

	/**
   * Decodes and validates incoming data.
   * The decoded data is validated using the predefined verifier.
   *
   * @param data - The data to decode and validate.
   * @returns - The decoded and validated data.
   */
	protected async decodeData(data: Uint8Array): Promise<z.infer<typeof this.verifier>> {
		return this.verifier.parseAsync(decode(data));
	}
}
