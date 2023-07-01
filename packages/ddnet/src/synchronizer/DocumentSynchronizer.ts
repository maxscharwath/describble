import Emittery from 'emittery';
import * as A from '@automerge/automerge';
import {type Document} from '../document/Document';
import {type Peer} from '../client/PeerManager';

type PeerId = string;

type DocumentSynchronizerEvent = {
	message: {
		peerId: PeerId;
		message: Uint8Array;
	};
};

type PeerInfo = {
	peer: Peer;
	clear: () => void;
	syncState: A.SyncState;
};

export class DocumentSynchronizer extends Emittery<DocumentSynchronizerEvent> {
	private readonly peers = new Map<PeerId, PeerInfo>();

	constructor(private readonly document: Document<unknown>) {
		super();
		document.on('change', () => {
			this.syncWithPeers();
		});
	}

	public addPeer(peer: Peer) {
		if (this.peers.has(peer.peerId)) {
			return;
		}

		const clear = peer.connection.on('data', message => {
			this.processSyncMessage(peer.peerId, message);
		});

		const peerInfo: PeerInfo = {
			peer,
			clear,
			syncState: A.initSyncState(),
		};
		this.peers.set(peer.peerId, peerInfo);
		this.sendSyncMessage(peer.peerId, this.document.data);
	}

	public removePeer({peerId}: Peer) {
		this.peers.get(peerId)?.clear();
		this.peers.delete(peerId);
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
		const doc = this.document.data;
		this.peers.forEach((_, peerId) => {
			this.sendSyncMessage(peerId, doc);
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
			this.peers.get(peerId)?.peer.connection.send(message);
		}
	}

	private getSyncState(peerId: PeerId) {
		return this.peers.get(peerId)?.syncState ?? A.initSyncState();
	}

	private setSyncState(peerId: PeerId, syncState: A.SyncState) {
		const peerInfo = this.peers.get(peerId);
		if (peerInfo) {
			peerInfo.syncState = syncState;
		}
	}
}
