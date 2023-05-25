import {type Point} from '~core/types';

export const Vector = {
	add(...points: Point[]): Point {
		return points.reduce((acc, point) => ({x: acc.x + point.x, y: acc.y + point.y}), {x: 0, y: 0});
	},

	subtract(...points: Point[]): Point {
		return points.slice(1).reduce((acc, point) => ({x: acc.x - point.x, y: acc.y - point.y}), points[0]);
	},

	multiply(point: Point, scalar: number): Point {
		return {x: point.x * scalar, y: point.y * scalar};
	},

	divide(point: Point, scalar: number): Point {
		return {x: point.x / scalar, y: point.y / scalar};
	},

	length(point: Point): number {
		return Math.hypot(point.x, point.y);
	},

	normalize(point: Point): Point {
		const len = this.length(point);
		return this.divide(point, len);
	},

	dot(p1: Point, p2: Point): number {
		return (p1.x * p2.x) + (p1.y * p2.y);
	},

	cross(p1: Point, p2: Point): number {
		return (p1.x * p2.y) - (p1.y * p2.x);
	},

	angleBetween(p1: Point, p2: Point): number {
		const dotProduct = this.dot(p1, p2);
		const lengthsProduct = this.length(p1) * this.length(p2);
		return Math.acos(dotProduct / lengthsProduct);
	},

	rotate(point: Point, angle: number): Point {
		const cosAngle = Math.cos(angle);
		const sinAngle = Math.sin(angle);
		return {
			x: (point.x * cosAngle) - (point.y * sinAngle),
			y: (point.x * sinAngle) + (point.y * cosAngle),
		};
	},

	zero(): Point {
		return {x: 0, y: 0};
	},
};
