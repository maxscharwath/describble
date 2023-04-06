import React from 'react';
import {type Point} from '../utils/types';

export type SelectionBox = {
	p1: Point;
	p2: Point;
};

function getRect({p1, p2}: SelectionBox) {
	return {
		x: Math.min(p1.x, p2.x),
		y: Math.min(p1.y, p2.y),
		width: Math.abs(p1.x - p2.x),
		height: Math.abs(p1.y - p2.y),
	};
}

export const Selection = ({box}: {box: SelectionBox}) => {
	const {x, y, width, height} = getRect(box);
	return <rect x={x} y={y} width={width} height={height} fill='rgba(0,0,255,0.1)' stroke='black' strokeWidth='1' strokeDasharray='5,5' />;
};
