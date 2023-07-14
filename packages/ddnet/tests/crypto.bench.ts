import {bench, describe, expect} from 'vitest';
import {generateKeyPair, bytesEquals, concatBytes} from '../src';
import {base58} from '@ddnet/base-x';

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
			concatBytes([keyPair.publicKey, keyPair.privateKey]);
		});
	});

	describe('equality', () => {
		bench('uint8ArrayEquals (true)', () => {
			bytesEquals(keyPair.privateKey, keyPair.privateKey);
		});

		bench('uint8ArrayEquals (false)', () => {
			bytesEquals(keyPair.privateKey, keyPair.publicKey);
		});

		bench('base58 encoding equality runtime (false)', () => {
			expect(base58.encode(keyPair.privateKey) === base58.encode(keyPair.publicKey)).toBeTruthy();
		});

		bench('base58 encoding equality precomputed (false)', () => {
			expect(encodedPrivateKey === encodedPublicKey).toBeTruthy();
		});

		bench('base58 encoding equality one precomputed (true)', () => {
			expect(encodedPrivateKey === base58.encode(keyPair.privateKey)).toBeTruthy();
		});

		bench('base58 encoding equality one precomputed (false)', () => {
			expect(encodedPrivateKey === base58.encode(keyPair.publicKey)).toBeTruthy();
		});
	});
});
