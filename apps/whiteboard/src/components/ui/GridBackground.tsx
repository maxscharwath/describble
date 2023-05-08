import React from 'react';
import {type Camera} from '~core/types';
import {nanoid} from 'nanoid';

export const GridBackground = React.memo(({camera}: {camera: Camera}) => {
	const patternId = React.useRef(nanoid());
	return (
		<>
			<defs>
				<pattern
					id={`${patternId.current}-smallGrid`}
					width={10 * camera.zoom}
					height={10 * camera.zoom}
					patternUnits='userSpaceOnUse'
				>
					<path
						d='M 10 0 L 0 0 0 10'
						fill='none'
						className='stroke-gray-400 dark:stroke-gray-600'
						strokeWidth={0.5}
						transform={`scale(${camera.zoom})`}
					/>
				</pattern>
				<pattern
					id={`${patternId.current}-grid`}
					width={100 * camera.zoom}
					height={100 * camera.zoom}
					patternUnits='userSpaceOnUse'
					patternTransform={`translate(${camera.x}, ${camera.y})`}
				>
					<rect
						width={100 * camera.zoom}
						height={100 * camera.zoom}
						fill={`url(#${patternId.current}-smallGrid)`}
					/>
					<path
						d='M 100 0 L 0 0 0 100'
						fill='none'
						className='stroke-gray-400 dark:stroke-gray-600'
						strokeWidth={1}
						transform={`scale(${camera.zoom})`}
					/>
				</pattern>
			</defs>

			<rect width='100%' height='100%' fill={`url(#${patternId.current}-grid)`}/>
		</>
	);
});
GridBackground.displayName = 'GridBackground';
