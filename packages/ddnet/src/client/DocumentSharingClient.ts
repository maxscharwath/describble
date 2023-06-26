import {base58} from 'base-x';
import {encode} from 'cbor-x';
import Emittery from 'emittery';
import {z} from 'zod';
import {SignalingClient, type SignalingClientConfig} from './SignalingClient';
import {SecureDocument} from '../SecureDocument';
import {MessageExchanger} from './MessageExchanger';
import SimplePeer from 'simple-peer';
import wrtc from '../wrtc';
import {sha256Some} from '../crypto';

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
	'peer-connected': {
		peer: SimplePeer.Instance;
		client: {
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

const SignalMessageSchema = z.object({
	type: z.literal('signal'),
	signal: z.any().refine((value): value is SimplePeer.SignalData => true),
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
	// A map of peers, keyed by their base58 encoded client hashes
	private readonly peers = new Map<string, SimplePeer.Instance>();
	// The message exchanger for sending and receiving messages
	private readonly exchanger = new MessageExchanger([
		RequestDocumentMessageSchema,
		ResponseDocumentMessageSchema,
		SignalMessageSchema,
	]);

	/**
   * Creates a new DocumentSharingClient.
   * @param config - The configuration for the signaling client and the document sharing client.
   */
	constructor(private readonly config: DocumentSharingClientConfig) {
		super();
		this.client = new SignalingClient(config);
		this.exchanger.setClient(this.client);

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

				this.createPeer(true, message.from);
			}
		});

		// Handle document response messages
		this.exchanger.on('document-response', message => {
			void this.emit('document', SecureDocument.importDocument(
				message.data.document,
			));
		});

		// Handle signal messages
		this.exchanger.on('signal', message => {
			const peer = this.createPeer(false, message.from);
			peer.signal(message.data.signal);
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

	public addDocument(document: SecureDocument) {
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

	private computeClientHash(publicKey: Uint8Array, clientId: Uint8Array) {
		return base58.encode(sha256Some(publicKey, clientId));
	}

	/**
	 * Creates a new peer and adds it to the peers map.
	 * if the peer already exists, it is returned.
	 * @param initiator - Whether or not the peer should be the initiator.
	 * @param messageFrom - The message from which the peer was created.
	 * @private
	 */
	private createPeer(initiator: boolean, messageFrom: {publicKey: Uint8Array; clientId: Uint8Array}) {
		const clientHash = this.computeClientHash(messageFrom.publicKey, messageFrom.clientId);

		if (this.peers.has(clientHash)) { // Peer already exists
			return this.peers.get(clientHash)!;
		}

		const peer = new SimplePeer({initiator, wrtc});

		peer.on('signal', signal => {
			void this.exchanger.sendMessage({
				type: 'signal',
				signal,
			}, messageFrom);
		});

		peer.on('connect', () => {
			void this.emit('peer-connected', {
				peer,
				client: messageFrom,
			});
		});

		peer.on('close', () => {
			console.log(`Connection to ${clientHash} closed`);
			this.peers.delete(clientHash);
		});

		peer.on('error', err => {
			console.error(`Error occurred in peer connection to ${clientHash}:`, err);
		});

		this.peers.set(clientHash, peer);

		return peer;
	}
}
