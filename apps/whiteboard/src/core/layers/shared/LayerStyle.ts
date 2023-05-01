type Color = `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})`;

export type LayerStyle = {
	color: Color;
};

export const defaultLayerStyle: LayerStyle = {
	color: '#000000',
};
