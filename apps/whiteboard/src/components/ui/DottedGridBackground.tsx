import React from 'react';
import {type Camera} from '~core/types';

export const DottedGridBackground = ({camera}: {camera: Camera}) => (
	<>
		<defs>
			<pattern
				id='dottedGrid'
				width={40 * camera.zoom}
				height={40 * camera.zoom}
				patternUnits='userSpaceOnUse'
				patternTransform={`translate(${camera.x}, ${camera.y})`}
			>
				<circle
					cx={20 * camera.zoom}
					cy={20 * camera.zoom}
					r={1.5 * camera.zoom}
					className='fill-gray-400 dark:fill-gray-600'
				/>
			</pattern>
		</defs>

		<rect width='100%' height='100%' fill='url(#dottedGrid)'/>
	</>
);
