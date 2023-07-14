import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {generateKeyPair} from '../src';
import {MockNetwork, MockNetworkAdapter} from './MockNetwork';
import {MessageExchanger} from '../src/exchanger/MessageExchanger';
import {z} from 'zod';
import {SignalingClient} from '../src/client/SignalingClient';
import {SignalingServer} from '../src/server/SignalingServer';

const wait = async (ms: number) => new Promise(resolve => {
	setTimeout(resolve, ms);
});

// Define a simple message schema for testing
const testSchema = z.object({
	type: z.literal('test'),
	payload: z.string(),
});

type MockClient = {
	privateKey: Uint8Array;
	client: SignalingClient;
	publicKey: Uint8Array;
};

// Creates a new client for testing
async function createClient(network: MockNetwork): Promise<MockClient> {
	const client = new SignalingClient({
		network: new MockNetworkAdapter(network),
	});
	const credentials = generateKeyPair();
	await client.connect(credentials);
	return {client, ...credentials};
}

describe('MessageExchanger', () => {
	let messageExchangerAlice: MessageExchanger<typeof testSchema>;
	let messageExchangerBob: MessageExchanger<typeof testSchema>;
	let mockClientAlice: MockClient;
	let mockClientBob: MockClient;
	let mockNetwork: MockNetwork;
	let server: SignalingServer;

	beforeEach(async () => {
		mockNetwork = new MockNetwork();
		server = new SignalingServer({network: mockNetwork});
		await server.listen();
		mockClientAlice = await createClient(mockNetwork);
		mockClientBob = await createClient(mockNetwork);

		messageExchangerAlice = new MessageExchanger([testSchema]);
		messageExchangerAlice.setClient(mockClientAlice.client);

		messageExchangerBob = new MessageExchanger([testSchema]);
		messageExchangerBob.setClient(mockClientBob.client);
	});

	afterEach(async () => {
		await server.close();
		vi.restoreAllMocks();
	});

	it('should send messages', async () => {
		const testMessage = {type: 'test', payload: 'Hello, Bob!'} as const;

		const messageSpy = vi.spyOn(mockClientAlice.client, 'sendMessage');

		await messageExchangerAlice.sendMessage(testMessage, {publicKey: mockClientBob.publicKey, clientId: mockClientBob.client.clientId});

		expect(messageSpy).toHaveBeenCalledTimes(1);
		expect(messageSpy).toHaveBeenCalledWith({
			to: {publicKey: mockClientBob.publicKey, clientId: mockClientBob.client.clientId},
			data: testMessage,
		});
	});

	it('should log error if incoming message fails validation', async () => {
		const invalidMessage = {type: 'invalid', payload: 12345} as const;

		const messageHandler = vi.fn();

		messageExchangerBob.on('test', messageHandler);

		// @ts-expect-error - We want to test invalid messages
		await expect(messageExchangerAlice.sendMessage(invalidMessage, {publicKey: mockClientBob.publicKey, clientId: mockClientBob.client.clientId})).rejects.toThrow();
		expect(messageHandler).not.toHaveBeenCalled();
	});

	it('should throw if no signaling client is provided', async () => {
		const testMessage = {type: 'test', payload: 'Hello, Bob!'} as const;
		const messageExchanger = new MessageExchanger([testSchema]);
		await expect(messageExchanger.sendMessage(testMessage, {
			publicKey: mockClientBob.publicKey,
			clientId: mockClientBob.client.clientId,
		})).rejects.toThrow();
	});

	it('should not handle unknown messages', async () => {
		const testMessage = {type: 'unknown', payload: 'Hello, Bob!'} as const;

		const messageHandler = vi.fn();

		// @ts-expect-error - We want to test unknown messages
		messageExchangerBob.on('unknown', messageHandler);

		await mockClientAlice.client.sendMessage({
			to: {publicKey: mockClientBob.publicKey, clientId: mockClientBob.client.clientId},
			data: testMessage,
		});

		await wait(10);

		expect(messageHandler).not.toHaveBeenCalled();
	});
});
