import {SignalingServer} from './server/SignalingServer';
import {WebSocketNetwork, WebSocketNetworkAdapter} from './network/websocket';
import {generateKeyPair} from './crypto';
import {DocumentSharingClient} from './client/DocumentSharingClient';
import {encode} from 'cbor-x';

(async () => {
	const server = new SignalingServer({
		network: new WebSocketNetwork({
			host: 'localhost',
			port: 8080,
		}),
	});

	await server.listen();
	console.log('Signaling server listening on port 8080');

	const clientAlice = new DocumentSharingClient({
		...generateKeyPair(),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
	});

	const clientBob = new DocumentSharingClient({
		...generateKeyPair(),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
	});

	const document = await clientAlice.createDocument('Hello World!', [
		clientBob.publicKey,
	]);

	await Promise.all([
		clientAlice.connect(),
		clientBob.connect(),
	]);
	console.log('All clients connected');

	clientAlice.on('share-document', async ({document, to}) => {
		console.log('Sharing document:', document.getDocumentData(), 'to:', to);
	});

	clientBob.on('document', async document => {
		console.log('Received document:', document.getDocumentData());
		await document.updateDocument(encode('A whole new world!'), clientBob.privateKey);
		console.log('Updated document:', document.getDocumentData());
	});

	await clientBob.requestDocument(document.getDocumentAddress());
})();
