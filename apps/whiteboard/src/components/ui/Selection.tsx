import React, {memo} from 'react';
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
			rx={radius}
			strokeWidth={5}
			className='stroke-dashed fill-gray-400/20 stroke-gray-400/90'
			vectorEffect='non-scaling-stroke'
		/>
	);
});

Selection.displayName = 'Selection';

const Handle = memo(({x, y, size = 15, cursor, ...props}: {x: number; y: number; size?: number; cursor: string}) => {
	const invisiblePadding = 15;
	const enlargedSize = size + (2 * invisiblePadding);

	return (
		<g className='group'>
			<rect
				x={x - (size / 2)}
				y={y - (size / 2)}
				width={size}
				height={size}
				rx={5}
				className='fill-gray-500 stroke-2 group-hover:stroke-gray-400'
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

export const HandledSelection = memo(({bounds, padding = 0, radius = 10, ...events}: HandledSelectionProps) => (
	<>
		<Selection bounds={bounds} padding={padding} radius={radius} {...useBoundsHandleEvents(events)}/>
		<Handle x={bounds.x - padding} y={bounds.y - padding} {...useBoundsHandleEvents(events, BoundsHandle.TOP + BoundsHandle.LEFT)} cursor='nwse-resize'/>
		<Handle x={bounds.x + bounds.width + padding} y={bounds.y - padding} {...useBoundsHandleEvents(events, BoundsHandle.TOP + BoundsHandle.RIGHT)} cursor='nesw-resize'/>
		<Handle x={bounds.x - padding} y={bounds.y + bounds.height + padding} {...useBoundsHandleEvents(events, BoundsHandle.BOTTOM + BoundsHandle.LEFT)} cursor='nesw-resize'/>
		<Handle x={bounds.x + bounds.width + padding} y={bounds.y + bounds.height + padding} {...useBoundsHandleEvents(events, BoundsHandle.BOTTOM + BoundsHandle.RIGHT)} cursor='nwse-resize'/>
		<Handle x={bounds.x + (bounds.width / 2)} y={bounds.y - padding} {...useBoundsHandleEvents(events, BoundsHandle.TOP)} cursor='ns-resize'/>
		<Handle x={bounds.x + (bounds.width / 2)} y={bounds.y + bounds.height + padding} {...useBoundsHandleEvents(events, BoundsHandle.BOTTOM)} cursor='ns-resize'/>
		<Handle x={bounds.x - padding} y={bounds.y + (bounds.height / 2)} {...useBoundsHandleEvents(events, BoundsHandle.LEFT)} cursor='ew-resize'/>
		<Handle x={bounds.x + bounds.width + padding} y={bounds.y + (bounds.height / 2)} {...useBoundsHandleEvents(events, BoundsHandle.RIGHT)} cursor='ew-resize'/>
	</>
));

HandledSelection.displayName = 'HandledSelection';
