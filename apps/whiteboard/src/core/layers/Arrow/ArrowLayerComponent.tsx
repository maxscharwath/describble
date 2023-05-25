import React from 'react';
import {type Point} from '~core/types';
import {getArrowStyle, getBaseStyle, type LayerStyle, Size} from '~core/layers/shared';
import {match} from 'ts-pattern';

interface ArrowProps {
	start: Point;
	end: Point;
	rotation: number;
	style: LayerStyle;
}

interface ArrowBodyProps extends ArrowProps {
	lineLength: number;
}

interface ArrowSelectionOverlayProps extends ArrowBodyProps {
	selected: boolean;
	arrowSize: number;
}

const ArrowHead: React.FC<ArrowProps & {arrowSize: number}> = ({end, arrowSize, rotation, style}) => (
	<polygon
		transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
		points={`0,0 ${-arrowSize},${-arrowSize / 2} ${-arrowSize},${arrowSize / 2}`}
		{...getArrowStyle(style)}
	/>
);

export const ArrowBody: React.FC<ArrowBodyProps> = ({start, lineLength, rotation, style}) => {
	if (lineLength <= 0) {
		return null;
	}

	return (
		<path
			d={`M ${start.x} ${start.y} L ${start.x + (lineLength * Math.cos(rotation))} ${start.y + (lineLength * Math.sin(rotation))}`}
			{...getBaseStyle(style)}
		/>
	);
};

const ArrowSelectionOverlay: React.FC<ArrowSelectionOverlayProps> = ({start, end, lineLength, arrowSize, rotation, selected}) => {
	if (!selected) {
		return null;
	}

	return (
		<>
			{lineLength > 0 && (
				<path
					d={`M ${start.x} ${start.y} L ${start.x + (lineLength * Math.cos(rotation))} ${start.y + (lineLength * Math.sin(rotation))}`}
					strokeWidth={5}
					fill='none'
					className='stroke-dashed stroke-gray-400/90'
					vectorEffect='non-scaling-stroke'
				/>
			)}
			<polygon
				transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
				points={`0,0 ${-arrowSize},${-arrowSize / 2} ${-arrowSize},${arrowSize / 2}`}
				strokeWidth={5}
				fill='none'
				className='stroke-dashed stroke-gray-400/90'
				vectorEffect='non-scaling-stroke'
			/>
		</>
	);
};

export const ArrowLayerComponent: React.FC<ArrowProps & {selected: boolean}> = ({start, end, style, selected}) => {
	const arrowSize = calculateArrowSize(style.size);
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const rotation = Math.atan2(dy, dx);
	const lineLength = Math.hypot(dx, dy) - arrowSize;

	return (
		<>
			<ArrowBody {...{start, end, lineLength, rotation, style}} />
			<ArrowHead {...{start, end, rotation, arrowSize, style}} />
			<ArrowSelectionOverlay {...{start, end, lineLength, arrowSize, rotation, selected, style}} />
		</>
	);
};

function calculateArrowSize(size: Size): number {
	return match(size)
		.with(Size.Small, () => 20)
		.with(Size.Medium, () => 30)
		.with(Size.Large, () => 60)
		.exhaustive();
}
