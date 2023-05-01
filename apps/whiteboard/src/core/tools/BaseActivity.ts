import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '../WhiteboardApp';

export abstract class BaseActivity {
	abstract readonly type: string;
	public constructor(protected app: WhiteboardApp) {}
	abstract start(): WhiteboardPatch | void;
	abstract complete(): WhiteboardPatch | WhiteboardCommand | void;
	abstract update(): WhiteboardPatch | void;
	abstract abort(): WhiteboardPatch | void;
}
