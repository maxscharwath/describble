import {type KeyManager} from './KeyManager';
import {getPublicKey} from '../crypto';
import Emittery from 'emittery';
import {base58} from 'base-x';
import {type Cache} from './Cache';

export type KeyPair = {
	readonly privateKey: Uint8Array;
	readonly publicKey: Uint8Array;
};

export type KeySession = Readonly<{
	privateKey: Uint8Array;
	publicKey: Uint8Array;
	base58PublicKey: string;
}>;

type SessionManagerEvents = {
	login: KeySession;
	logout: undefined;
};

export class SessionManager extends Emittery<SessionManagerEvents> {
	private session: KeySession | null = null;

	constructor(private readonly keyManager: KeyManager, private readonly cache?: Cache) {
		super();
		void this.cache?.get<KeySession>('session').then(session => {
			if (session) {
				this.session = session;
				void this.emit('login', session);
			}
		});
	}

	public async login(key: string, password: string): Promise<void> {
		const privateKey = await this.keyManager.getKey(key, password);
		if (!privateKey) {
			throw new Error('Login failed');
		}

		if (this.session) {
			this.logout();
		}

		this.session = this.createSession(privateKey);

		await this.cache?.set('session', this.session);

		void this.emit('login', this.session);
	}

	public async register(privateKey: Uint8Array, password: string): Promise<KeySession> {
		await this.keyManager.saveKey(privateKey, password);
		return this.createSession(privateKey);
	}

	public async listKeys(): Promise<string[]> {
		return this.keyManager.listKeys();
	}

	public logout(): void {
		this.session = null;
		void this.cache?.delete('session');
		void this.emit('logout');
	}

	get currentSession(): KeySession {
		if (!this.session) {
			throw new Error('No session');
		}

		return this.session;
	}

	get isLoggedIn(): boolean {
		return Boolean(this.session);
	}

	public onLogin(callback: (session: KeySession) => void) {
		if (this.isLoggedIn) {
			callback(this.currentSession);
		}

		return this.on('login', callback);
	}

	private createSession(privateKey: Uint8Array): KeySession {
		const publicKey = getPublicKey(privateKey);
		const base58PublicKey = base58.encode(publicKey);
		return {
			privateKey,
			publicKey,
			base58PublicKey,
		};
	}
}
