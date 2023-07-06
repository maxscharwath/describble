import React from 'react';
import {shallow} from 'zustand/shallow';
import {clsx} from 'clsx';
import {TinyColor} from '@ctrl/tinycolor';
import {useWhiteboard} from '~core/hooks';
import {BorderStyle, FillStyle, Size} from '~core/layers/shared';
import {Sidebar} from '~components/ui/Sidebar';
import {match} from 'ts-pattern';
import {useTranslation} from 'react-i18next';

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

const getStrokeWidth = (size: Size) => match(size)
	.with(Size.Small, () => 5)
	.with(Size.Medium, () => 10)
	.with(Size.Large, () => 15)
	.exhaustive();

const getFill = (color: string, style: FillStyle) => match(style)
	.with(FillStyle.Filled, () => color)
	.with(FillStyle.Semi, () => new TinyColor(color).setAlpha(0.5).toString())
	.with(FillStyle.Empty, () => 'none')
	.otherwise(() => color);

export const StyleSidebar = () => {
	const {t} = useTranslation();
	const app = useWhiteboard();
	const style = app.useStore(state => state.appState.currentStyle, shallow);
	const strokeWidth = getStrokeWidth(style.size);
	const stroke = new TinyColor(style.color).darken(20).toString();
	const handleFillChange = React.useCallback((fillStyle: FillStyle) => {
		app.patchStyle({
			fillStyle,
		}, `set_style_fill_${fillStyle}`);
	}, [app]);
	const handleSizeChange = React.useCallback((size: Size) => {
		app.patchStyle({
			size,
		}, `set_style_size_${size}`);
	}, [app]);
	const handleBorderStyleChange = React.useCallback((borderStyle: BorderStyle) => {
		app.patchStyle({
			borderStyle,
		}, `set_style_border_${borderStyle}`);
	}, [app]);

	return (
		<Sidebar title={t('sidebar.style')}>
			<div className='grid grid-cols-2 items-center justify-items-center gap-2'>
				{/* Border Style */}
				<p className='justify-self-start truncate text-sm font-semibold dark:text-gray-200'>{t('style.border_style')}</p>
				<div className='grid grid-cols-3 justify-items-center gap-2'>
					{/* Solid */}
					<StyleButton
						fill='none'
						stroke={stroke}
						strokeWidth={strokeWidth}
						selected={style.borderStyle === BorderStyle.Solid}
						onClick={() => handleBorderStyleChange(BorderStyle.Solid)}
					/>
					{/* Dashed */}
					<StyleButton
						fill='none'
						stroke={stroke}
						strokeWidth={strokeWidth}
						strokeStyle={`${strokeWidth * 2}, ${strokeWidth * 2}`}
						selected={style.borderStyle === BorderStyle.Dashed}
						onClick={() => handleBorderStyleChange(BorderStyle.Dashed)}
					/>
					{/* Dotted */}
					<StyleButton
						fill='none'
						stroke={stroke}
						strokeWidth={strokeWidth * 1.1}
						strokeStyle={`1, ${strokeWidth * 2}`}
						selected={style.borderStyle === BorderStyle.Dotted}
						onClick={() => handleBorderStyleChange(BorderStyle.Dotted)}
					/>
				</div>

				{/* Size */}
				<p className='justify-self-start truncate text-sm font-semibold dark:text-gray-200'>{t('style.size')}</p>
				<div className='grid grid-cols-3 justify-items-center gap-2'>
					{/* Small */}
					<StyleButton
						fill='none'
						stroke={stroke}
						strokeWidth={getStrokeWidth(Size.Small)}
						selected={style.size === Size.Small}
						onClick={() => handleSizeChange(Size.Small)}
					/>
					{/* Medium */}
					<StyleButton
						fill='none'
						stroke={stroke}
						strokeWidth={getStrokeWidth(Size.Medium)}
						selected={style.size === Size.Medium}
						onClick={() => handleSizeChange(Size.Medium)}
					/>
					{/* Large */}
					<StyleButton
						fill='none'
						stroke={stroke}
						strokeWidth={getStrokeWidth(Size.Large)}
						selected={style.size === Size.Large}
						onClick={() => handleSizeChange(Size.Large)}
					/>
				</div>

				{/* Fill Style */}
				<p className='justify-self-start truncate text-sm font-semibold dark:text-gray-200'>{t('style.fill')}</p>
				<div className='grid grid-cols-3 justify-items-center gap-2'>
					{/* Empty */}
					<StyleButton
						fill={getFill(style.color, FillStyle.Empty)}
						stroke={stroke}
						strokeWidth={strokeWidth}
						selected={style.fillStyle === FillStyle.Empty}
						onClick={() => handleFillChange(FillStyle.Empty)}
					/>
					{/* Filled */}
					<StyleButton
						fill={getFill(style.color, FillStyle.Filled)}
						stroke={stroke}
						strokeWidth={strokeWidth}
						selected={style.fillStyle === FillStyle.Filled}
						onClick={() => handleFillChange(FillStyle.Filled)}
					/>
					{/* Semi-Transparent */}
					<StyleButton
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
