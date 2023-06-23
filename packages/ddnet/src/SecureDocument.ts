import {v4 as uuidv4, v5 as uuidv5} from 'uuid';
import {createSignature, getPublicKey, uint8ArrayEquals, verifySignature} from './crypto';
import {decode, encode} from 'cbor-x';

type DocumentHeader = {
	id: Uint8Array;
	owner: Uint8Array;
	allowedClients: Uint8Array[];
};

type RawDocument = {
	header: Uint8Array;
	headerSignature: Uint8Array;
	content: Uint8Array;
	contentSignature: Uint8Array;
};

/**
 * Error indicating that a document is invalid
 */
export class DocumentValidationError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'DocumentValidationError';
	}
}

/**
 * Error indicating unauthorized access
 */
export class UnauthorizedAccessError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'UnauthorizedAccessError';
	}
}

/**
 * Class for Secure Document Management
 */
export class SecureDocument {
	private decodedHeader!: DocumentHeader;

	/**
	 * Create a SecureDocument object.
	 *
	 * @param rawDocument - The raw document to be secured
	 */
	protected constructor(private readonly rawDocument: RawDocument) {
		this.refreshHeaderCache();
		this.verifyDocument();
	}

	/**
	 * Updates the document's content and re-signs it.
	 *
	 * @param newContent - The new content to update
	 * @param privateKey - The private key to sign the document
	 */
	public async updateDocument(newContent: Uint8Array, privateKey: Uint8Array): Promise<void> {
		this.assertAuthorizedUpdate(privateKey);
		this.rawDocument.content = newContent;
		this.rawDocument.contentSignature = await createSignature(newContent, privateKey);
	}

	/**
	 * Updates the document's allowed users and re-signs it.
	 *
	 * @param newAllowedClients - The new list of allowed clients
	 * @param privateKey - The private key to sign the document
	 */
	public async updateAllowedUsers(newAllowedClients: Uint8Array[], privateKey: Uint8Array): Promise<void> {
		this.assertAuthorizedOwner(privateKey);
		await this.updateHeader({allowedClients: newAllowedClients}, privateKey);
	}

	/**
	 * Returns a copy of the document's content.
	 *
	 * @returns The raw document content
	 */
	public getDocumentData(): Uint8Array {
		return new Uint8Array(this.rawDocument.content);
	}

	/**
	 * Returns a copy of the document header.
	 *
	 * @returns The document header
	 */
	public getDocumentHeader(): DocumentHeader {
		return structuredClone(this.decodedHeader);
	}

	/**
	 * Checks if a user is allowed to access the document.
	 *
	 * @param publicKey - The public key of the user
	 * @returns True if the user is allowed, False otherwise
	 */
	public hasAllowedUser(publicKey: Uint8Array): boolean {
		return this.decodedHeader.allowedClients.some(client => uint8ArrayEquals(client, publicKey)) || uint8ArrayEquals(this.decodedHeader.owner, publicKey);
	}

	/**
	 * Verifies if the provided address matches the document's address.
	 *
	 * @param address - The address to compare with
	 * @returns True if the addresses match, False otherwise
	 */
	public verifyDocumentAddress(address: Uint8Array): boolean {
		return uint8ArrayEquals(this.getDocumentAddress(), address);
	}

	/**
	 * Encodes the document into CBOR format.
	 *
	 * @returns The encoded document
	 */
	public exportDocument(): Uint8Array {
		this.verifyDocument();
		return encode(this.rawDocument);
	}

	/**
	 * Generates the document address.
	 *
	 * @returns The generated document address
	 * @private
	 */
	public getDocumentAddress(): Uint8Array {
		// Generate address based on owner's public key and document ID
		return uuidv5(this.decodedHeader.owner, this.decodedHeader.id, new Uint8Array(16));
	}

