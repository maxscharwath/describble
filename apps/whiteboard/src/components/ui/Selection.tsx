import React, {memo} from 'react';
import clsx from 'clsx';
import style from './Selection.module.scss';
import {normalizeBounds} from '~core/utils';
import {type Bounds, BoundsHandle} from '~core/types';
import {type BoundsEventHandlers, useBoundsHandleEvents} from '~core/hooks';

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
export const Selection = memo(({bounds, radius = 10, padding = 0, ...props}: SelectionProps) => {
	const bound = normalizeBounds(bounds, padding);
	return (
		<rect
			{...props}
			{...bound}
			fill='rgba(128,128,128,0.3)'
			rx={radius}
			stroke='rgba(128,128,128,0.9)'
			strokeWidth={5}
			className={clsx(style.strokeAnimation)}
		/>
	);
});

Selection.displayName = 'Selection';

const Handle = memo(({x, y, size = 20, cursor, ...props}: {x: number; y: number; size?: number; cursor: string}) => {
	const invisiblePadding = 10;
	const enlargedSize = size + (2 * invisiblePadding);

	return (
		<g>
			<rect
				x={x - (size / 2)}
				y={y - (size / 2)}
				width={size}
				height={size}
				fill='rgba(128,128,128,0.9)'
				rx={5}
			/>
			<rect
				{...props}
				x={x - (size / 2) - invisiblePadding}
				y={y - (size / 2) - invisiblePadding}
				width={enlargedSize}
				height={enlargedSize}
				fill='transparent'
				style={{cursor}}
			/>
		</g>
	);
});

Handle.displayName = 'Handle';

type HandledSelectionProps = SelectionProps & BoundsEventHandlers;

export const HandledSelection = memo(({bounds, padding = 0, radius = 10, ...events}: HandledSelectionProps) => (<>
	<Selection bounds={bounds} padding={padding} radius={radius} {...useBoundsHandleEvents(events)}/>
	<Handle x={bounds.x - padding} y={bounds.y - padding} size={20} {...useBoundsHandleEvents(events, BoundsHandle.TOP_LEFT)} cursor='nwse-resize'/>
	<Handle x={bounds.x + bounds.width + padding} y={bounds.y - padding} size={20} {...useBoundsHandleEvents(events, BoundsHandle.TOP_RIGHT)} cursor='nesw-resize'/>
	<Handle x={bounds.x - padding} y={bounds.y + bounds.height + padding} size={20} {...useBoundsHandleEvents(events, BoundsHandle.BOTTOM_LEFT)} cursor='nesw-resize'/>
	<Handle x={bounds.x + bounds.width + padding} y={bounds.y + bounds.height + padding} size={20} {...useBoundsHandleEvents(events, BoundsHandle.BOTTOM_RIGHT)} cursor='nwse-resize'/>
</>));

HandledSelection.displayName = 'HandledSelection';
