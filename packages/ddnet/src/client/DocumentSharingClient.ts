import {base58} from 'base-x';
import {encode} from 'cbor-x';
import Emittery from 'emittery';
import {z} from 'zod';
import {SignalingClient, type SignalingClientConfig} from './SignalingClient';
import {SecureDocument} from '../SecureDocument';
import {MessageExchanger} from './MessageExchanger';

// Configuration type for the document sharing client, which is the same as the signaling client config
type DocumentSharingClientConfig = SignalingClientConfig;

// The types of events that the document sharing client can emit
type DocumentSharingClientEvent = {
	document: SecureDocument;
	'share-document': {
		document: SecureDocument;
		to: {
			publicKey: Uint8Array;
			clientId: Uint8Array;
		};
	};
};

// Schema for a request document message
const RequestDocumentMessageSchema = z.object({
	type: z.literal('request-document'),
	documentAddress: z.instanceof(Uint8Array),
});

// Schema for a document response message
const ResponseDocumentMessageSchema = z.object({
	type: z.literal('document-response'),
	document: z.instanceof(Uint8Array),
});

/**
 * The DocumentSharingClient class handles the sharing of documents over the signaling server.
 * It uses the MessageExchanger class to send and receive fully verified and typed messages.
 */
export class DocumentSharingClient extends Emittery<DocumentSharingClientEvent> {
	// The signaling client used for communication
	private readonly client: SignalingClient;
	// A map of documents, keyed by their base58 encoded addresses
	private readonly documents = new Map<string, SecureDocument>();
	// The message exchanger for sending and receiving messages
	private readonly exchanger: MessageExchanger<[typeof RequestDocumentMessageSchema, typeof ResponseDocumentMessageSchema]>;

	/**
   * Creates a new DocumentSharingClient.
   * @param config - The configuration for the signaling client and the document sharing client.
   */
	constructor(private readonly config: DocumentSharingClientConfig) {
		super();
		this.client = new SignalingClient(config);
		this.exchanger = new MessageExchanger(this.client, [
			RequestDocumentMessageSchema,
			ResponseDocumentMessageSchema,
		]);

		// Handle request document messages
		this.exchanger.on('request-document', async message => {
			const document = this.documents.get(base58.encode(message.data.documentAddress));
			if (document?.hasAllowedUser(message.from.publicKey)) {
				void this.emit('share-document', {
					document,
					to: message.from,
				});

				await this.exchanger.sendMessage({
					type: 'document-response',
					document: document.exportDocument(),
				}, message.from);
			}
		});

		// Handle document response messages
		this.exchanger.on('document-response', message => {
			void this.emit('document', SecureDocument.importDocument(
				message.data.document,
			));
		});
	}

	// Public key getter
	public get publicKey() {
		return this.client.publicKey;
	}

	// Private key getter
	public get privateKey() {
		return this.config.privateKey;
	}

	// Connect method
	public async connect() {
		return this.client.connect();
	}

	// Disconnect method
	public async disconnect() {
		return this.client.disconnect();
	}

	/**
   * Creates a new document, encodes it, and adds it to the documents map.
   * @param data - The data to be added to the document.
   * @param allowedClients - An array of public keys of clients who are allowed to access the document.
   * @returns The created document.
   */
	public async createDocument(data: any, allowedClients: Uint8Array[] = []) {
		const document = await SecureDocument.create(
			this.config.privateKey,
			encode(data),
			allowedClients,
		);
		this.documents.set(
			base58.encode(document.getDocumentAddress()),
			document,
		);
		return document;
	}

	/**
   * Sends a request document message to the signaling server.
   * @param documentAddress - The address of the document to be requested.
   * @returns A promise that resolves when the message is sent.
   */
	public async requestDocument(documentAddress: Uint8Array) {
		return this.exchanger.sendMessage({
			type: 'request-document',
			documentAddress,
		});
	}
}
