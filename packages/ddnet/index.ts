import 'fake-indexeddb/auto';
import {
	SignalingServer,
	WebSocketNetwork,
	WebSocketNetworkAdapter,
	DocumentSharingClient,
	generateKeyPair,
	mnemonicToSeedSync,
} from './src';
import {base58} from 'base-x';
import {NodeFileStorageProvider} from './src/storage/NodeFileStorageProvider';
import {IDBStorageProvider} from './src/storage/IDBStorageProvider';

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
		...generateKeyPair(
			mnemonicToSeedSync('arrow armor boat cart circle tenant couple beef luggage ginger color effort'),
		),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new NodeFileStorageProvider('.ddnet/alice'),
	});

	const clientBob = new DocumentSharingClient({
		...generateKeyPair(
			mnemonicToSeedSync('accident observe boss minute mixture goddess trash craft candy smooth rubber coffee'),
		),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new NodeFileStorageProvider('.ddnet/bob'),
	});

	const clientCharlie = new DocumentSharingClient({
		...generateKeyPair(
			mnemonicToSeedSync('apology lazy vocal help film slice journey panic table either view hole'),
		),
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new IDBStorageProvider(),
	});

	const documentList = await clientAlice.listDocumentIds();
	let document = documentList.length > 0 ? await clientAlice.find<{title: string}>(documentList[0]) : null;
	if (!document) {
		console.log('Creating new document');
		document = clientAlice.create<{title: string}>([clientBob.publicKey, clientCharlie.publicKey]);
	}

	const document2 = document.clone();
	clientCharlie.add(document2);

	await Promise.all([
		clientAlice.connect(),
		clientBob.connect(),
		clientCharlie.connect(),
	]);
	console.log('All clients connected');

	clientAlice.on('share-document', async ({document, to}) => {
		console.log(`Alice(${base58.encode(clientAlice.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, document.id);
	});

	clientCharlie.on('share-document', async ({document, to}) => {
		console.log(`Charlie(${base58.encode(clientCharlie.publicKey)}) shared a document with ${base58.encode(to.publicKey)}`, document.id);
	});

	await clientBob.requestDocument(document.id).then(() => console.log('Bob broadcasted a document request'));

	setInterval(() => {
		document?.change(doc => {
			doc.title = `It's ${new Date().toLocaleTimeString()}`;
		});
	}, 1000);
})();
