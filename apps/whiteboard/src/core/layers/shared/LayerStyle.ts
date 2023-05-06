import type React from 'react';
import {match} from 'ts-pattern';
import {TinyColor} from '@ctrl/tinycolor';

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

export function getBaseStyle(style: LayerStyle): React.SVGAttributes<any> {
	const fill = match(style)
		.with({fillStyle: FillStyle.Filled}, () => new TinyColor(style.color).darken(10).toRgbString())
		.with({fillStyle: FillStyle.Semi}, () => new TinyColor(style.color).darken(10).setAlpha(0.5).toRgbString())
		.otherwise(() => 'none');

	const strokeWidth = match(style)
		.with({size: Size.Small}, () => 5)
		.with({size: Size.Medium}, () => 10)
		.with({size: Size.Large}, () => 20)
		.exhaustive();

	const strokeDasharray = match(style)
		.with({borderStyle: BorderStyle.Dashed}, () => `${strokeWidth * 2} ${strokeWidth * 2}`)
		.with({borderStyle: BorderStyle.Dotted}, () => `1 ${strokeWidth * 2}`)
		.otherwise(() => 'none');

	return {
		fill,
		strokeWidth,
		strokeDasharray,
		strokeLinejoin: 'round',
		strokeLinecap: 'round',
		stroke: style.color,
	};
}
