import {z} from 'zod';
import {SignalingClient, type SignalingClientConfig} from './SignalingClient';
import {MessageExchanger} from '../exchanger/MessageExchanger';
import {PeerManager, SignalMessageSchema} from './PeerManager';
import {DocumentRegistry} from './DocumentRegistry';
import {Document} from '../document/Document';
import {DocumentSynchronizer} from '../synchronizer/DocumentSynchronizer';
import {Storage} from '../storage/Storage';
import {type StorageProvider} from '../storage/StorageProvider';
import {SecureStorageProvider} from '../storage/SecureStorageProvider';
import {type DocumentId} from '../types';

// Configuration type for the document sharing client, which is the same as the signaling client config
type DocumentSharingClientConfig = SignalingClientConfig & {
	storageProvider: StorageProvider;
};

type DocumentSharingClientEvent = {
	'share-document': {
		document: Document<any>;
		to: {publicKey: Uint8Array;clientId: Uint8Array};
	};
};

// Schema for a request document message
export const RequestDocumentMessageSchema = z.object({
	type: z.literal('request-document'),
	documentId: z.string(),
});

// Schema for a document response message
export const ResponseDocumentMessageSchema = z.object({
	type: z.literal('document-response'),
	document: z.instanceof(Uint8Array),
});

/**
 * The DocumentSharingClient class handles the sharing of documents over the signaling server.
 * It uses the MessageExchanger class to send and receive fully verified and typed messages.
 */
export class DocumentSharingClient extends DocumentRegistry<DocumentSharingClientEvent> {
	// The signaling client used for communication
	private readonly client: SignalingClient;
	// The message exchanger for sending and receiving messages
	private readonly exchanger = new MessageExchanger([
		RequestDocumentMessageSchema,
		ResponseDocumentMessageSchema,
		SignalMessageSchema,
	]);

	private readonly peerManager: PeerManager;
	private readonly storage: Storage;
	private readonly synchronizers = new Map<DocumentId, DocumentSynchronizer>();

	/**
   * Creates a new DocumentSharingClient.
   * @param config - The configuration for the signaling client and the document-sharing client.
   */
	constructor(private readonly config: DocumentSharingClientConfig) {
		super(config.privateKey);
		this.client = new SignalingClient(config);
		this.exchanger.setClient(this.client);
		this.peerManager = new PeerManager({
			exchanger: this.exchanger as MessageExchanger<typeof SignalMessageSchema>,
		});

		this.storage = new Storage(
			new SecureStorageProvider(
				config.storageProvider,
				config.privateKey,
			),
		);

		this.on('document', async document => {
			// TODO: Check document address and header version, to avoid saving old headers
			void this.storage.addDocument(document.id, document.header.export());
			document.on('change', () => {
				void this.storage.save(document.id, document.data);
			});
			this.synchronizers.set(document.id, new DocumentSynchronizer(document));
		});

		this.peerManager.on('peer-created', ({documentId, peer}) => {
			this.synchronizers.get(documentId)?.addPeer(peer);
		});

		this.peerManager.on('peer-destroyed', ({documentId, peer}) => {
			this.synchronizers.get(documentId)?.removePeer(peer);
		});

		// Handle request document messages
		this.exchanger.on('request-document', async message => {
			const {documentId} = message.data;
			const document = await this.find(documentId);
			if (document?.header.hasAllowedUser(message.from.publicKey)) {
				await this.exchanger.sendMessage({
					type: 'document-response',
					document: document.export(this.privateKey),
				}, message.from);

				void this.emit('share-document', {
					document,
					to: message.from,
				});

				this.peerManager.createPeer(true, documentId, message.from);
			}
		});

		// Handle document response messages
		this.exchanger.on('document-response', message => {
			this.add(Document.import(message.data.document));
		});
	}

	// Public key getter
	public get publicKey() {
		return this.client.publicKey;
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
	 * Sends a request document message to the signaling server.
	 * @returns A promise that resolves when the message is sent.
	 * @param documentId
	 */
	public async requestDocument(documentId: DocumentId) {
		return this.exchanger.sendMessage({
			type: 'request-document',
			documentId,
		});
	}

	async find<TData>(id: DocumentId): Promise<Document<TData> | undefined> {
		const document = await super.find<TData>(id);
		if (document) {
			return document;
		}

		const rawHeader = await this.storage.loadHeader(id);
		if (rawHeader) {
			const binary = await this.storage.loadBinary(id);
			return this.add(Document.fromRawHeader(rawHeader, binary));
		}
	}

	async listDocumentIds(): Promise<string[]> {
		return this.storage.list();
	}
}
