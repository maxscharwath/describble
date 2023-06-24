import * as A from '@automerge/automerge';
import {type Document} from './Document';
import Emittery from 'emittery';

type SynchronizerEvents = {
	message: {
		publicKey: string;
		message: Uint8Array;
	};
};

export abstract class Synchronizer extends Emittery<SynchronizerEvents> {
	abstract receiveSyncMessage(publicKey: string, message: Uint8Array): void;
}

export class DocumentSynchronizer extends Synchronizer {
	private pendingSyncMessages: Array<{publicKey: string; message: Uint8Array}> = [];
	private readonly syncStates = new Map<string, A.SyncState>();

	constructor(private readonly document: Document<unknown>) {
		super();
		document.on('change', () => {
			this.sync();
		});
		void (async () => {
			await document.waitReadyOrRequesting();
			this.processAllPendingSyncMessages();
		})();
	}

	public receiveSyncMessage(publicKey: string, message: Uint8Array): void {
		if (!this.document.isReadyOrRequesting()) {
			this.pendingSyncMessages.push({publicKey, message});
			return;
		}

		this.processAllPendingSyncMessages();
		this.processSyncMessage(publicKey, message);
	}

	public async addPeer(publicKey: string) {
		const doc = await this.document.waitReadyOrRequesting();
		const syncState = A.decodeSyncState(
			A.encodeSyncState(this.getSyncState(publicKey)),
		);
		this.setSyncState(publicKey, syncState);
		this.sendSyncMessage(publicKey, doc);
	}

	private processSyncMessage(publicKey: string, message: Uint8Array) {
		this.document.update(doc => {
			const [newDoc, newSyncState] = A.receiveSyncMessage(
				doc,
				this.getSyncState(publicKey),
				message,
			);

			this.setSyncState(publicKey, newSyncState);
			this.sendSyncMessage(publicKey, doc);
			return newDoc;
		});
	}

	private getSyncState(publicKey: string): A.SyncState {
		const syncState = this.syncStates.get(publicKey);
		if (syncState) {
			return syncState;
		}

		return A.initSyncState();
	}

	private setSyncState(publicKey: string, syncState: A.SyncState) {
		this.syncStates.set(publicKey, syncState);
	}

	private sendSyncMessage(publicKey: string, doc: A.Doc<unknown>) {
		const syncState = this.getSyncState(publicKey);
		const [newSyncState, message] = A.generateSyncMessage(doc, syncState);
		this.setSyncState(publicKey, newSyncState);
		if (message) {
			void this.emit('message', {
				publicKey,
				message,
			});
		}
	}

	private processAllPendingSyncMessages() {
		for (const {publicKey, message} of this.pendingSyncMessages) {
			this.processSyncMessage(publicKey, message);
		}

		this.pendingSyncMessages = [];
	}

	private sync() {
		// TODO
	}
}
