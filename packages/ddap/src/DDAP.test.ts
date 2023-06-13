import {
	toBase58,
	verifySignature,
	createSignature,
	generateKeys,
} from './utils';
import {expect} from 'vitest';
import * as secp256k1 from '@noble/secp256k1';
import {hkdf} from '@noble/hashes/hkdf';
import {sha256} from '@noble/hashes/sha256';

/*
This authentication protocol assumes that the client's address (derived from their public key) has
already been registered and added to the server's list of allowed addresses.
The server store only the addresses and not the public keys themselves, to save space.
That means that the client must send its public key along with the signature to the server, to allow the server to verify the signature, we can compute the address from the public key and check if it is in the list of allowed addresses.

The main flow of the authentication protocol is as follows:

                 [Client]                                [Server]
                    | ---(1) Client asks for auth --------> |
                    |                                       |
                    | <--(2) Generate Challenge ----------- |
                    |                                       |
                    | ---(3) Sign Challenge and Send -----> |
                    |                                       |
                    | ---(4) Verify Request (Challenge,     |
                    |       Signature, PublicKey) --------> |
                    | <--(5) Verification Success/Failure - |

1. Client asks for authentication given its address.
2. Server generates a unique challenge for the client's address.
3. Client signs the challenge using its private key and sends the signature and its public key to the server.
4. Server verifies the request. This involves checking if the address is stored, the challenge is valid and the signature matches the challenge. The server does this using the client's public key.
5. Server sends back a response indicating whether the verification was successful or not.
*/

class Server {
	private readonly addresses: Set<string>;
	private readonly challenges = new Map<string, Set<Uint8Array>>();

	constructor() {
		this.addresses = new Set();
	}

	generateChallenge(address: string): Uint8Array {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		this.challenges.set(address, (this.challenges.get(address) ?? new Set()).add(challenge));
		return challenge;
	}

	getChallenge(address: string, challenge: Uint8Array, deleteAfter = true): Uint8Array | undefined {
		const challenges = this.challenges.get(address);
		if (!challenges) {
			return undefined;
		}

		for (const c of challenges) {
			if (c.every((v, i) => v === challenge[i])) {
				if (deleteAfter) {
					challenges.delete(c);
				}

				return c;
			}
		}

		return undefined;
	}

	verifyRequest(challenge: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) {
		const address = toBase58(publicKey);
		if (!(this.addresses.has(address) && this.getChallenge(address, challenge))) {
			return false;
		}

		return verifySignature(
			challenge,
			signature,
			publicKey,
		);
	}

	addAddress(address: Uint8Array): void {
		this.addresses.add(toBase58(address));
	}

	removeAddress(address: Uint8Array): void {
		this.addresses.delete(toBase58(address));
	}
}

class Client {
	readonly keyPair = generateKeys();

	getPublicKey() {
		return this.keyPair.publicKey;
	}

	async signChallenge(challenge: Uint8Array) {
		const {publicKey, privateKey} = this.keyPair;
		const signature = await createSignature(challenge, privateKey);
		return {
			challenge,
			signature,
			publicKey,
		};
	}
}

