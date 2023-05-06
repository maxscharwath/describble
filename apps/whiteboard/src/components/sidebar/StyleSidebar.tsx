import React from 'react';
import {useWhiteboard} from '../../core/hooks/useWhiteboard';
import {shallow} from 'zustand/shallow';
import {clsx} from 'clsx';
import {TinyColor} from '@ctrl/tinycolor';
import {BorderStyle, FillStyle, Size} from '../../core/layers/shared';
import {Sidebar} from './Sidebar';

type StyleButtonProps = {
	selected: boolean;
	fill: string;
	stroke?: string;
	strokeWidth?: number;
	strokeStyle?: string;
};

export const StyleButton = ({
	fill,
	stroke,
	strokeWidth,
	strokeStyle,
	selected,
	...props
}: StyleButtonProps & React.ComponentProps<'button'>) => (
	<button
		type='button'
		className={clsx(
			'rounded-full transition-all',
			'hover:scale-110',
			'active:scale-90',
			selected && 'ring-2 ring-black/20 ring-offset-2',
		)}
		{...props}
	>
		<svg
			className='h-8 w-8'
			viewBox='0 0 100 100'
			fill={fill}
			stroke={stroke}
			strokeWidth={strokeWidth}
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeDasharray={strokeStyle}
		>
			<circle cx='50' cy='50' r='40' />
		</svg>
	</button>
);

const getStrokeWidth = (size: Size) => {
	switch (size) {
		case Size.Small:
			return 5;
		case Size.Medium:
			return 10;
		case Size.Large:
			return 15;
		default:
			return 5;
	}
};

const getFill = (color: string, style: FillStyle) => {
	switch (style) {
		case FillStyle.Filled:
			return color;
		case FillStyle.Semi:
			return new TinyColor(color).setAlpha(0.5).toString();
		case FillStyle.Empty:
			return 'none';
		default:
			return color;
	}
};

export const StyleSidebar = () => {
	const app = useWhiteboard();
	const style = app.useStore(state => state.appState.currentStyle, shallow);
	const strokeWidth = getStrokeWidth(style.size);
	const fill = getFill(style.color, style.fillStyle);
	const stroke = new TinyColor(style.color).darken(20).toString();
	const handleFillChange = React.useCallback((fillStyle: FillStyle) => {
		app.patchState({
			appState: {
				currentStyle: {
					fillStyle,
				},
			},
		}, 'change_fill_style');
	}, [app]);
	const handleSizeChange = React.useCallback((size: Size) => {
		app.patchState({
			appState: {
				currentStyle: {
					size,
				},
			},
		}, 'change_size');
	}, [app]);
	const handleBorderStyleChange = React.useCallback((borderStyle: BorderStyle) => {
		app.patchState({
			appState: {
				currentStyle: {
					borderStyle,
				},
			},
		}, 'change_border_style');
	}, [app]);

	return (
		<Sidebar title='Style'>
			<div className='grid justify-items-center gap-2'>
				<div className='grid grid-cols-3 justify-items-center gap-2'>
					<StyleButton // Stroke fill
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
						selected={style.borderStyle === BorderStyle.Solid}
						onClick={() => handleBorderStyleChange(BorderStyle.Solid)}
					/>
					<StyleButton // Stroke dash
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
						strokeStyle={`${strokeWidth * 2}, ${strokeWidth * 2}`}
						selected={style.borderStyle === BorderStyle.Dashed}
						onClick={() => handleBorderStyleChange(BorderStyle.Dashed)}
					/>
					<StyleButton // Stroke doted
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth * 1.1}
						strokeStyle={`1, ${strokeWidth * 2}`}
						selected={style.borderStyle === BorderStyle.Dotted}
						onClick={() => handleBorderStyleChange(BorderStyle.Dotted)}
					/>
				</div>
				<div className='grid grid-cols-3 justify-items-center gap-2'>
					<StyleButton // Size small
						fill={fill}
						stroke={stroke}
						strokeWidth={getStrokeWidth(Size.Small)}
						selected={style.size === Size.Small}
						onClick={() => handleSizeChange(Size.Small)}
					/>
					<StyleButton // Size medium
						fill={fill}
						stroke={stroke}
						strokeWidth={getStrokeWidth(Size.Medium)}
						selected={style.size === Size.Medium}
						onClick={() => handleSizeChange(Size.Medium)}
					/>
					<StyleButton // Size large
						fill={fill}
						stroke={stroke}
						strokeWidth={getStrokeWidth(Size.Large)}
						selected={style.size === Size.Large}
						onClick={() => handleSizeChange(Size.Large)}
					/>
				</div>
				<div className='grid grid-cols-3 justify-items-center gap-2'>
					<StyleButton // Fill empty
						fill={getFill(style.color, FillStyle.Empty)}
						stroke={stroke}
						strokeWidth={strokeWidth}
						selected={style.fillStyle === FillStyle.Empty}
						onClick={() => handleFillChange(FillStyle.Empty)}
					/>
					<StyleButton // Fill filled
						fill={getFill(style.color, FillStyle.Filled)}
						stroke={stroke}
						strokeWidth={strokeWidth}
						selected={style.fillStyle === FillStyle.Filled}
						onClick={() => handleFillChange(FillStyle.Filled)}
					/>
					<StyleButton // Fill semi
						fill={getFill(style.color, FillStyle.Semi)}
						stroke={stroke}
						strokeWidth={strokeWidth}
						selected={style.fillStyle === FillStyle.Semi}
						onClick={() => handleFillChange(FillStyle.Semi)}
					/>
				</div>
			</div>
		</Sidebar>
	);
};
