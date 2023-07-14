export type Patch<T> = Partial<{[P in keyof T]: Patch<T[P]>}>;

export type PatchId<T extends {id: string}> = Patch<T> & {id: string};

export interface Command<T extends Record<string, any>> {
	id?: string;
	before: Patch<T>;
	after: Patch<T>;
}

export type Point = {
	x: number;
	y: number;
};

export type Dimension = {
	width: number;
	height: number;
};

export type Bounds = Point & Dimension;

export type Pointer = Point & {id: number; pressure: number};

export type Handle = Point & {parent?: string};

export type Camera = {
	x: number;
	y: number;
	zoom: number;
};

export type OmitFirst<T extends any[]> = T extends [first: any, ...rest: infer R] ? R : never;

export type Class<T extends U, U extends abstract new (...args: any) => any> = new (...args: any[]) => InstanceType<T> & InstanceType<U>;

export enum BoundsHandle {
	NONE = 0,
	TOP = 1,
	RIGHT = 2,
	BOTTOM = 4,
	LEFT = 8,
}

export type PointerEventHandler = (event: React.PointerEvent, target: string) => void;
export type KeyboardEventHandler = (event: KeyboardEvent) => void;
export type BoundsEventHandler = (event: React.PointerEvent, handle: BoundsHandle) => void;
export type HandleEventHandler = (event: React.PointerEvent, handleIndex: number) => void;
export class WhiteboardEvents {
	onPointerDown?: PointerEventHandler;
	onPointerMove?: PointerEventHandler;
	onPointerUp?: PointerEventHandler;

	onKeyDown?: KeyboardEventHandler;
	onKeyUp?: KeyboardEventHandler;

	onLayerDown?: PointerEventHandler;
	onLayerMove?: PointerEventHandler;
	onLayerUp?: PointerEventHandler;

	onCanvasDown?: PointerEventHandler;
	onCanvasMove?: PointerEventHandler;
	onCanvasUp?: PointerEventHandler;

	onBoundsDown?: BoundsEventHandler;
	onBoundsMove?: BoundsEventHandler;
	onBoundsUp?: BoundsEventHandler;

	onHandleDown?: HandleEventHandler;
	onHandleMove?: HandleEventHandler;
	onHandleUp?: HandleEventHandler;
}
