import React, {memo} from 'react';
import {getScreenPoint, normalizeBounds} from '~core/utils';
import {type Bounds, BoundsHandle, type Camera} from '~core/types';
import {type BoundsEventHandlers, type HandleEventHandlers} from '~core/hooks';
import {type Layer} from '~core/layers';

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
	const enlargedSize = size + invisiblePadding;

	return (
		<g className='group'>
			<rect
				x={x - (size / 2)}
				y={y - (size / 2)}
				width={size}
				height={size}
				rx={5}
				className='fill-gray-500 stroke-gray-500/0 stroke-2 transition-colors duration-200 group-hover:stroke-gray-400'
			/>
			<ellipse
				{...props}
				cx={x}
				cy={y}
				rx={enlargedSize}
				className='fill-gray-500/0 transition-colors duration-200 group-hover:fill-gray-500/10'
				style={{cursor}}
			/>
		</g>
	);
});

Handle.displayName = 'Handle';

type HandledSelectionProps = SelectionProps & {events: BoundsEventHandlers};

export const HandledSelection = memo(({bounds, padding = 0, radius = 10, events}: HandledSelectionProps) => (
	<>
		<Selection bounds={bounds} padding={padding} radius={radius} {...events()}/>
		<Handle x={bounds.x - padding} y={bounds.y - padding} {...events(BoundsHandle.TOP + BoundsHandle.LEFT)} cursor='nwse-resize'/>
		<Handle x={bounds.x + bounds.width + padding} y={bounds.y - padding} {...events(BoundsHandle.TOP + BoundsHandle.RIGHT)} cursor='nesw-resize'/>
		<Handle x={bounds.x - padding} y={bounds.y + bounds.height + padding} {...events(BoundsHandle.BOTTOM + BoundsHandle.LEFT)} cursor='nesw-resize'/>
		<Handle x={bounds.x + bounds.width + padding} y={bounds.y + bounds.height + padding} {...events(BoundsHandle.BOTTOM + BoundsHandle.RIGHT)} cursor='nwse-resize'/>
		<Handle x={bounds.x + (bounds.width / 2)} y={bounds.y - padding} {...events(BoundsHandle.TOP)} cursor='ns-resize'/>
		<Handle x={bounds.x + (bounds.width / 2)} y={bounds.y + bounds.height + padding} {...events(BoundsHandle.BOTTOM)} cursor='ns-resize'/>
		<Handle x={bounds.x - padding} y={bounds.y + (bounds.height / 2)} {...events(BoundsHandle.LEFT)} cursor='ew-resize'/>
		<Handle x={bounds.x + bounds.width + padding} y={bounds.y + (bounds.height / 2)} {...events(BoundsHandle.RIGHT)} cursor='ew-resize'/>
	</>
));

HandledSelection.displayName = 'HandledSelection';

type HandlesProps = {
	layer: Layer;
	camera: Camera;
	events: HandleEventHandlers;
};

export const Handles = memo(({layer, camera, events}: HandlesProps) => {
	const {handles} = layer;
	if (!handles) {
		return null;
	}

	return (
		<>{handles.map((handle, index) =>
			<Handle
				key={index}
				{...getScreenPoint({
					x: handle.x + layer.position.x,
					y: handle.y + layer.position.y,
				}, camera)}
				{...events(index)}
				cursor='move'
			/>,
		)}
		</>
	);
});

Handles.displayName = 'Handles';
