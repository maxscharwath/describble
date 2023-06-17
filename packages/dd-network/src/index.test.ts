import {describe, expect} from 'vitest';
import * as secp256k1 from '@noble/secp256k1';
import {type Message, SignalingClient} from './server/Client';
import {type Connection, type ConnectionServerAdapter} from './server/adapter';
import {SignalingServer} from './server/Server';
import {Deferred} from './utils';
import {parseBuffer} from './server/serialization';
import {EncryptedMessageSchema} from './server/schemas';
import * as cbor from 'cbor-x';
import {decryptMessage, generateAESKey} from './crypto';

const genKeyPair = () => {
	const privateKey = secp256k1.utils.randomPrivateKey();
	const publicKey = secp256k1.getPublicKey(privateKey, true);
	return {privateKey, publicKey};
};

class MockServerAdapter implements ConnectionServerAdapter {
	public handleConnection?: (connection: MockConnection, publicKey: Uint8Array) => void;
	listen(): void {
		// Do nothing
	}

	onConnection(callback: (connection: MockConnection, publicKey: Uint8Array) => void): void {
		this.handleConnection = callback;
	}

	send(socket: Connection, data: Uint8Array): void {
		socket.send(data);
	}

	async stop(): Promise<void> {
		return Promise.resolve();
	}
}

class MockConnection implements Connection {
	public onSentData?: (data: Uint8Array) => void;
	public onReceivedData?: (data: Uint8Array) => void;
	public handleClose?: (error: Error) => void;
	public handleData?: (data: Uint8Array) => void;
	private peerConnection?: MockConnection;

	constructor(public readonly publicKey: Uint8Array, public readonly server: MockServerAdapter) {
	}

	connect(peerConnection?: MockConnection): this {
		if (peerConnection) {
			this.peerConnection = peerConnection;
		} else {
			this.peerConnection = new MockConnection(this.publicKey, this.server);
			this.peerConnection.connect(this);
			this.server.handleConnection?.(this.peerConnection, this.publicKey);
		}

		return this;
	}

	close(cause: string): void {
		this.handleClose?.(new Error(cause));
		const {peerConnection} = this;
		this.peerConnection = undefined;
		peerConnection?.close(cause);
	}

	off(): void {
		this.handleClose = undefined;
		this.handleData = undefined;
	}

	onClose(callback: (error: Error) => void): void {
		this.handleClose = callback;
	}

	onData(callback: (data: Uint8Array) => void): void {
		this.handleData = data => {
			this.onReceivedData?.(data);
			callback(data);
		};
	}

	send(data: Uint8Array): void {
		this.onSentData?.(data);
		this.peerConnection?.handleData?.(data);
	}
}

// Helper function to create client and its MockConnection
const createClientAndConnection = (adapter: MockServerAdapter) => {
	const keys = genKeyPair();
	const connection = new MockConnection(keys.publicKey, adapter);
	const client = new SignalingClient({
		adapter: () => connection.connect(),
		...keys,
	});
	return {client, connection, keys};
};

const exportKey = async (key: CryptoKey | Promise<CryptoKey>) => crypto.subtle.exportKey('jwk', await key);

