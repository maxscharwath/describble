import {generateKeyPair} from '../src';
import {
	DecodeError,
	decodeMessage,
	encodeMessage,
	InvalidSignatureError,
	verifyMessage,
} from '../src/Message';

function createRandomData() {
	return crypto.getRandomValues(new Uint8Array(32));
}

describe('Message', () => {
	let keyPairSender: {publicKey: Uint8Array; privateKey: Uint8Array};
	let keyPairRecipient: {publicKey: Uint8Array; privateKey: Uint8Array};
	let data: Uint8Array;
	let encodedMessage: Promise<Uint8Array>;
	let incorrectData: Uint8Array;

	beforeEach(() => {
		// Create keys for sender and recipient
		keyPairSender = generateKeyPair();
		keyPairRecipient = generateKeyPair();

		// Create some data to test encoding and decoding
		data = createRandomData();
		incorrectData = createRandomData();

		// Create a message to be encoded
		const message = {
			from: {
				publicKey: keyPairSender.publicKey,
				clientId: createRandomData(),
			},
			to: {
				publicKey: keyPairRecipient.publicKey,
				clientId: createRandomData(),
			},
			data,
		};

		encodedMessage = encodeMessage(message, keyPairSender.privateKey);
	});

	it('encodes and decodes message correctly', async () => {
		const decodedMessage = await decodeMessage(await encodedMessage, keyPairRecipient.privateKey);
		expect(decodedMessage.data).toEqual(data);
	});

	it('throws InvalidSignatureError for tampered message', async () => {
		const tamperedMessage = new Uint8Array(await encodedMessage);
		tamperedMessage[0] ^= 255; // Modify a bit

		await expect(decodeMessage(tamperedMessage, keyPairRecipient.privateKey)).rejects.toThrow(InvalidSignatureError);
	});

	it('throws DecodeError for incorrect decoding', async () => {
		const incorrectMessage = {
			from: {
				publicKey: keyPairSender.publicKey,
				clientId: createRandomData(),
			},
			to: {
				publicKey: keyPairRecipient.publicKey,
				clientId: createRandomData(),
			},
			data: incorrectData,
		};

		let incorrectEncodedMessage = await encodeMessage(incorrectMessage, keyPairSender.privateKey);

		// Simulate tampering by modifying some bytes
		incorrectEncodedMessage = new Uint8Array(incorrectEncodedMessage);
		incorrectEncodedMessage.forEach((_, i) => {
			if (i % 4 === 0) {
				incorrectEncodedMessage[i] ^= 255;
			}
		});

		await expect(decodeMessage(incorrectEncodedMessage, keyPairRecipient.privateKey)).rejects.toThrow(DecodeError);
	});

	it('verifies the message correctly', async () => {
		const verificationResult = verifyMessage(await encodedMessage);
		expect(verificationResult.verified).toBe(true);
	});

	it('detects incorrect signature', async () => {
		const tamperedMessage = new Uint8Array(await encodedMessage);
		tamperedMessage[0] ^= 255; // Modify a bit

		const verificationResult = verifyMessage(tamperedMessage);
		expect(verificationResult.verified).toBe(false);
	});
});
