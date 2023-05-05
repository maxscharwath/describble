export type Color = `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})`;

export enum BorderStyle {
	Solid = 'solid',
	Dashed = 'dashed',
	Dotted = 'dotted',
}

export enum Size {
	Small = 's',
	Medium = 'm',
	Large = 'l',
}

export enum FillStyle {
	Empty = 'empty',
	Filled = 'filled',
	Semi = 'semi',
}

export type LayerStyle = {
	color: Color;
	borderStyle: BorderStyle;
	fillStyle: FillStyle;
	size: Size;
};

export const defaultLayerStyle: LayerStyle = {
	color: '#000000',
	borderStyle: BorderStyle.Solid,
	fillStyle: FillStyle.Empty,
	size: Size.Medium,
};
