import {SignalingClient, type SignalingClientConfig} from './SignalingClient';
import {
	SecureDocument,
} from '../SecureDocument';
import {base58} from 'base-x';
import {type Message} from '../Message';
import {encode} from 'cbor-x';
import Emittery from 'emittery';

type RequestDocumentMessage = {
	type: 'request-document';
	documentAddress: Uint8Array;
};

type ResponseDocumentMessage = {
	type: 'document-response';
	document: Uint8Array;
};

type DocumentSharingClientConfig = SignalingClientConfig;

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

export class DocumentSharingClient extends Emittery<DocumentSharingClientEvent> {
	private readonly client: SignalingClient;
	private readonly documents = new Map<string, SecureDocument>();
	constructor(private readonly config: DocumentSharingClientConfig) {
		super();
		this.client = new SignalingClient(config);
		this.client.on('message', async (message: Message<RequestDocumentMessage | ResponseDocumentMessage>) => {
			if (message.data.type === 'request-document') {
				const document = this.documents.get(base58.encode(message.data.documentAddress));
				if (document?.hasAllowedUser(message.from.publicKey)) {
					void this.emit('share-document', {
						document,
						to: message.from,
					});
					await this.client.sendMessage({
						to: message.from,
						data: {
							type: 'document-response',
							document: document.exportDocument(),
						},
					});
				}
			} else if (message.data.type === 'document-response') {
				void this.emit('document', SecureDocument.importDocument(message.data.document));
			}
		});
	}

	public get publicKey() {
		return this.client.publicKey;
	}

	public get privateKey() {
		return this.config.privateKey;
	}

	public async connect() {
		return this.client.connect();
	}

	public async disconnect() {
		return this.client.disconnect();
	}

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

	public async requestDocument(documentAddress: Uint8Array) {
		return this.client.sendMessage({
			data: {
				type: 'request-document',
				documentAddress,
			},
		});
	}
}
