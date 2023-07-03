import Emittery from 'emittery';
import {throttle} from '../utils';
import {type ClientIdentity, type DocumentPeers, type Peer, type PeerId, type PeerManager} from '../client/PeerManager';
import {decode, encode} from 'cbor-x';

type PresenceMessage = {
	peerId: string;
	client: ClientIdentity;
	presence: unknown;
};

type DocumentPresenceEvent = {
	change: PresenceMessage;
};

export class DocumentPresence extends Emittery<DocumentPresenceEvent> {
	public readonly sendPresenceMessage = throttle(<T>(message: T) => {
		this.documentPeers.broadcast(encode(message));
	}, 33);

	public readonly stop: () => void;

	private readonly documentPeers: DocumentPeers;

	private readonly presence = new Map<PeerId, PresenceMessage>();

	constructor(documentId: string, peerManager: PeerManager) {
		super();
		this.documentPeers = peerManager.getDocumentPeers(documentId, 0x02);
		const unsubOnData = this.documentPeers.onData((peer, message) => {
			this.processPresenceMessage(peer, message);
		});
		const unsubOnLeave = this.documentPeers.onLeave(peer => {
			this.presence.delete(peer.peerId);
		});

		this.stop = () => {
			unsubOnData();
			unsubOnLeave();
			this.presence.clear();
			this.clearListeners();
		};
	}

	public getPresence(): PresenceMessage[] {
		return Array.from(this.presence.values());
	}

	private processPresenceMessage(peer: Peer, message: Uint8Array) {
		try {
			const presence: PresenceMessage = {
				peerId: peer.peerId,
				client: peer.client,
				presence: decode(message),
			};
			this.presence.set(peer.peerId, presence);
			void this.emit('change', presence);
		} catch (e) {
			console.error(e);
		}
	}
}
