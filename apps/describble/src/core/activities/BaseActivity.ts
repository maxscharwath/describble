import {type WhiteboardApp} from '~core/WhiteboardApp';

export abstract class BaseActivity {
	abstract readonly type: string;

	public constructor(protected app: WhiteboardApp) {}

	abstract start(): void;

	abstract complete(): void;

	abstract update(): void;

	abstract abort(): void;
}
