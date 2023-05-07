import {type Point} from '~core/types';

export class Vector implements Point {
	public readonly x: number;
	public readonly y: number;
	constructor(point: Point) {
		this.x = point.x;
		this.y = point.y;
	}

	add(v: Point): Vector {
		return new Vector({x: this.x + v.x, y: this.y + v.y});
	}

	subtract(v: Point): Vector {
		return new Vector({x: this.x - v.x, y: this.y - v.y});
	}

	multiply(scalar: number): Vector {
		return new Vector({x: this.x * scalar, y: this.y * scalar});
	}

	divide(scalar: number): Vector {
		return new Vector({x: this.x / scalar, y: this.y / scalar});
	}

	length(): number {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}

	normalize(): Vector {
		const len = this.length();
		return new Vector({x: this.x / len, y: this.y / len});
	}

	dot(v: Point): number {
		return (this.x * v.x) + (this.y * v.y);
	}

	cross(v: Point): number {
		return (this.x * v.y) - (this.y * v.x);
	}

	angleBetween(v: Point): number {
		const dotProduct = this.dot(v);
		const lengthsProduct = this.length() * new Vector(v).length();
		return Math.acos(dotProduct / lengthsProduct);
	}

	rotate(angle: number): Vector {
		const cosAngle = Math.cos(angle);
		const sinAngle = Math.sin(angle);
		return new Vector({
			x: (this.x * cosAngle) - (this.y * sinAngle),
			y: (this.x * sinAngle) + (this.y * cosAngle),
		});
	}

	toPoint(): Point {
		return {x: this.x, y: this.y};
	}

	static fromPoints(p1: Point, p2: Point): Vector {
		return new Vector({x: p2.x - p1.x, y: p2.y - p1.y});
	}

	static zero(): Vector {
		return new Vector({x: 0, y: 0});
	}
}
