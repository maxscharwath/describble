export const hashCode = (name: string): number => {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		const character = name.charCodeAt(i);
		hash = ((hash << 5) - hash) + character;
		hash &= hash; // Convert to 32bit integer
	}

	return Math.abs(hash);
};

export const getDigit = (number: number, ntn: number): number => Math.floor((number / (10 ** ntn)) % 10);

export const getBoolean = (number: number, ntn: number): boolean => !((getDigit(number, ntn)) % 2);

export const getUnit = (number: number, range: number, index?: number): number => {
	const value = number % range;

	if (index && ((getDigit(number, index) % 2) === 0)) {
		return -value;
	}

	return value;
};

export const getRandomColor = (number: number, colors: string[], range: number): string => colors[number % range];

export const getContrast = (hexcolor: string): string => {
	if (hexcolor.startsWith('#')) {
		hexcolor = hexcolor.slice(1);
	}

	const r = parseInt(hexcolor.substring(0, 2), 16);
	const g = parseInt(hexcolor.substring(2, 4), 16);
	const b = parseInt(hexcolor.substring(4, 6), 16);

	const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

	return (yiq >= 128) ? '#000000' : '#FFFFFF';
};
