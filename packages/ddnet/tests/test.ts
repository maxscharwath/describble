import 'fake-indexeddb/auto';
import {base58} from '@ddnet/base-x';
import wrtc from '../src/wrtc';
import {SignalingServer} from '../src/server/SignalingServer';
import {WebSocketNetwork} from '../src/network/websocket/WebSocketNetwork';
import {NodeFileStorageProvider} from '../src/storage/NodeFileStorageProvider';
import {
	DocumentSharingClient,
	generatePrivateKey,
	IDBStorageProvider,
	mnemonicToSeedSync,
	WebSocketNetworkAdapter,
	KeyManager,
	SessionManager,
} from '../src';

(async () => {
	const server = new SignalingServer({
		network: new WebSocketNetwork({
			host: 'localhost',
			port: 8080,
		}),
	});

	await server.listen();
	console.log('Signaling server listening on port 8080');

	const keyManager = new KeyManager('ddnet-key');
	const aliceKey = await keyManager.saveKey(generatePrivateKey(mnemonicToSeedSync('arrow armor boat cart circle tenant couple beef luggage ginger color effort')), 'alice');
	const bobKey = await keyManager.saveKey(generatePrivateKey(mnemonicToSeedSync('accident observe boss minute mixture goddess trash craft candy smooth rubber coffee')), 'bob');
	const charlieKey = await keyManager.saveKey(generatePrivateKey(mnemonicToSeedSync('apology lazy vocal help film slice journey panic table either view hole')), 'charlie');

	const aliceSessionManager = new SessionManager(keyManager);
	const clientAlice = new DocumentSharingClient({
		sessionManager: aliceSessionManager,
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new NodeFileStorageProvider('.ddnet'),
		wrtc,
	});
	await aliceSessionManager.login(aliceKey, 'alice');

	const bobSessionManager = new SessionManager(keyManager);
	const clientBob = new DocumentSharingClient({
		sessionManager: bobSessionManager,
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new IDBStorageProvider(),
		wrtc,
	});
	await bobSessionManager.login(bobKey, 'bob');

	const charlieSessionManager = new SessionManager(keyManager);
	const clientCharlie = new DocumentSharingClient({
		sessionManager: charlieSessionManager,
		network: new WebSocketNetworkAdapter('ws://localhost:8080'),
		storageProvider: new NodeFileStorageProvider('.ddnet'),
		wrtc,
	});
	await charlieSessionManager.login(charlieKey, 'charlie');

	const documentList = await clientAlice.listDocumentIds();
	let document = documentList.length > 0 ? await clientAlice.findDocument<{title: string}>(documentList[0]) : null;
	if (!document) {
		console.log('Creating new document');
		document = clientAlice.createDocument<{title: string}>([clientBob.publicKey, clientCharlie.publicKey]);
	}

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

	await clientAlice.requestDocument(document.id).then(document => {
		console.log('Alice received document', document.id);
	});

	await clientBob.requestDocument(document.id).then(document => {
		console.log('Bob received document', document.id);
	});

	await clientCharlie.requestDocument(document.id).then(document => {
		console.log('Charlie received document', document.id);
	});

	setInterval(() => {
		document?.change(doc => {
			doc.title = `It's ${new Date().toLocaleTimeString()}`;
		});
	}, 1000);
})();
