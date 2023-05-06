import React, {memo} from 'react';
import clsx from 'clsx';
import style from './Selection.module.scss';
import {normalizeBounds} from '../../core/utils';
import {type Bounds} from '../../core/types';

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
export const Selection = memo(({bounds, radius = 10, padding = 0}: SelectionProps) => {
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
});

Selection.displayName = 'Selection';
