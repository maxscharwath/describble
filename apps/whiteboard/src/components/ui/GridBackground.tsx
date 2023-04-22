import {type Camera} from '../WhiteboardContext';
import React from 'react';

export const GridBackground = ({camera}: {camera: Camera}) => (
	<>
		<defs>
			<pattern
				id='smallGrid'
				width={10 * camera.scale}
				height={10 * camera.scale}
				patternUnits='userSpaceOnUse'
			>
				<path
					d='M 10 0 L 0 0 0 10'
					fill='none'
					stroke='gray'
					strokeWidth={0.5}
					transform={`scale(${camera.scale})`}
				/>
			</pattern>
			<pattern
				id='grid'
				width={100 * camera.scale}
				height={100 * camera.scale}
				patternUnits='userSpaceOnUse'
				patternTransform={`translate(${camera.x}, ${camera.y})`}
			>
				<rect
					width={100 * camera.scale}
					height={100 * camera.scale}
					fill='url(#smallGrid)'
				/>
				<path
					d='M 100 0 L 0 0 0 100'
					fill='none'
					stroke='silver'
					strokeWidth={1}
					transform={`scale(${camera.scale})`}
				/>
			</pattern>
		</defs>

		<rect width='100%' height='100%' fill='url(#grid)'/>
	</>
);
