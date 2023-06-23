import Emittery from 'emittery';
import {z} from 'zod';
import {type Message} from '../Message';
import {type ZodDiscriminatedUnionOption} from 'zod/lib/types';
import {type SignalingClient} from './SignalingClient';

/**
 * A type representing a list of zod schemas, where each schema has a discriminated 'type' field.
 * This is used as a helper for creating the MessageExchangerEvent type.
 */
type TypedSchemas = [ZodDiscriminatedUnionOption<'type'>, ...Array<ZodDiscriminatedUnionOption<'type'>>];

/**
 * A mapped type which extracts the 'type' field from each schema in TSchemas,
 * and maps it to a Message whose data is of the corresponding schema.
 */
type MessageExchangerEvent<TSchemas extends TypedSchemas> = {
	[K in z.infer<TSchemas[number]>['type']]: Message<Extract<z.infer<TSchemas[number]>, {type: K}>>;
};

/**
 * A class for exchange messages based on their 'type' field.
 * This class extends from Emittery, a simple event emitter library.
 * Each event name is the 'type' field of a schema, and each event emits a Message whose data matches the schema.
 */
export class MessageExchanger<TSchemas extends TypedSchemas> extends Emittery<MessageExchangerEvent<TSchemas>> {
	// This holds the zod union schema which is used to parse and validate incoming messages
	private readonly verifier: z.ZodDiscriminatedUnion<'type', TSchemas>;

	/**
	 * The constructor takes in a list of zod schemas, and creates a discriminated union schema from them.
	 * This union schema is used to parse and validate incoming and outgoing messages.
	 * @param client - The signaling client to be used for sending and receiving messages.
	 * @param schemas - A list of zod schemas, where each schema has a discriminated 'type' field.
	 */
	constructor(private readonly client: SignalingClient, schemas: TSchemas) {
		super();
		this.verifier = z.discriminatedUnion('type', schemas);
		this.client.on('message', async message => this.handle(message));
	}

	/**
	 * This method sends a message to the signaling server.
	 * The data is parsed and validated using the zod union schema.
	 * @param data - The data to be sent.
	 * @param to - The recipient of the message. If not specified, the message is sent to all clients.
	 */
	public async sendMessage(data: z.infer<TSchemas[number]>, to?: {publicKey: Uint8Array; clientId?: Uint8Array}) {
		return this.client.sendMessage({
			to,
			data: await this.verifier.parseAsync(data),
		});
	}

	/**
	 * This method handles incoming messages.
	 * It tries to parse and validate the data of the message using the zod union schema.
	 * If the parsing and validation are successful, it emits an event with the 'type' field of the data as the event name,
	 * and the entire message as the event data. The data field of the message is guaranteed to be of the corresponding schema.
	 * If the parsing and validation fail, it logs the error to the console.
	 * @param message - The incoming message to be handled.
	 * @private
	 */
	private async handle(message: Message<unknown>) {
		const safeParsed = await this.verifier.safeParseAsync(message.data);
		if (safeParsed.success) {
			const {data} = safeParsed;
			void this.emit(data.type, {
				...message,
				data,
			} as MessageExchangerEvent<TSchemas>[typeof data.type]);
		} else {
			console.error(safeParsed.error);
		}
	}
}
