export type Patch<T> = Partial<{[P in keyof T]: Patch<T[P]>}>;

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

export type Camera = {
	x: number;
	y: number;
	zoom: number;
};

export type OmitFirst<T extends any[]> = T extends [first: any, ...rest: infer R] ? R : never;

export type Class<T extends U, U extends abstract new (...args: any) => any> = new (...args: any[]) => InstanceType<T> & InstanceType<U>;

export enum BoundsHandle {
	TOP_LEFT = 'top-left',
	TOP_RIGHT = 'top-right',
	BOTTOM_LEFT = 'bottom-left',
	BOTTOM_RIGHT = 'bottom-right',
	NONE = 'none',
}

export type PointerEventHandler = (event: React.PointerEvent, target: string) => void;
export type KeyboardEventHandler = (event: KeyboardEvent) => void;
export type BoundsEventHandler = (event: React.PointerEvent, handle: BoundsHandle) => void;
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
}
