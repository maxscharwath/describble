// Adapted from https://github.com/mourner/simplify-js/blob/master/simplify.js

type Point = number[];

/**
 * Square distance between 2 points
 * @param p1 - Point 1
 * @param p2 - Point 2
 */
function getSqDist(p1: Point, p2: Point) {
	const dx = p1[0] - p2[0];
	const dy = p1[1] - p2[1];
	return (dx * dx) + (dy * dy);
}

/**
 * Square distance from a point to a segment
 * @param p - Point
 * @param p1 - Segment start
 * @param p2 - Segment end
 */
function getSqSegDist(p: Point, p1: Point, p2: Point) {
	let x = p1[0];
	let y = p1[1];
	let dx = p2[0] - x;
	let dy = p2[1] - y;

	if (dx !== 0 || dy !== 0) {
		const t = (((p[0] - x) * dx) + ((p[1] - y) * dy)) / ((dx * dx) + (dy * dy));

		if (t > 1) {
			x = p2[0];
			y = p2[1];
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p[0] - x;
	dy = p[1] - y;

	return (dx * dx) + (dy * dy);
}

/**
 * Basic distance-based simplification
 * @param points - Array of points
 * @param sqTolerance - Square tolerance
 */
function simplifyRadialDist(points: Point[], sqTolerance: number): Point[] {
	let prevPoint = points[0];
	const newPoints = [prevPoint];
	let point: Point | undefined;

	for (let i = 1, len = points.length; i < len; i++) {
		point = points[i];

		if (getSqDist(point, prevPoint) > sqTolerance) {
			newPoints.push(point);
			prevPoint = point;
		}
	}

	if (point && prevPoint !== point) {
		newPoints.push(point);
	}

	return newPoints;
}

/**
 * Simplification using optimized Douglas-Peucker algorithm with recursion elimination
 * @param options
 */
function simplifyDPStep(options: {points: Point[]; first: number; last: number; sqTolerance: number; simplified: Point[]}): void {
	let maxSqDist = options.sqTolerance;
	let index: number;

	for (let i = options.first + 1; i < options.last; i++) {
		const sqDist = getSqSegDist(options.points[i], options.points[options.first], options.points[options.last]);

		if (sqDist > maxSqDist) {
			index = i;
			maxSqDist = sqDist;
		}
	}

	if (maxSqDist > options.sqTolerance) {
		if (index! - options.first > 1) {
			simplifyDPStep({...options, last: index!});
		}

		options.simplified.push(options.points[index!]);
		if (options.last - index! > 1) {
			simplifyDPStep({...options, first: index!});
		}
	}
}

/**
 * Simplification using Ramer-Douglas-Peucker algorithm
 * @param points - Array of points
 * @param sqTolerance - Square tolerance
 */
function simplifyDouglasPeucker(points: Point[], sqTolerance: number): Point[] {
	const last = points.length - 1;

	const simplified = [points[0]];
	simplifyDPStep({points, first: 0, last, sqTolerance, simplified});
	simplified.push(points[last]);

	return simplified;
}

/**
 * Simplify path
 * @description Simplify path using Ramer-Douglas-Peucker algorithm and basic distance-based simplification
 * @param points - Array of points
 * @param tolerance - Tolerance
 * @param highestQuality - Highest quality
 */
export function simplify(points: Point[], tolerance?: number, highestQuality = false): Point[] {
	if (points.length <= 2) {
		return points;
	}

	const sqTolerance = tolerance === undefined ? 1 : tolerance * tolerance;

	points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
	points = simplifyDouglasPeucker(points, sqTolerance);

	return points;
}
