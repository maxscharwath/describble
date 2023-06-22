import {decode, encode} from 'cbor-x';
import {createSignature, decryptMessage, encryptMessage, verifySignature} from './crypto';

export type Message<TData> = {
	from: {
		publicKey: Uint8Array;
		clientId: Uint8Array;
	};
	to?: {
		publicKey: Uint8Array;
		clientId?: Uint8Array;
	};
	data: TData;
};

/**
 * Error indicating that a message signature is invalid
 */
export class InvalidSignatureError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'InvalidSignatureError';
	}
}

/**
 * Encodes a message and signs it with the private key
 * The message is encrypted with a shared secret if the recipient is provided (to.publicKey)
 * @param message - The message to encode
 * @param privateKey - The private key to sign the message with
 */
export async function encodeMessage<TData>(message: Message<TData>, privateKey: Uint8Array) {
	const encodedMessage = encode({
		from: message.from,
		to: message.to,
		data: message.to?.publicKey
			? await encryptMessage(encode(message.data), privateKey, message.to.publicKey)
			: encode(message.data),
	});
	const signature = await createSignature(encodedMessage, privateKey);
	const data = new Uint8Array(signature.length + encodedMessage.length);
	data.set(signature, 0);
	data.set(encodedMessage, signature.length);
	return data;
}

/**
 * Verifies the signature of a message and returns the message
 * @param data - The encoded message
 * @returns The decoded message and whether the signature is valid
 */
export function verifyMessage(data: Uint8Array) {
	const signature = data.subarray(0, 64);
	const encodedMessage = data.subarray(64);
	const message = decode(encodedMessage) as Message<Uint8Array>;
	const verified = verifySignature(encodedMessage, signature, message.from.publicKey);
	return {verified, message};
}

/**
 * Decodes a message and decrypts it if the recipient is provided (to.publicKey)
 * @param data - The encoded message
 * @param privateKey - The private key to decrypt the message with
 */
export async function decodeMessage<TData>(data: Uint8Array, privateKey: Uint8Array) {
	const signature = data.subarray(0, 64);
	const encodedMessage = data.subarray(64);
	const message = decode(encodedMessage) as Message<Uint8Array>;
	if (!verifySignature(encodedMessage, signature, message.from.publicKey)) {
		throw new InvalidSignatureError();
	}

	return {
		from: message.from,
		to: message.to,
		data: (message.to?.publicKey
			? decode(await decryptMessage(message.data, privateKey, message.from.publicKey))
			: decode(message.data)) as TData,
	};
}
