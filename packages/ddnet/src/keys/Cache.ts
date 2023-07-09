export interface Cache {
	get<T> (key: string): Promise<T | undefined>;

	set<T> (key: string, data: T): Promise<void>;

	delete (key: string): Promise<boolean>;

	unregister(): Promise<void>;
}
