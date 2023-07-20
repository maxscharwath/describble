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
 * Signature length in bytes
 * Signature is a 64 byte long Uint8Array, using the secp256k1 curve.
 */
const SIGNATURE_LENGTH = 64;

export class InvalidSignatureError extends Error {
	public constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'InvalidSignatureError';
	}
}

export class DecodeError extends Error {
	public constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'DecodeError';
	}
}

/**
 * Helper function that handles the encoding and encryption of the message data
 * @param message - The message to encode.
 * @param privateKey - The private key to sign the message with.
 * @returns The encoded and encrypted message data.
 */
const encodeAndEncryptMessageData = async <TData> (message: Message<TData>, privateKey: Uint8Array): Promise<Uint8Array> => message.to?.publicKey
	? encryptMessage(encode(message.data), privateKey, message.to.publicKey)
	: encode(message.data);

/**
 * Encodes a message and signs it with the private key.
 * The message is encrypted with a shared secret if the recipient is provided (to.publicKey).
 * @param message - The message to encode.
 * @param privateKey - The private key to sign the message with.
 */
export async function encodeMessage<TData>(message: Message<TData>, privateKey: Uint8Array): Promise<Uint8Array> {
	const encodedData = await encodeAndEncryptMessageData(message, privateKey);
	const encodedMessage = encode({...message, data: encodedData});

	const signature = createSignature(encodedMessage, privateKey);

	const data = new Uint8Array(signature.length + encodedMessage.length);
	data.set(signature, 0);
	data.set(encodedMessage, signature.length);

	return data;
}

/**
 * Helper function that separates signature and encoded message from the provided data.
 */
function splitSignatureAndMessage(data: Uint8Array): [Uint8Array, Uint8Array] {
	return [data.subarray(0, SIGNATURE_LENGTH), data.subarray(SIGNATURE_LENGTH)];
}

/**
 * Verifies the signature of a message and returns the message.
 * @param data - The encoded message.
 * @returns The decoded message and whether the signature is valid.
 */
export function verifyMessage(data: Uint8Array): {verified: boolean; message: Message<Uint8Array>} {
	const [signature, encodedMessage] = splitSignatureAndMessage(data);

	let message;
	try {
		message = decode(encodedMessage) as Message<Uint8Array>;
	} catch {
		throw new DecodeError('Failed to decode the message');
	}

	const verified = verifySignature(encodedMessage, signature, message.from.publicKey);

	return {verified, message};
}

/**
 * Helper function that decodes and decrypts the message data.
 * @param message - The message to decode.
 * @param privateKey - The private key to decrypt the message with.
 * @returns The decoded message.
 */
async function decodeAndDecryptMessageData<TData>(message: Message<Uint8Array>, privateKey: Uint8Array): Promise<TData> {
	try {
		return decode(
			message.to?.publicKey
				? await decryptMessage(message.data, privateKey, message.from.publicKey)
				: message.data,
		) as TData;
	} catch (cause) {
		throw new DecodeError('Failed to decode or decrypt the message data', {cause});
	}
}

/**
 * Decodes a message and decrypts it if the recipient is provided (to.publicKey).
 * @param data - The encoded message.
 * @param privateKey - The private key to decrypt the message with.
 * @returns The decoded message.
 */
export async function decodeMessage<TData>(data: Uint8Array, privateKey: Uint8Array): Promise<Message<TData>> {
	const [signature, encodedMessage] = splitSignatureAndMessage(data);

	let message;
	try {
		message = decode(encodedMessage) as Message<Uint8Array>;
	} catch {
		throw new DecodeError('Failed to decode the message');
	}

	if (!verifySignature(encodedMessage, signature, message.from.publicKey)) {
		throw new InvalidSignatureError();
	}

	return {
		...message,
		data: await decodeAndDecryptMessageData(message, privateKey),
	};
}
