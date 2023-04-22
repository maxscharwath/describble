import React from 'react';
import clsx from 'clsx';
import {type Bounds} from '../../utils/types';
import style from '../Selection.module.scss';

const normalizeBounds = (
	{x, y, width, height}: Bounds,
	padding = 0,
): Bounds => ({
	x: (width < 0 ? x + width : x) - padding,
	y: (height < 0 ? y + height : y) - padding,
	width: Math.abs(width) + (padding * 2),
	height: Math.abs(height) + (padding * 2),
});

type SelectionProps = {
	bounds: Bounds;
	padding?: number;
	radius?: number;
};

/**
 * This component renders a selection rectangle.
 * @param bounds - The bounds of the selection.
 * @param padding - The padding around the selection.
 * @param radius - The radius of the corners.
 * @constructor
 */
export const Selection = ({bounds, padding = 0, radius = 10}: SelectionProps) => {
	const bound = normalizeBounds(bounds, padding);
	return (
		<rect
			{...bound}
			fill='rgba(128,128,128,0.3)'
			rx={radius}
			stroke='rgba(128,128,128,0.9)'
			strokeWidth={5}
			className={clsx(style.strokeAnimation, 'pointer-events-none')}
		/>
	);
};
