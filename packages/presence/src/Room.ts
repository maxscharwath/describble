import type Peer from 'peerjs';
import type {DataConnection} from 'peerjs';
import {deepmerge} from 'deepmerge-ts';
import {createPeer} from './createPeer';
import Emittery from 'emittery';
import {nanoid} from 'nanoid';
import objectHash from 'object-hash';

export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

interface DataProcessor<TData> {
	send(data: DeepPartial<TData>): void;
	getData(): TData | undefined;
	destroy(): void;
}

class HostDataProcessor<TData extends object> implements DataProcessor<TData> {
	private readonly connections = new Map<DataConnection, TData | undefined>();
	private hostData: TData;

	private data: {
		value: TData;
		hash: string;
	};

	constructor(private readonly peer: Peer, initialData: TData, private readonly onData?: (data: TData) => void) {
		this.hostData = initialData;
		peer.on('connection', conn => {
			this.addConnection(conn);
		});
		this.data = {
			value: initialData,
			hash: objectHash(initialData),
		};
	}

	public getData(): TData | undefined {
		return this.data.value;
	}

	public send(data: DeepPartial<TData>): void {
		this.hostData = deepmerge(this.hostData, data) as TData;
		this.computeAndEmitData();
	}

	public destroy(): void {
		this.peer.destroy();
	}

	private addConnection(conn: DataConnection) {
		this.connections.set(conn, undefined);
		conn.on('data', data => {
			this.connections.set(conn, data as TData);
			this.computeAndEmitData();
		});
		conn.once('close', () => {
			this.connections.delete(conn);
			this.computeAndEmitData();
		});
	}

	private computeAndEmitData(): void {
		const dataArray = [this.hostData];
		for (const [, conn] of this.connections) {
			if (conn) {
				dataArray.push(conn);
			}
		}

		const merged = deepmerge(...dataArray) as TData;
		const hash = objectHash(merged);
		if (hash !== this.data.hash) {
			this.data = {value: merged, hash};
			this.onData?.(this.data.value);
			this.broadcastData();
		}
	}

	private broadcastData(): void {
		for (const [conn] of this.connections) {
			conn.send(this.data.value);
		}
	}
}

class ClientDataProcessor<TData extends object> implements DataProcessor<TData> {
	private data: {
		value: TData;
		hash: string;
	};

	private clientData: TData;
	constructor(private readonly peer: Peer, private readonly conn: DataConnection, private readonly initialData: TData, private readonly onData?: (data: TData) => void) {
		this.data = {
			value: initialData,
			hash: objectHash(initialData),
		};
		this.clientData = initialData;
		conn.on('data', data => {
			const newData = {
				value: data as TData,
				hash: objectHash(data as TData),
			};
			if (newData.hash !== this.data.hash) {
				this.data = newData;
				this.onData?.(this.data.value);
			}
		});
		conn.once('close', () => {
			const data = deepmerge(this.initialData, this.clientData) as TData;
			this.data = {
				value: data,
				hash: objectHash(data),
			};
			this.onData?.(this.data.value);
		});
		this.send(initialData);
	}

	public getData(): TData | undefined {
		return this.data.value;
	}

	public send(data: TData): void {
		this.clientData = data;
		const newData = deepmerge(this.data.value, this.clientData) as TData;
		const newHash = objectHash(newData);

		if (newHash !== this.data.hash) {
			this.data = {value: newData, hash: newHash};
			this.onData?.(this.data.value);

			this.conn.send(this.clientData);
		}
	}

	public destroy(): void {
		this.peer.destroy();
	}
}

export class Room<TData extends object> extends Emittery<{
	data: TData;
}> {
	public id = nanoid();

	private processor?: DataProcessor<TData>;

	public constructor(private readonly initialData: TData) {
		super();
	}

	public async join(roomId: string) {
		const {peer, conn} = await createPeer(roomId);
		this.processor?.destroy();
		this.processor = conn
			? new ClientDataProcessor<TData>(peer, conn, this.initialData, async data => this.emit('data', data))
			: new HostDataProcessor<TData>(peer, this.initialData, async data => this.emit('data', data));
	}

	public async send(data: DeepPartial<TData>) {
		this.processor?.send(data);
	}

	public leave() {
		this.processor?.destroy();
		this.processor = undefined;
	}

	public getData(): TData | undefined {
		return this.processor?.getData();
	}
}
