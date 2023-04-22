import {type Bounds} from './types';
import {normalizeBounds} from './coordinateUtils';

export interface QuadTreeItem<T> {
	bounds: Bounds;
	data: T;
}

type QuadTreeOptions = {
	bounds?: Bounds;
	capacity?: number;
};

/**
 * A quadtree implementation
 * @param options - options for the quadtree
 */
export class QuadTree<T> {
	private readonly items: Array<QuadTreeItem<T>>;
	private readonly capacity: number;
	private readonly bounds: Bounds;
	private divided: boolean;
	private northWest?: QuadTree<T>;
	private northEast?: QuadTree<T>;
	private southWest?: QuadTree<T>;
	private southEast?: QuadTree<T>;

	constructor(options: QuadTreeOptions = {}) {
		const {
			bounds = {x: 0, y: 0, width: 0, height: 0},
			capacity = 4,
		} = options;

		this.bounds = bounds;
		this.capacity = capacity;
		this.items = [];
		this.divided = false;
	}

	/**
   * Inserts an item into the quadtree
   * @param item - item to insert
   */
	public insert(item: QuadTreeItem<T>): boolean {
		if (!this.intersects(this.bounds, item.bounds)) {
			this.expand(item.bounds);
		}

		if (this.items.length < this.capacity) {
			this.items.push(item);
			return true;
		}

		if (!this.divided) {
			this.subdivide();
		}

		return (
			this.northWest!.insert(item)
      || this.northEast!.insert(item)
      || this.southWest!.insert(item)
      || this.southEast!.insert(item)
		);
	}

	/**
   * Queries the quadtree for items within a given range
   * @param range
   * @param found
   */
	public query(range: Bounds, found: T[] = []): T[] {
		range = normalizeBounds(range);
		if (!this.intersects(this.bounds, range)) {
			return found;
		}

		for (const item of this.items) {
			if (this.contains(range, item.bounds)) {
				found.push(item.data);
			}
		}

		if (this.divided) {
			this.northWest!.query(range, found);
			this.northEast!.query(range, found);
			this.southWest!.query(range, found);
			this.southEast!.query(range, found);
		}

		return found;
	}

	private expand(newBounds: Bounds): void {
		const left = Math.min(newBounds.x, this.bounds.x);
		const right = Math.max(newBounds.x + newBounds.width, this.bounds.x + this.bounds.width);
		const top = Math.min(newBounds.y, this.bounds.y);
		const bottom = Math.max(newBounds.y + newBounds.height, this.bounds.y + this.bounds.height);

		this.bounds.x = left;
		this.bounds.y = top;
		this.bounds.width = right - left;
		this.bounds.height = bottom - top;
	}

	private subdivide(): void {
		const {x, y, width, height} = this.bounds;
		const newWidth = width / 2;
		const newHeight = height / 2;

		this.northWest = new QuadTree<T>({bounds: {x, y, width: newWidth, height: newHeight}, capacity: this.capacity});
		this.northEast = new QuadTree<T>({
			bounds: {x: x + newWidth, y, width: newWidth, height: newHeight},
			capacity: this.capacity,
		});
		this.southWest = new QuadTree<T>({
			bounds: {x, y: y + newHeight, width: newWidth, height: newHeight},
			capacity: this.capacity,
		});
		this.southEast = new QuadTree<T>({
			bounds: {
				x: x + newWidth,
				y: y + newHeight,
				width: newWidth,
				height: newHeight,
			}, capacity: this.capacity,
		});

		this.divided = true;
	}

	private contains(boundsA: Bounds, boundsB: Bounds): boolean {
		return (
			boundsB.x >= boundsA.x
      && boundsB.x + boundsB.width <= boundsA.x + boundsA.width
      && boundsB.y >= boundsA.y
      && boundsB.y + boundsB.height <= boundsA.y + boundsA.height
		);
	}

	private intersects(a: Bounds, b: Bounds): boolean {
		return (
			a.x <= b.x + b.width
      && a.x + a.width >= b.x
      && a.y <= b.y + b.height
      && a.y + a.height >= b.y
		);
	}
}
