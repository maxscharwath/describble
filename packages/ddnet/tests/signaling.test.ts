import {MockNetwork, MockNetworkAdapter} from './MockNetwork';
import {expect} from 'vitest';
import {SignalingClient} from '../src/client/SignalingClient';
import {generateKeyPair} from '../src';
import {SignalingServer} from '../src/server/SignalingServer';

type MockClient = {
	client: SignalingClient;
	privateKey: Uint8Array;
	publicKey: Uint8Array;
};

/**
 * Creates a number of clients and connects them to the server.
 * @param network - The mock network to use.
 * @param count - The number of clients to create.
 * @param connect - Whether to connect the clients to the server.
 */
const createClients = async (network: MockNetwork, count: number, connect = true): Promise<MockClient[]> => {
	const clients: MockClient[] = [];

	for (let i = 0; i < count; i++) {
		clients.push({
			client: new SignalingClient({
				network: new MockNetworkAdapter(network),
			}),
			...generateKeyPair(),
		});
	}

	if (connect) {
		await Promise.all(clients.map(async ({client, ...credentials}) => client.connect(credentials)));
	}

	return clients;
};

/**
 * Creates a number of clients with the same key pair and connects them to the server.
 * @param network - The mock network to use.
 * @param count - The number of clients to create.
 * @param connect - Whether to connect the clients to the server.
 */
const createSameClients = async (network: MockNetwork, count: number, connect = true): Promise<MockClient[]> => {
	const keyPair = generateKeyPair();
	const clients: MockClient[] = [];

	for (let i = 0; i < count; i++) {
		clients.push({
			client: new SignalingClient({
				network: new MockNetworkAdapter(network),
			}),
			...keyPair,
		});
	}

	if (connect) {
		await Promise.all(clients.map(async ({client, ...credentials}) => client.connect(credentials)));
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
			expect(clientAlice.client.connected).toBe(false);
			expect(clientBob.client.connected).toBe(false);

			await expect(clientAlice.client.connect(clientAlice)).resolves.toBeUndefined();
			await expect(clientBob.client.connect(clientBob)).resolves.toBeUndefined();

			expect(clientAlice.client.connected).toBe(true);
			expect(clientBob.client.connected).toBe(true);
		});

		it('should fail to authenticate with invalid credentials', async () => {
			const client = new SignalingClient({
				network: new MockNetworkAdapter(network),
			});

			// @ts-expect-error - We want to test invalid credentials
			await expect(client.connect({})).rejects.toBeDefined();
		});
	});

	describe('Messaging', () => {
		it('should send and receive messages', async () => {
			const [clientAlice, clientBob] = await createClients(network, 2);
			const message = 'Hello Bob!';

			const receivedMessage = clientBob.client.once('message');
			await clientAlice.client.sendMessage({
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

			const bobReceivedMessage = clientBob.client.once('message');
			const charlieReceivedMessage = clientCharlie.client.once('message');

			await clientAlice.client.sendMessage({
				data: message,
			});

			expect((await bobReceivedMessage).data).toBe(message);
			expect((await charlieReceivedMessage).data).toBe(message);
		});

		it('should send and receive messages directly', async () => {
			const [clientAlice, clientBob] = await createClients(network, 2);
			const [clientCharlie1, clientCharlie2] = await createSameClients(network, 2);
			const message = 'Hello Bob!';

			expect(clientCharlie1.client.clientId).not.toBe(clientAlice.client.clientId);
			expect(clientCharlie1.publicKey).not.toBe(clientAlice.publicKey);

			const promises = Promise.allSettled([
				expect(withTimeout(clientCharlie1.client.once('message'), 100)).resolves.toBeDefined(),
				expect(withTimeout(clientCharlie2.client.once('message'), 100)).rejects.toBeDefined(),
				expect(withTimeout(clientBob.client.once('message'), 100)).rejects.toBeDefined(),
			]);

			await clientAlice.client.sendMessage({
				to: {
					publicKey: clientCharlie1.publicKey,
					clientId: clientCharlie1.client.clientId,
				},
				data: message,
			});

			await promises;
		});

		it('should able to respond to messages', async () => {
			const [clientAlice, clientBob] = await createClients(network, 2);

			const message = 'Hello Bob!';
			const response = 'Hello Alice!';

			const bobReceivedMessage = clientBob.client.once('message');
			const aliceReceivedMessage = clientAlice.client.once('message');

			await clientAlice.client.sendMessage({
				to: {
					publicKey: clientBob.publicKey,
				},
				data: message,
			});
			const bobMessage = await bobReceivedMessage;
			expect(bobMessage.data).toBe(message);

			// Respond to message using the 'from' fields

			await clientBob.client.sendMessage({
				to: bobMessage.from,
				data: response,
			});

			const aliceMessage = await aliceReceivedMessage;
			expect(aliceMessage.data).toBe(response);
		});
	});
});
