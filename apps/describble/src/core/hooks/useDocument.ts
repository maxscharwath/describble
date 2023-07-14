import {useEffect, useState} from 'react';
import {type Document} from '@ddnet/core';
import {type SyncedDocument} from '~core/managers';
import {useWhiteboard} from '~core/hooks/useWhiteboard';

export const useDocument = (documentId: string) => {
	const [document, setDocument] = useState<Document<SyncedDocument> | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const app = useWhiteboard();
	useEffect(() => {
		const fetchDocument = async () => {
			try {
				const doc = await app.documentManager.get(documentId);
				setDocument(doc ?? null);
			} catch (cause) {
				setError(new Error('Failed to fetch document', {cause}));
			}
		};

		void fetchDocument();
	}, [documentId, app]);

	return {document, error};
};