describe('Authorization Protocol', () => {
	let client: Client;
	let server: Server;

	beforeEach(() => {
		client = new Client();
		server = new Server();
	});

	const addAddressAndGenerateChallenge = async () => {
		const address = client.getPublicKey();
		server.addAddress(address);
		return server.generateChallenge(toBase58(address));
	};

	it('should succeed on correct signature verification', async () => {
		const challenge = await addAddressAndGenerateChallenge();
		const response = await client.signChallenge(challenge);
		const success = server.verifyRequest(response.challenge, response.signature, response.publicKey);
		expect(success).toBe(true);
	});

	it('should fail on incorrect signature verification', async () => {
		const challenge = await addAddressAndGenerateChallenge();
		const response = await client.signChallenge(challenge);

		// Create an incorrect signature
		const incorrectSignature = new Uint8Array(response.signature).fill(0);

		const success = server.verifyRequest(response.challenge, incorrectSignature, response.publicKey);
		expect(success).toBe(false);
	});

	it('should fail when address not in server', async () => {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		const response = await client.signChallenge(challenge);

		const success = server.verifyRequest(response.challenge, response.signature, response.publicKey);
		expect(success).toBe(false);
	});

	it('should fail for challenge not generated by server', async () => {
		await addAddressAndGenerateChallenge();

		// Generate a random challenge not issued by server
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		const response = await client.signChallenge(challenge);

		const success = server.verifyRequest(response.challenge, response.signature, response.publicKey);
		expect(success).toBe(false);
	});

	it('should handle duplicate addresses correctly', async () => {
		const address = client.getPublicKey();

		// Add same address twice
		server.addAddress(address);
		server.addAddress(address);

		const challenge = server.generateChallenge(toBase58(address));
		const response = await client.signChallenge(challenge);

		const success = server.verifyRequest(response.challenge, response.signature, response.publicKey);
		expect(success).toBe(true);
	});

	it('should handle concurrent challenges correctly', async () => {
		const address = client.getPublicKey();
		server.addAddress(address);

		// Generate two challenges
		const challenge1 = server.generateChallenge(toBase58(address));
		const challenge2 = server.generateChallenge(toBase58(address));

		// Client signs both challenges
		const response1 = await client.signChallenge(challenge1);
		const response2 = await client.signChallenge(challenge2);

		// Both signatures should verify correctly
		const success1 = server.verifyRequest(response1.challenge, response1.signature, response1.publicKey);
		const success2 = server.verifyRequest(response2.challenge, response2.signature, response2.publicKey);

		expect(success1).toBe(true);
		expect(success2).toBe(true);
	});

	it('should delete used challenges correctly', async () => {
		const challenge = await addAddressAndGenerateChallenge();
		const response = await client.signChallenge(challenge);

		// The signature verifies correctly
		const success1 = server.verifyRequest(challenge, response.signature, response.publicKey);
		expect(success1).toBe(true);

		// After the challenge is used, it should be deleted and not verify again
		const success2 = server.verifyRequest(response.challenge, response.signature, response.publicKey);
		expect(success2).toBe(false);
	});

	it('should delete challenges on address removal', async () => {
		const address = client.getPublicKey();
		server.addAddress(address);
		const challenge = server.generateChallenge(toBase58(address));
		const response = await client.signChallenge(challenge);

		// Remove the address from the server
		server.removeAddress(address);

		// The challenge associated with the address should no longer verify
		const success = server.verifyRequest(response.challenge, response.signature, response.publicKey);
		expect(success).toBe(false);
	});
});

describe('Authorization Protocol ( research )', () => {
	it('shared secret', async () => {
		// Alice and Bob generate their keys
		const alicePrivateKey = secp256k1.utils.randomPrivateKey();
		const alicePublicKey = secp256k1.getPublicKey(alicePrivateKey);

		const bobPrivateKey = secp256k1.utils.randomPrivateKey();
		const bobPublicKey = secp256k1.getPublicKey(bobPrivateKey);

		// They compute the same shared secret
		const aliceSharedSecret = secp256k1.getSharedSecret(alicePrivateKey, bobPublicKey);
		const bobSharedSecret = secp256k1.getSharedSecret(bobPrivateKey, alicePublicKey);

		// Ensure the shared secrets are the same
		expect(aliceSharedSecret).toEqual(bobSharedSecret);

		// Use HKDF to derive a 256-bit key from the shared secret
		const aliceKey = await crypto.subtle.importKey(
			'raw',
			hkdf(sha256, aliceSharedSecret, undefined, undefined, 32),
			{name: 'AES-GCM'},
			false,
			['encrypt', 'decrypt'],
		);

		const bobKey = await crypto.subtle.importKey(
			'raw',
			hkdf(sha256, bobSharedSecret, undefined, undefined, 32),
			{name: 'AES-GCM'},
			false,
			['encrypt', 'decrypt'],
		);

		const iv = crypto.getRandomValues(new Uint8Array(12));
		const plaintext = 'Hello World!';
		const ciphertext = await crypto.subtle.encrypt(
			{name: 'AES-GCM', iv},
			aliceKey,
			new TextEncoder().encode(plaintext),
		);

		const decrypted = await crypto.subtle.decrypt(
			{name: 'AES-GCM', iv},
			bobKey,
			ciphertext,
		);

		expect(new TextDecoder().decode(decrypted)).toEqual(plaintext);
	});
});
