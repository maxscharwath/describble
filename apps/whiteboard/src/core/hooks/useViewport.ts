import {useWhiteboard} from '~core/hooks/useWhiteboard';
import React from 'react';

export const useViewport = (canvasRef: React.RefObject<Element>) => {
	const app = useWhiteboard();

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const updateViewport = () => {
			const {width, height, left, top} = canvas.getBoundingClientRect();
			app.viewport = {
				width,
				height,
				x: left,
				y: top,
			};
		};

		updateViewport();

		const resizeObserver = new ResizeObserver(updateViewport);

		resizeObserver.observe(canvas);

		return () => {
			resizeObserver.disconnect();
		};
	}, [app, canvasRef]);
};
