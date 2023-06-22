import {DocRepository} from './DocRepository';
import {DocumentSynchronizer} from './Synchronizer';
import {generateKeyPair, type Key} from './Key';
import {HashMap} from './HashMap';

const repo = new DocRepository();
repo.on('document', ({document}) => {
	document.request();
	const synchroniser = new DocumentSynchronizer(document);
	synchroniser.on('message', message => {
		console.log(message);
	});
});
const doc = repo.findDocument<{
	title: string;
}>('test');
doc.change(doc => {
	doc.title = 'test';
});

console.log(doc.value);

const keys = new HashMap<Key, string>();
const alice = generateKeyPair();
const bob = generateKeyPair();
keys.set(alice.publicKey, 'alice');
keys.set(bob.publicKey, 'bob');

console.log(keys.get(alice.publicKey.clone()));
console.log(keys.set(alice.publicKey.clone(), 'alice2'));
console.log(keys.get(alice.publicKey.clone()));

keys.forEach((value, key) => {
	console.log(key, value);
});
