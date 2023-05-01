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

export type Camera = {
	x: number;
	y: number;
	zoom: number;
};
