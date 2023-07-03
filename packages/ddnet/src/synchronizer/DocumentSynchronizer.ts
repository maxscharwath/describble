import Emittery from 'emittery';
import * as A from '@automerge/automerge';
import {type Document} from '../document/Document';
import {type DocumentPeers, type Peer, type PeerManager} from '../client/PeerManager';
import {throttle} from '../utils';

type PeerId = string;

type DocumentSynchronizerEvent = {
	message: {
		peerId: PeerId;
		message: Uint8Array;
	};
};

type PeerInfo = {
	peer: Peer;
	syncState: A.SyncState;
};

export class DocumentSynchronizer extends Emittery<DocumentSynchronizerEvent> {
	private readonly peers = new Map<PeerId, PeerInfo>();
	private readonly documentPeers: DocumentPeers;

	constructor(private readonly document: Document<unknown>, peerManager: PeerManager) {
		super();
		// Throttle the syncWithPeers function to only run every 33ms (30fps)
		const throttledSync = throttle(() => this.syncWithPeers(), 33);
		document.on('change', () => {
			throttledSync();
		});

		this.documentPeers = peerManager.getDocumentPeers(document.id, 0x01);
		this.documentPeers.onJoin(peer => {
			this.addPeer(peer);
		});
		this.documentPeers.onLeave(peer => {
			this.removePeer(peer);
		});

		this.documentPeers.onData((peer, message) => {
			this.processSyncMessage(peer.peerId, message);
		});
	}

	private addPeer(peer: Peer) {
		if (this.peers.has(peer.peerId)) {
			return;
		}

		console.log('addPeer', peer.peerId);
		this.peers.set(peer.peerId, {
			peer,
			syncState: A.initSyncState(),
		});
		this.sendSyncMessage(peer.peerId, this.document.data);
	}

	private removePeer({peerId}: Peer) {
		console.log('removePeer', peerId);
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
			const peerInfo = this.peers.get(peerId);
			if (peerInfo) {
				this.documentPeers.send(peerInfo.peer, message);
			}
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
