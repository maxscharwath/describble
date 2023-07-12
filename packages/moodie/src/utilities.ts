export const hashCode = (name: string): number => {
	let hash = 0;
	for (const character of name) {
		hash = ((hash << 5) - hash) + character.charCodeAt(0);
		hash &= hash; // Convert to 32bit integer
	}

	return Math.abs(hash);
};

export const getContrast = (hexcolor: string): string => {
	const hex = hexcolor.slice(1);
	const [r, g, b] = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
	const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

export class RNG {
	constructor(private _seed: number) {
		if (this._seed <= 0 || this._seed === Number.MAX_VALUE) {
			this._seed = 1;
		}
	}

	public nextDouble(): number {
		const hi = Math.floor(this._seed / RNG.q);
		const lo = this._seed % RNG.q;
		this._seed = (RNG.a * lo) - (RNG.r * hi);
		if (this._seed <= 0) {
			this._seed += RNG.m;
		}

		return (Number(this._seed)) / RNG.m;
	}

	public nextInt(min: number, max: number): number {
		const range = Math.round(max) - Math.round(min);
		return min + Math.round(range * this.nextDouble());
	}

	public nextNumber(min: number, max: number): number {
		const range = max - min;
		return min + (range * this.nextDouble());
	}

	public nextBoolean(): boolean {
		return this.nextDouble() >= 0.5;
	}

	public nextChoice<T>(array: T[]): T {
		if (array.length === 0) {
			return undefined as T;
		}

		const index = this.nextInt(0, array.length - 1);
		return array[index];
	}

	public nextUnit = (range: number, canBeNegative: boolean): number => this.nextNumber(canBeNegative ? -range : 0, range);

	private static readonly a = 16807;
	private static readonly m = 2147483647;
	private static readonly q = 127773;
	private static readonly r = 2836;
}
