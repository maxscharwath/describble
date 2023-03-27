import React from 'react';

export type SelectionBox = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

function getRect({x1, y1, x2, y2}: SelectionBox) {
	return {
		x: Math.min(x1, x2),
		y: Math.min(y1, y2),
		width: Math.abs(x1 - x2),
		height: Math.abs(y1 - y2),
	};
}

export const Selection = ({box}: {box: SelectionBox}) => {
	const {x, y, width, height} = getRect(box);
	return <rect x={x} y={y} width={width} height={height} fill='rgba(0,0,255,0.1)' stroke='black' strokeWidth='1' strokeDasharray='5,5' />;
};
