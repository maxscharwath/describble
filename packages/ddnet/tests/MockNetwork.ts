import {Connection} from '../src/network/Connection';
import {Network} from '../src/network/Network';
import {type NetworkAdapter} from '../src/network/NetworkAdapter';

export class MockConnection extends Connection {
	public relatedConnection?: MockConnection;

	public constructor(relatedConnection?: MockConnection) {
		super();
		this.relatedConnection = relatedConnection ?? new MockConnection(this);
	}

	public close(cause: string): void {
		void this.emit('close', new Error(cause));
		const tmp = this.relatedConnection;
		this.relatedConnection = undefined;
		tmp?.close(cause);
	}

	public isConnected(): boolean {
		return this.relatedConnection !== undefined;
	}

	public send(data: Uint8Array): void {
		void this.relatedConnection?.emit('data', data);
	}
}

export class MockNetwork extends Network {
	public async close(): Promise<void> {
		return Promise.resolve();
	}

	public async listen(): Promise<void> {
		return Promise.resolve();
	}

	public send(connection: Connection, data: Uint8Array): void {
		void (connection as MockConnection).relatedConnection?.emit('data', data);
	}
}

export class MockNetworkAdapter implements NetworkAdapter {
	public constructor(private readonly server: MockNetwork) {
	}

	public createConnection(publicKey: Uint8Array, clientId: Uint8Array): Connection {
		const connection = new MockConnection();
		if (connection.relatedConnection) {
			void this.server.emit('connection', {
				publicKey,
				clientId,
				connection: connection.relatedConnection,
			});
		}

		return connection;
	}
}
