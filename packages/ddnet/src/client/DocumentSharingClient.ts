import {base58} from 'base-x';
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
	documentAddress: z.instanceof(Uint8Array),
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

	private readonly synchronizers = new Map<string, DocumentSynchronizer>();

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

		const storage = new Storage(
			new SecureStorageProvider(
				config.storageProvider,
				config.privateKey,
			),
		);

		this.on('document', document => {
			const documentId = base58.encode(document.header.address);
			document.on('change', () => {
				void storage.save(documentId, document.value);
			});
			this.synchronizers.set(documentId, new DocumentSynchronizer(document));
		});

		this.peerManager.on('peer-created', ({documentAddress, peer}) => {
			this.synchronizers.get(base58.encode(documentAddress))?.addPeer(peer);
		});

		this.peerManager.on('peer-destroyed', ({documentAddress, peer}) => {
			this.synchronizers.get(base58.encode(documentAddress))?.removePeer(peer);
		});

		// Handle request document messages
		this.exchanger.on('request-document', async message => {
			const document = this.find(message.data.documentAddress);
			if (document?.header.hasAllowedUser(message.from.publicKey)) {
				await this.exchanger.sendMessage({
					type: 'document-response',
					document: document.export(this.privateKey),
				}, message.from);

				void this.emit('share-document', {
					document,
					to: message.from,
				});

				this.peerManager.createPeer(true, message.data.documentAddress, message.from);
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
