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

/**
 * DocumentSynchronizer class extends an Emittery that emits events with a structure described by DocumentSynchronizerEvent.
 * The purpose of this class is to manage the synchronization of a document between peers.
 */
export class DocumentSynchronizer extends Emittery<DocumentSynchronizerEvent> {
	private readonly peers = new Map<PeerId, PeerInfo>();
	private readonly documentPeers: DocumentPeers;

	/**
	 * Constructs a new DocumentSynchronizer.
	 * @param document - The document to be synchronized.
	 * @param peerManager - The PeerManager to manage the peers.
	 */
	public constructor(private readonly document: Document<unknown>, peerManager: PeerManager) {
		super();
		// Throttle the syncWithPeers function to only run every 33ms (30fps)
		// This is to prevent a flood of synchronization attempts if there are many rapid changes.
		const throttledSync = throttle(() => this.syncWithPeers(), 33);
		document.on('change', () => {
			throttledSync();
		});

		// Listen to peer joining, leaving, and data events for the document.
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

	/**
	 * Destroys the DocumentSynchronizer by disconnecting the documentPeers.
	 */
	public destroy() {
		this.documentPeers.disconnect();
		this.peers.clear();
		this.clearListeners();
	}

	/**
	 * Adds a new peer to the peers map and sends the current state of the document to the new peer.
	 * @param peer - The new peer.
	 */
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

	/**
	 * Removes a peer from the peers map.
	 * @param peer - The peer to be removed.
	 */
	private removePeer({peerId}: Peer) {
		console.log('removePeer', peerId);
		this.peers.delete(peerId);
	}

	/**
	 * Processes a synchronization message from a peer.
	 * @param peerId - The ID of the peer.
	 * @param message - The synchronization message.
	 */
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

	/**
	 * Synchronizes the document with all peers.
	 */
	private syncWithPeers() {
		const doc = this.document.data;
		this.peers.forEach((_, peerId) => {
			this.sendSyncMessage(peerId, doc);
		});
	}

	/**
	 * Sends a synchronization message to a peer.
	 * @param peerId - The ID of the peer.
	 * @param doc - The document to be synchronized.
	 */
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

	/**
	 * Gets the synchronization state for a peer.
	 * @param peerId - The ID of the peer.
	 * @returns The synchronization state.
	 */
	private getSyncState(peerId: PeerId) {
		return this.peers.get(peerId)?.syncState ?? A.initSyncState();
	}

	/**
	 * Sets the synchronization state for a peer.
	 * @param peerId - The ID of the peer.
	 * @param syncState - The new synchronization state.
	 */
	private setSyncState(peerId: PeerId, syncState: A.SyncState) {
		const peerInfo = this.peers.get(peerId);
		if (peerInfo) {
			peerInfo.syncState = syncState;
		}
	}
}
