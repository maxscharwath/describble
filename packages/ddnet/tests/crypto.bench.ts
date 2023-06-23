import {bench, describe} from 'vitest';
import {generateKeyPair, mergeUint8Arrays, uint8ArrayEquals} from '../src/crypto';
import {base58} from 'base-x';

describe('crypto', () => {
	describe('key pair generation', () => {
		bench('generate key pair', () => {
			generateKeyPair();
		});
	});

	const keyPair = generateKeyPair();
	const encodedPublicKey = base58.encode(keyPair.publicKey);
	const encodedPrivateKey = base58.encode(keyPair.privateKey);

	describe('base58 encoding / TextEncoder', () => {
		bench('base58 encoding', () => {
			base58.encode(keyPair.publicKey);
		});

		bench('TextDecoder', () => {
			new TextDecoder().decode(keyPair.publicKey);
		});
	});

	describe('base58 decoding / TextEncoder', () => {
		bench('TextDecoder', () => {
			new TextEncoder().encode('Hello World!');
		});

		bench('base58 decoding', () => {
			base58.decode(encodedPublicKey);
		});
	});

	describe('uint8ArrayMerge', () => {
		bench('Uint8Array with spread operator', () => {
			// eslint-disable-next-line no-new
			new Uint8Array([...keyPair.publicKey, ...keyPair.privateKey]);
		});

		bench('mergeUint8Arrays', () => {
			mergeUint8Arrays([keyPair.publicKey, keyPair.privateKey]);
		});
	});

	describe('equality', () => {
		bench('uint8ArrayEquals (true)', () => {
			uint8ArrayEquals(keyPair.privateKey, keyPair.privateKey);
		});

		bench('uint8ArrayEquals (false)', () => {
			uint8ArrayEquals(keyPair.privateKey, keyPair.publicKey);
		});

		bench('base58 encoding equality runtime (true)', () => {
			// eslint-disable-next-line no-self-compare,@typescript-eslint/no-unused-expressions
			base58.encode(keyPair.privateKey) === base58.encode(keyPair.privateKey);
		});

		bench('base58 encoding equality runtime (false)', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			base58.encode(keyPair.privateKey) === base58.encode(keyPair.publicKey);
		});

		bench('base58 encoding equality precomputed (true)', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-self-compare
			encodedPrivateKey === encodedPrivateKey;
		});

		bench('base58 encoding equality precomputed (false)', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			encodedPrivateKey === encodedPublicKey;
		});

		bench('base58 encoding equality one precomputed (true)', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			encodedPrivateKey === base58.encode(keyPair.privateKey);
		});

		bench('base58 encoding equality one precomputed (false)', () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			encodedPrivateKey === base58.encode(keyPair.publicKey);
		});
	});
});
