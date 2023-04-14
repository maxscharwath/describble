import Peer, {type DataConnection, type PeerErrorType} from 'peerjs';
import Emittery from 'emittery';
import React from 'react';
import {nanoid} from 'nanoid';
import merge from 'deepmerge';
import objectHash from 'object-hash';

type PeerError = Error & {type: PeerErrorType};
type Message<T> = {data: T; from: string};

export class Room<T> extends Emittery<{
	join: string;
	leave: string;
	data: Message<T>;
}> {
	public readonly id = nanoid();
	private isHost = false;
	private readonly peer: Promise<Peer>;
	private readonly connections = new Set<DataConnection>();

	constructor(roomId: string) {
		super();
		this.peer = this.createPeer(roomId);
	}

	public async send(data: T, from?: DataConnection) {
		const message = {data, from: from?.peer ?? (await this.peer).id} satisfies Message<T>;
		this.connections.forEach(conn => {
			conn.send(message);
		});
	}

	public async destroy() {
		console.log('destroy');
	}

	private async createPeer(roomId: string) {
		return new Promise<Peer>((resolve, reject) => {
			const peer = new Peer();
			peer.once('open', () => {
				const conn = peer.connect(roomId);
				conn.once('open', () => {
					this.isHost = false;
					this.addConnection(conn);
					console.log('Connected to host', conn.peer);
					resolve(peer);
				});
				peer.once('error', error => {
					peer.destroy();
					const newPeer = new Peer(roomId);
					newPeer.once('open', () => {
						this.isHost = true;
						newPeer.on('connection', conn => {
							this.addConnection(conn);
						});
						console.log('Created host', newPeer.id);
						resolve(newPeer);
					});
					newPeer.once('error', error => {
						reject(error);
					});
				});
			});
		});
	}

	private addConnection(conn: DataConnection) {
		console.log('addConnection', conn.peer);
		this.connections.add(conn);
		void this.emit('join', conn.peer);
		conn.on('data', data => {
			const message = data as Message<T>;
			void this.emit('data', message);
			if (this.isHost) {
				void this.send(message.data, conn);
			}
		});
		conn.once('close', () => {
			this.connections.delete(conn);
			void this.emit('leave', conn.peer);
		});
	}
}

export function useRoom<T extends Record<string, any>>(roomId: string, defaultData: T) {
	const room = React.useRef<Room<Partial<T>>>();
	const [data, setData] = React.useState<{value: T; hash: string}>({
		value: defaultData,
		hash: objectHash(defaultData),
	});
	const [peers, setPeers] = React.useState<string[]>([]);

	React.useEffect(() => {
		if (room.current) {
			return;
		}

		room.current = new Room<Partial<T>>(roomId);
		room.current.on('join', id => {
			setPeers(peers => [...peers, id]);
		});
		room.current.on('leave', id => {
			setPeers(peers => peers.filter(peer => peer !== id));
		});
		room.current.on('data', message => {
			updateData(message.data, false);
		});
	}, []);

	const updateData = (value: Partial<T>, shouldSend = true) => {
		const merged = merge(data.value, value);
		const hash = objectHash(merged);
		if (hash !== data.hash) {
			setData({value: merged, hash});
			if (shouldSend) {
				void room.current?.send(merged);
			}
		}
	};

	return {data: data.value, peers, updateData, room};
}
