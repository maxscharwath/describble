import {useEffect, useState} from 'react';
import {type Document, type DocumentHeader} from '@describble/ddnet';
import {type DocumentMetadata, type SyncedDocument} from '~core/managers';
import {useWhiteboard} from '~core/hooks/useWhiteboard';

export const useDocument = (documentId: string) => {
	const [document, setDocument] = useState<Document<SyncedDocument, DocumentMetadata> | null>(null);

	const [header, setHeader] = useState<DocumentHeader<DocumentMetadata> | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const app = useWhiteboard();
	useEffect(() => {
		const fetchDocument = async () => {
			try {
				const doc = await app.documentManager.get(documentId);
				if (doc) {
					setDocument(doc);
					setHeader(doc.header);
				}
			} catch (cause) {
				setError(new Error('Failed to fetch document', {cause}));
			}
		};

		void fetchDocument();
	}, [documentId, app]);

	useEffect(() => {
		const unsubscribe = document?.on('header-updated', ({header}) => {
			setHeader(header);
		});
		return () => {
			unsubscribe?.();
		};
	}, [document]);

	return {document, header, error};
};
