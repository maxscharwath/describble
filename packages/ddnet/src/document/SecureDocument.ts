import {Document} from './Document';
import * as A from '@automerge/automerge';
import {createSignature, getPublicKey} from '../crypto';
import {decode, encode} from 'cbor-x';
import {DocumentHeader} from './DocumentHeader';

export class UnauthorizedAccessError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'UnauthorizedAccessError';
	}
}

export class DocumentValidationError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'DocumentValidationError';
	}
}

export class SecureDocument extends Document<unknown> {
	constructor(public readonly header: DocumentHeader) {
		super();
	}

	public export(privateKey: Uint8Array): Uint8Array {
		const header = this.header.export();

		if (!this.header.hasAllowedUser(getPublicKey(privateKey))) {
			throw new UnauthorizedAccessError('Only the document owner or an allowed user can export the document.');
		}

		const content = A.save(this.value);
		const signature = createSignature(content, privateKey);
		return encode({
			header,
			content,
			signature,
		});
	}

	public static import(rawDocument: Uint8Array): SecureDocument {
		const {header: rawHeader, content, signature} = decode(rawDocument) as {header: Uint8Array; content: Uint8Array; signature: Uint8Array};
		const header = DocumentHeader.import(rawHeader);

		if (!header.verifySignature(content, signature)) {
			throw new DocumentValidationError('Invalid document signature.');
		}

		const document = new SecureDocument(header);
		document.load(content);
		return document;
	}

	public static create(privateKey: Uint8Array, allowedClients: Uint8Array[] = []): SecureDocument {
		const header = DocumentHeader.create(privateKey, allowedClients);
		return new SecureDocument(header);
	}
}
