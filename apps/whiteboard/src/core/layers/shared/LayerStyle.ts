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

export function getTextStyle(style: LayerStyle): React.CSSProperties {
	const backgroundColor = match(style)
		.with({fillStyle: FillStyle.Filled}, () => new TinyColor(style.color).darken(10).toRgbString())
		.with({fillStyle: FillStyle.Semi}, () => new TinyColor(style.color).darken(10).setAlpha(0.5).toRgbString())
		.otherwise(() => 'transparent');

	const color = match(style)
		.with({fillStyle: FillStyle.Filled}, () => new TinyColor(style.color).isDark() ? '#ffffff' : '#000000')
		.with({fillStyle: FillStyle.Semi}, () => new TinyColor(style.color).isDark() ? '#ffffff' : '#000000')
		.otherwise(() => style.color);

	const fontWeight = match(style)
		.with({size: Size.Small}, () => 400)
		.with({size: Size.Medium}, () => 500)
		.with({size: Size.Large}, () => 600)
		.exhaustive();

	const fontSize = match(style)
		.with({size: Size.Small}, () => '3rem')
		.with({size: Size.Medium}, () => '6rem')
		.with({size: Size.Large}, () => '10rem')
		.exhaustive();

	return {
		color,
		backgroundColor,
		fontWeight,
		fontSize,
	};
}
