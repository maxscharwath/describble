import Emittery from 'emittery';
import * as A from '@automerge/automerge';
import {type Document} from '../document/Document';

type PeerId = string;

type DocumentSynchronizerEvent = {
	message: {
		peerId: PeerId;
		message: Uint8Array;
	};
};

export class DocumentSynchronizer extends Emittery<DocumentSynchronizerEvent> {
	private readonly peers = new Map<PeerId, A.SyncState>();
	constructor(private readonly document: Document<unknown>) {
		super();
		document.on('change', () => {
			this.syncWithPeers();
		});
	}

	public beginSync(peerId: PeerId) {
		const syncStateRaw = this.getSyncState(peerId);
		const syncState = A.decodeSyncState(A.encodeSyncState(syncStateRaw));
		this.setSyncState(peerId, syncState);
		this.sendSyncMessage(peerId, this.document.value);
	}

	public endSync(peerId: PeerId) {
		this.peers.delete(peerId);
	}

	public receiveSyncMessage(peerId: PeerId, message: Uint8Array) {
		this.processSyncMessage(peerId, message);
	}

	private processSyncMessage(peerId: PeerId, message: Uint8Array) {
		this.document.update(doc => {
			const [newDoc, newSyncState] = A.receiveSyncMessage(
				doc,
				this.getSyncState(peerId),
				message,
			);
			this.setSyncState(peerId, newSyncState);
			this.sendSyncMessage(peerId, newDoc);
			return newDoc;
		});
	}

	private syncWithPeers() {
		const doc = this.document.value;
		this.peers.forEach((_, peer) => {
			this.sendSyncMessage(peer, doc);
		});
	}

	private sendSyncMessage(peerId: PeerId, doc: A.Doc<unknown>) {
		const syncState = this.getSyncState(peerId);
		const [newSyncState, message] = A.generateSyncMessage(doc, syncState);
		this.setSyncState(peerId, newSyncState);
		if (message) {
			void this.emit('message', {
				peerId,
				message,
			});
		}
	}

	private getSyncState(peerId: PeerId) {
		return this.peers.get(peerId) ?? A.initSyncState();
	}

	private setSyncState(peerId: PeerId, syncState: A.SyncState) {
		this.peers.set(peerId, syncState);
	}
}
