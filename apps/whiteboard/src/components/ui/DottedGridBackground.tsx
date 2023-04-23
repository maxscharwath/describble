import {type Camera} from '../../store/WhiteboardStore';
import React from 'react';

export const DottedGridBackground = ({camera}: {camera: Camera}) => (
	<>
		<defs>
			<pattern
				id='dottedGrid'
				width={40 * camera.scale}
				height={40 * camera.scale}
				patternUnits='userSpaceOnUse'
				patternTransform={`translate(${camera.x}, ${camera.y})`}
			>
				<circle
					cx={20 * camera.scale}
					cy={20 * camera.scale}
					r={1.5 * camera.scale}
					fill='silver'
				/>
			</pattern>
		</defs>

		<rect width='100%' height='100%' fill='url(#dottedGrid)'/>
	</>
);
