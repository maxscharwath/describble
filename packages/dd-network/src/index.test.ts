import {describe, expect} from 'vitest';
import * as secp256k1 from '@noble/secp256k1';
import {type Message, SignalingClient} from './server/Client';
import {type Connection, type ConnectionServerAdapter} from './server/adapter';
import {SignalingServer} from './server/Server';
import {Deferred} from './utils';
import {parseBuffer} from './server/serialization';
import {EncryptedMessageSchema} from './server/schemas';
import * as cbor from 'cbor-x';
import Emittery from 'emittery';
import {decryptMessage, generateAESKey} from './crypto';

const genKeyPair = () => {
	const privateKey = secp256k1.utils.randomPrivateKey();
	const publicKey = secp256k1.getPublicKey(privateKey, true);
	return {privateKey, publicKey};
};

/**
 * Mock connection for testing.
 */
export class MockConnection implements Connection {
	public onSentData?: (data: Uint8Array) => void;
	private readonly emitter = new Emittery();

	private correspondingConnection?: MockConnection;

	public onData(callback: (data: Uint8Array) => void) {
		this.emitter.on('data', callback);
	}

	public onClose(callback: (error: Error) => void) {
		this.emitter.on('close', callback);
	}

	public off() {
		this.emitter.clearListeners();
	}

	public send(data: Uint8Array) {
		this.onSentData?.(data);
		// Send data to the corresponding connection
		this.correspondingConnection?.simulateIncomingData(data);
	}

	public close(cause: string) {
		// Simulate a close event.
		void this.emitter.emit('close', new Error(cause));

		// Check if there is a corresponding connection
		if (this.correspondingConnection) {
			const tempConnection = this.correspondingConnection;
			// Nullify the corresponding connection before calling close on it
			this.correspondingConnection = undefined;
			tempConnection.correspondingConnection = undefined;
			// Close the temporary connection
			tempConnection.close(cause);
		}
	}

	// Used to simulate incoming data.
	public simulateIncomingData(data: Uint8Array) {
		// Simulate incoming data
		void this.emitter.emit('data', data);
	}

	// Used to connect to a MockConnectionServerAdapter.
	public connect(adapter: MockConnectionServerAdapter, publicKey: Uint8Array) {
		// Create a corresponding connection
		const correspondingConnection = new MockConnection();
		this.setCorrespondingConnection(correspondingConnection);
		correspondingConnection.setCorrespondingConnection(this);

		// Notify the adapter of the new connection
		adapter.simulateConnection(correspondingConnection, publicKey);
		return this;
	}

	// Used to set corresponding connection.
	private setCorrespondingConnection(connection: MockConnection) {
		this.correspondingConnection = connection;
	}
}

/**
 * Mock server adapter for testing.
 */
export class MockConnectionServerAdapter implements ConnectionServerAdapter {
	private readonly emitter = new Emittery<{
		connection: [connection: Connection, publicKey: Uint8Array];
	}>();

	public onConnection(callback: (connection: Connection, publicKey: Uint8Array) => void) {
		this.emitter.on('connection', ([connection, publicKey]) => {
			callback(connection, publicKey);
		});
	}

	public listen() {
		// Simulate server start
	}

	public async stop() {
		// Simulate server stop
		this.emitter.clearListeners();
	}

	public send(socket: Connection, data: Uint8Array) {
		// Send data to the corresponding connection
		(socket as MockConnection).send(data);
	}

	public simulateConnection(connection: Connection, publicKey: Uint8Array) {
		void this.emitter.emit('connection', [connection, publicKey]);
	}
}

// Helper function to create client and its MockConnection
const createClientAndConnection = (adapter: MockConnectionServerAdapter) => {
	const keys = genKeyPair();
	const connection = new MockConnection();
	const client = new SignalingClient({
		adapter: () => connection.connect(adapter, keys.publicKey),
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
		let adapter: MockConnectionServerAdapter;

		beforeEach(() => {
			adapter = new MockConnectionServerAdapter();
			server = new SignalingServer({
				adapter,
			});
			server.listen();
		});

		it('should be able to connect to a signaling server', async () => {
			const {client} = createClientAndConnection(adapter);
			await client.connect();
		});

		it('should be able to send data to another client', async () => {
			const {client: aliceClient} = createClientAndConnection(adapter);
			const {client: bobClient, keys: bobKeys} = createClientAndConnection(adapter);

			await aliceClient.connect();
			await bobClient.connect();

			const data = {
				message: 'Hello Bob!',
				from: 'Alice',
			};
			const pendingMessage = new Promise<Message>(resolve => {
				bobClient.onMessage((msg: Message) => {
					resolve(msg);
				});
			});

			await aliceClient.send({
				type: 'message',
				to: bobKeys.publicKey,
				data,
			});

			const msg = await pendingMessage;
			expect(msg.data).toEqual(data);
		});

		it('should not receive data when disconnected', async () => {
			const {client: aliceClient} = createClientAndConnection(adapter);
			const {client: bobClient, keys: bobKeys} = createClientAndConnection(adapter);

			await aliceClient.connect();
			await bobClient.connect();
			bobClient.disconnect();

			const data = 'Hello Bob!';

			let receivedData = null;
			bobClient.onMessage((msg: Message) => {
				receivedData = msg.data;
			});

			await aliceClient.send({
				type: 'message',
				to: bobKeys.publicKey,
				data,
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
