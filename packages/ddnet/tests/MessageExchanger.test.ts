import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {generateKeyPair, SignalingClient, SignalingServer} from '../src';
import {MockNetwork, MockNetworkAdapter} from './MockNetwork';
import {MessageExchanger} from '../src/exchanger/MessageExchanger';
import {z} from 'zod';

const wait = async (ms: number) => new Promise(resolve => {
	setTimeout(resolve, ms);
});

// Define a simple message schema for testing
const testSchema = z.object({
	type: z.literal('test'),
	payload: z.string(),
});

// Creates a new client for testing
async function createClient(network: MockNetwork): Promise<SignalingClient> {
	const client = new SignalingClient({
		...generateKeyPair(),
		network: new MockNetworkAdapter(network),
	});
	await client.connect();
	return client;
}

describe('MessageExchanger', () => {
	let messageExchangerAlice: MessageExchanger<typeof testSchema>;
	let messageExchangerBob: MessageExchanger<typeof testSchema>;
	let mockClientAlice: SignalingClient;
	let mockClientBob: SignalingClient;
	let mockNetwork: MockNetwork;
	let server: SignalingServer;

	beforeEach(async () => {
		mockNetwork = new MockNetwork();
		server = new SignalingServer({network: mockNetwork});
		await server.listen();
		mockClientAlice = await createClient(mockNetwork);
		mockClientBob = await createClient(mockNetwork);

		messageExchangerAlice = new MessageExchanger([testSchema]);
		messageExchangerAlice.setClient(mockClientAlice);

		messageExchangerBob = new MessageExchanger([testSchema]);
		messageExchangerBob.setClient(mockClientBob);
	});

	afterEach(async () => {
		await server.close();
		vi.restoreAllMocks();
	});

	it('should handle incoming messages', async () => {
		const testMessage = {type: 'test', payload: 'Hello, Bob!'} as const;

		const messageHandler = vi.fn();

		messageExchangerBob.on('test', messageHandler);

		await messageExchangerAlice.sendMessage(testMessage, {publicKey: mockClientBob.publicKey, clientId: mockClientBob.clientId});

		await wait(10);

		expect(messageHandler).toHaveBeenCalledTimes(1);
	});

	it('should send messages', async () => {
		const testMessage = {type: 'test', payload: 'Hello, Bob!'} as const;

		const messageSpy = vi.spyOn(mockClientAlice, 'sendMessage');

		await messageExchangerAlice.sendMessage(testMessage, {publicKey: mockClientBob.publicKey, clientId: mockClientBob.clientId});

		expect(messageSpy).toHaveBeenCalledTimes(1);
		expect(messageSpy).toHaveBeenCalledWith({
			to: {publicKey: mockClientBob.publicKey, clientId: mockClientBob.clientId},
			data: testMessage,
		});
	});

	it('should log error if incoming message fails validation', async () => {
		const invalidMessage = {type: 'invalid', payload: 12345} as const;

		const messageHandler = vi.fn();

		messageExchangerBob.on('test', messageHandler);

		// @ts-expect-error - We want to test invalid messages
		await expect(messageExchangerAlice.sendMessage(invalidMessage, {publicKey: mockClientBob.publicKey, clientId: mockClientBob.clientId})).rejects.toThrow();
		expect(messageHandler).not.toHaveBeenCalled();
	});

	it('should throw if no signaling client is provided', async () => {
		const testMessage = {type: 'test', payload: 'Hello, Bob!'} as const;
		const messageExchanger = new MessageExchanger([testSchema]);
		await expect(messageExchanger.sendMessage(testMessage, {
			publicKey: mockClientBob.publicKey,
			clientId: mockClientBob.clientId,
		})).rejects.toThrow();
	});

	it('should not handle unknown messages', async () => {
		const testMessage = {type: 'unknown', payload: 'Hello, Bob!'} as const;

		const messageHandler = vi.fn();

		// @ts-expect-error - We want to test unknown messages
		messageExchangerBob.on('unknown', messageHandler);

		await mockClientAlice.sendMessage({
			to: {publicKey: mockClientBob.publicKey, clientId: mockClientBob.clientId},
			data: testMessage,
		});

		await wait(10);

		expect(messageHandler).not.toHaveBeenCalled();
	});
});