	/**
	 * Updates the document header with the new fields and re-signs it.
	 *
	 * @param newFields - The new fields to update in the document header
	 * @param privateKey - The private key to sign the document
	 * @private
	 */
	private async updateHeader(newFields: Partial<DocumentHeader>, privateKey: Uint8Array): Promise<void> {
		// Update the document header with new fields and re-sign
		this.decodedHeader = {...this.decodedHeader, ...newFields};
		this.rawDocument.header = encode(this.decodedHeader);
		this.rawDocument.headerSignature = await createSignature(this.rawDocument.header, privateKey);
	}

	/**
	 * Decodes the document header for further use.
	 *
	 * @private
	 */
	private refreshHeaderCache(): void {
		// Decode header for further use
		try {
			this.decodedHeader = decode(this.rawDocument.header) as DocumentHeader;
		} catch (cause) {
			throw new DocumentValidationError('Invalid document header.', {cause});
		}
	}

	/**
	 * Throws an error if a user is not allowed to update the document.
	 *
	 * @param privateKey - The private key of the user
	 * @private
	 */
	private assertAuthorizedUpdate(privateKey: Uint8Array): void {
		// Throw error if not an allowed user
		if (!this.hasAllowedUser(getPublicKey(privateKey))) {
			throw new UnauthorizedAccessError('Only the document owner or allowed users can update the document.');
		}
	}

	/**
	 * Throws an error if a user is not the owner of the document.
	 *
	 * @param privateKey - The private key of the user
	 * @private
	 */
	private assertAuthorizedOwner(privateKey: Uint8Array): void {
		// Throw error if not the owner
		if (!uint8ArrayEquals(getPublicKey(privateKey), this.decodedHeader.owner)) {
			throw new UnauthorizedAccessError('Only the document owner can update the allowed users list.');
		}
	}

	/**
	 * Verifies the document's signatures.
	 *
	 * @private
	 */
	private verifyDocument(): void {
		// Verify header signature
		if (!verifySignature(this.rawDocument.header, this.rawDocument.headerSignature, this.decodedHeader.owner)) {
			throw new DocumentValidationError('Header signature is invalid');
		}

		// Verify content signature
		if (!this.verifyContentSignature(this.rawDocument.content, this.rawDocument.contentSignature)) {
			throw new DocumentValidationError('Content signature is invalid');
		}
	}

	/**
	 * Verifies the content signature of the document.
	 *
	 * @param content - The content of the document
	 * @param signature - The signature of the content
	 * @returns True if the content signature is verified, False otherwise
	 * @private
	 */
	private verifyContentSignature(content: Uint8Array, signature: Uint8Array): boolean {
		// Verify the content signature using the owner's public key or one of the allowed clients' public key
		return verifySignature(content, signature, this.decodedHeader.owner) || this.decodedHeader.allowedClients.some(client => verifySignature(content, signature, client));
	}

	/**
	 * Creates a new SecureDocument.
	 *
	 * @param privateKey - The private key to sign the document
	 * @param content - The content of the document
	 * @param allowedClients - The list of clients allowed to modify the document, defaults to an empty list
	 * @returns The newly created SecureDocument
	 */
	public static async create(privateKey: Uint8Array, content: Uint8Array, allowedClients: Uint8Array[] = []): Promise<SecureDocument> {
		const owner = getPublicKey(privateKey);
		const header = encode({
			id: uuidv4({}, new Uint8Array(16)), // Generate a random ID
			owner,
			allowedClients,
		});

		// Sign the header and content in parallel
		const [headerSignature, contentSignature] = await Promise.all([
			createSignature(header, privateKey),
			createSignature(content, privateKey),
		]);

		return new SecureDocument({
			header,
			headerSignature,
			content,
			contentSignature,
		});
	}

	/**
	 * Decodes a CBOR-encoded document and constructs a SecureDocument instance.
	 *
	 * @param data - The encoded document
	 * @returns The constructed SecureDocument instance
	 */
	public static importDocument(data: Uint8Array): SecureDocument {
		let rawDocument: RawDocument;
		try {
			rawDocument = decode(data) as RawDocument;
		} catch (cause) {
			throw new DocumentValidationError('Document is not a valid CBOR-encoded object', {cause});
		}

		return new SecureDocument(rawDocument);
	}
}
