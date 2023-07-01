import {MockNetwork, MockNetworkAdapter} from './MockNetwork';
import {expect} from 'vitest';
import {SignalingClient} from '../src/client/SignalingClient';
import {generateKeyPair} from '../src';
import {SignalingServer} from '../src/server/SignalingServer';

/**
 * Creates a number of clients and connects them to the server.
 * @param network - The mock network to use.
 * @param count - The number of clients to create.
 * @param connect - Whether to connect the clients to the server.
 */
const createClients = async (network: MockNetwork, count: number, connect = true): Promise<SignalingClient[]> => {
	const clients: SignalingClient[] = [];

	for (let i = 0; i < count; i++) {
		clients.push(new SignalingClient({
			...generateKeyPair(),
			network: new MockNetworkAdapter(network),
		}));
	}

	if (connect) {
		await Promise.all(clients.map(async client => client.connect()));
	}

	return clients;
};

/**
 * Creates a number of clients with the same key pair and connects them to the server.
 * @param network - The mock network to use.
 * @param count - The number of clients to create.
 * @param connect - Whether to connect the clients to the server.
 */
const createSameClients = async (network: MockNetwork, count: number, connect = true): Promise<SignalingClient[]> => {
	const keyPair = generateKeyPair();
	const clients: SignalingClient[] = [];

	for (let i = 0; i < count; i++) {
		clients.push(new SignalingClient({
			...keyPair,
			network: new MockNetworkAdapter(network),
		}));
	}

	if (connect) {
		await Promise.all(clients.map(async client => client.connect()));
	}

	return clients;
};

/**
 * Helper function to create a promise that rejects after a timeout.
 * @param promise - The promise
 * @param timeout - The timeout in milliseconds.
 * @param failMessage - The message to use for the rejection.
 */
const withTimeout = async <T> (promise: Promise<T>, timeout: number, failMessage?: string): Promise<T> => {
	let timeoutId: NodeJS.Timeout;
	const timeoutPromise = new Promise<T>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error(failMessage ?? 'Operation timed out')), timeout);
	});
	return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

describe('Signaling', () => {
	let network: MockNetwork;

	beforeEach(async () => {
		network = new MockNetwork();
		const server = new SignalingServer({
			network,
		});
		await server.listen();
	});

	describe('Authentication', () => {
		it('should authenticate', async () => {
			const [clientAlice, clientBob] = await createClients(network, 2, false);
			expect(clientAlice.connected).toBe(false);
			expect(clientBob.connected).toBe(false);

			await expect(clientAlice.connect()).resolves.toBeUndefined();
			await expect(clientBob.connect()).resolves.toBeUndefined();

			expect(clientAlice.connected).toBe(true);
			expect(clientBob.connected).toBe(true);
		});

		it('should fail to authenticate with invalid credentials', async () => {
			// @ts-expect-error - We want to test invalid credentials
			const client = new SignalingClient({
				network: new MockNetworkAdapter(network),
			});
			await expect(client.connect()).rejects.toThrow();
		});
	});

	describe('Messaging', () => {
		it('should send and receive messages', async () => {
			const [clientAlice, clientBob] = await createClients(network, 2);
			const message = 'Hello Bob!';

			const receivedMessage = clientBob.once('message');
			await clientAlice.sendMessage({
				to: {
					publicKey: clientBob.publicKey,
				},
				data: message,
			});

			expect((await receivedMessage).data).toBe(message);
		});

		it('should send and receive messages (broadcast)', async () => {
			const [clientAlice, clientBob, clientCharlie] = await createClients(network, 3);
			const message = 'Hello Bob!';

			const bobReceivedMessage = clientBob.once('message');
			const charlieReceivedMessage = clientCharlie.once('message');

			await clientAlice.sendMessage({
				data: message,
			});

			expect((await bobReceivedMessage).data).toBe(message);
			expect((await charlieReceivedMessage).data).toBe(message);
		});

		it('should send and receive messages directly', async () => {
			const [clientAlice, clientBob] = await createClients(network, 2);
			const [clientCharlie1, clientCharlie2] = await createSameClients(network, 2);
			const message = 'Hello Bob!';

			expect(clientCharlie1.clientId).not.toBe(clientAlice.clientId);
			expect(clientCharlie1.publicKey).not.toBe(clientAlice.publicKey);

			void expect(withTimeout(clientCharlie1.once('message'), 100)).resolves.toBeDefined();
			void expect(withTimeout(clientCharlie2.once('message'), 100)).rejects.toBeDefined();
			void expect(withTimeout(clientBob.once('message'), 100)).rejects.toBeDefined();

			await clientAlice.sendMessage({
				to: {
					publicKey: clientCharlie1.publicKey,
					clientId: clientCharlie1.clientId,
				},
				data: message,
			});
		});

		it('should able to respond to messages', async () => {
			const [clientAlice, clientBob] = await createClients(network, 2);

			const message = 'Hello Bob!';
			const response = 'Hello Alice!';

			const bobReceivedMessage = clientBob.once('message');
			const aliceReceivedMessage = clientAlice.once('message');

			await clientAlice.sendMessage({
				to: {
					publicKey: clientBob.publicKey,
				},
				data: message,
			});
			const bobMessage = await bobReceivedMessage;
			expect(bobMessage.data).toBe(message);

			// Respond to message using the 'from' fields

			await clientBob.sendMessage({
				to: bobMessage.from,
				data: response,
			});

			const aliceMessage = await aliceReceivedMessage;
			expect(aliceMessage.data).toBe(response);
		});
	});
});