describe('dd-network', () => {
	describe('utils', () => {
		it('should be able to generate key pairs', () => {
			const keys = genKeyPair();
			expect(keys.privateKey).toBeInstanceOf(Uint8Array);
			expect(keys.publicKey).toBeInstanceOf(Uint8Array);
		});

		it('should be able to generate shared AES keys', async () => {
			const aliceKeys = genKeyPair();
			const bobKeys = genKeyPair();
			const eveKeys = genKeyPair();

			const keyAB = await exportKey(generateAESKey(aliceKeys.privateKey, bobKeys.publicKey, undefined, true));
			const keyBA = await exportKey(generateAESKey(bobKeys.privateKey, aliceKeys.publicKey, undefined, true));
			const keyAE = await exportKey(generateAESKey(aliceKeys.privateKey, eveKeys.publicKey, undefined, true));
			const keyEA = await exportKey(generateAESKey(eveKeys.privateKey, aliceKeys.publicKey, undefined, true));
			expect(keyAB).toEqual(keyBA);
			expect(keyAE).toEqual(keyEA);
			expect(keyAB).not.toEqual(keyAE);
		});

		it('should be able to generate shared AES keys with a salt', async () => {
			const aliceKeys = genKeyPair();
			const bobKeys = genKeyPair();

			const keyAB = await exportKey(generateAESKey(aliceKeys.privateKey, bobKeys.publicKey, 'salt', true));
			const keyBA = await exportKey(generateAESKey(bobKeys.privateKey, aliceKeys.publicKey, 'salt', true));

			const keyAB2 = await exportKey(generateAESKey(aliceKeys.privateKey, bobKeys.publicKey, 'salt2', true));
			const keyBA2 = await exportKey(generateAESKey(bobKeys.privateKey, aliceKeys.publicKey, 'salt2', true));

			expect(keyAB).toEqual(keyBA);
			expect(keyAB2).toEqual(keyBA2);

			expect(keyAB).not.toEqual(keyAB2);
			expect(keyBA).not.toEqual(keyBA2);
		});
	});
	describe('use cases', () => {
		let server: SignalingServer;
		let adapter: MockServerAdapter;

		beforeEach(() => {
			adapter = new MockServerAdapter();
			server = new SignalingServer({
				adapter,
			});
			server.listen();
		});

		it('should be able to connect to a signaling server', async () => {
			const {client} = createClientAndConnection(adapter);
			await client.connect();
		});

		it('should be able to send data to a signaling server', async () => {
			const {client: aliceClient, keys: aliceKeys} = createClientAndConnection(adapter);
			const {client: bobClient, keys: bobKeys} = createClientAndConnection(adapter);

			await aliceClient.connect();
			await bobClient.connect();

			await aliceClient.send({
				type: 'message',
				to: bobKeys.publicKey,
				data: 'Hello Bob!',
			});

			const bobMessage = await new Promise<Message>(resolve => {
				bobClient.onMessage(resolve);
			});

			expect(bobMessage).toEqual({
				type: 'message',
				from: aliceKeys.publicKey,
				to: bobKeys.publicKey,
				data: 'Hello Bob!',
			});
		});

		it('should not receive data when disconnected', async () => {
			const {client: aliceClient} = createClientAndConnection(adapter);
			const {client: bobClient, keys: bobKeys} = createClientAndConnection(adapter);

			await aliceClient.connect();
			await bobClient.connect();
			bobClient.disconnect();

			const data = 'Hello Bob!';
			await aliceClient.send({
				type: 'message',
				to: bobKeys.publicKey,
				data,
			});

			let receivedData = null;
			bobClient.onMessage((msg: Message) => {
				receivedData = msg.data;
			});

			// Wait for some time to see if the disconnected client receives data
			await new Promise(resolve => {
				setTimeout(resolve, 200);
			});

			expect(receivedData).toBeNull();
		});

		it('should send encrypted data', async () => {
			const {client: aliceClient, keys: aliceKeys, connection: aliceConnection} = createClientAndConnection(adapter);
			const {client: bobClient, keys: bobKeys} = createClientAndConnection(adapter);
			const {keys: eveKeys} = createClientAndConnection(adapter);

			await aliceClient.connect();
			await bobClient.connect();

			const message = 'Hello, Bob!';

			const eveDecryptedMessage = new Deferred();
			const bobDecryptedMessage = new Deferred();
			const aliceDecryptedMessage = new Deferred();
			aliceConnection.onSentData = async message => {
				const {data} = await parseBuffer(EncryptedMessageSchema, message);
				eveDecryptedMessage.attach(decryptMessage(data, eveKeys.privateKey, aliceKeys.publicKey));
				bobDecryptedMessage.attach(decryptMessage(data, bobKeys.privateKey, aliceKeys.publicKey));
				aliceDecryptedMessage.attach(decryptMessage(data, aliceKeys.privateKey, bobKeys.publicKey));
			};

			await aliceClient.send({
				type: 'message',
				to: bobKeys.publicKey,
				data: message,
			});

			await expect(eveDecryptedMessage.promise).rejects.toThrow(); // Eve should not be able to decrypt the message
			await expect(bobDecryptedMessage.promise).resolves.toEqual(cbor.encode(message)); // Bob should be able to decrypt the message
			await expect(aliceDecryptedMessage.promise).resolves.toEqual(cbor.encode(message)); // Alice should be able to decrypt the message (invert the keys)
		});
	});
});
