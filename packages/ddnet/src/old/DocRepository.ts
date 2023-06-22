import {v4 as uuidv4} from 'uuid';
import {Document} from './Document';
import Emittery from 'emittery';

type DocRepositoryEvents = {
	'document': {document: Document<unknown>};
	'delete-document': {document: Document<unknown>};
};

export class DocRepository extends Emittery<DocRepositoryEvents> {
	private readonly documents = new Map<string, Document<unknown>>();

	public createDocument<T>(): Document<T> {
		const documentId = uuidv4();
		const document = this.getDocument(documentId, true);
		void this.emit('document', {document});
		return document as Document<T>;
	}

	public findDocument<T>(documentId: string): Document<T> {
		const document = this.getDocument(documentId);
		void this.emit('document', {document});
		return document as Document<T>;
	}

	public deleteDocument(documentId: string) {
		const document = this.getDocument(documentId);
		document.delete();
		this.documents.delete(documentId);
		void this.emit('delete-document', {document});
	}

	private getDocument<T>(documentId: string, isNew = false) {
		if (this.documents.has(documentId)) {
			return this.documents.get(documentId) as Document<T>;
		}

		const document = new Document(documentId, {isNew});
		this.documents.set(documentId, document);
		return document as Document<T>;
	}
}
