import {
	createSignature,
	decryptMessage,
	encryptMessage,
	getPublicKey,
	generateKeyPair,
	generateMnemonic,
	mnemonicToSeedSync,
	generatePrivateKey,
	concatBytes,
	sha256Some,
	bytesEquals,
	verifySignature,
} from '../src/crypto';
import {randomBytes} from '@noble/hashes/utils';

describe('crypto', () => {
	it('generateMnemonic should return a valid mnemonic', () => {
		const mnemonic = generateMnemonic();
		expect(mnemonic.trim().split(/\s+/g).length).toEqual(12);
	});

	it('mnemonicToSeed should return a valid seed from a mnemonic', () => {
		const mnemonic = generateMnemonic();
		const seed = mnemonicToSeedSync(mnemonic);
		expect(seed).toBeInstanceOf(Uint8Array);
	});

	it('generatePrivateKey should return a valid private key', () => {
		const privateKey = generatePrivateKey();
		expect(privateKey).toBeInstanceOf(Uint8Array);
		expect(privateKey.length).toEqual(32); // Private keys are 32 bytes long
	});

	it('getPublicKey should return a valid public key from a private key', () => {
		const privateKey = generatePrivateKey();
		const publicKey = getPublicKey(privateKey);
		expect(publicKey).toBeInstanceOf(Uint8Array);
		expect(publicKey.length).toEqual(33); // Compressed public keys are 33 bytes long
	});

	it('generateKeyPair should return a valid key pair', () => {
		const {privateKey, publicKey} = generateKeyPair();
		expect(privateKey).toBeInstanceOf(Uint8Array);
		expect(publicKey).toBeInstanceOf(Uint8Array);
		expect(privateKey.length).toEqual(32);
		expect(publicKey.length).toEqual(33);
	});

	it('encryptMessage and decryptMessage should correctly encrypt and decrypt a message', async () => {
		const {privateKey, publicKey} = generateKeyPair();
		const message = new TextEncoder().encode('Hello, world!');
		const encryptedMessage = await encryptMessage(message, privateKey, publicKey);
		const decryptedMessage = await decryptMessage(encryptedMessage, privateKey, publicKey);
		expect(decryptedMessage).toEqual(message);
	});

	it('createSignature and verifySignature should correctly sign and verify a message', async () => {
		const {privateKey, publicKey} = generateKeyPair();
		const message = new TextEncoder().encode('Hello, world!');
		const signature = createSignature(message, privateKey);
		expect(verifySignature(message, signature, publicKey)).toBe(true);
	});

	it('uint8ArrayEquals should return true if two Uint8Arrays are equal', () => {
		const a = randomBytes(32);
		const b = Uint8Array.from(a);
		expect(bytesEquals(a, b)).toBe(true);
	});

	it('mergeUint8Arrays should correctly merge two Uint8Arrays', () => {
		const a = randomBytes(32);
		const b = randomBytes(32);
		const merged = concatBytes([a, b]);
		expect(merged).toEqual(Uint8Array.from([...a, ...b]));
	});

	it('sha256Some should correctly hash some Uint8Arrays', () => {
		const a = randomBytes(32);
		const b = randomBytes(32);
		const hash = sha256Some(a, b);
		expect(hash).toBeInstanceOf(Uint8Array);
		expect(hash.length).toEqual(32); // SHA-256 hashes are 32 bytes long
	});
});
