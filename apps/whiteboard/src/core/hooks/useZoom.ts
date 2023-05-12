import {useGesture} from '@use-gesture/react';
import {useWhiteboard} from '~core/hooks';

export const useZoom = (canvasRef: React.RefObject<Element>) => {
	const app = useWhiteboard();

	useGesture(
		{
			onPinch({first, origin: [currentX, currentY], delta, offset: [scale]}) {
				if (first) {
					app.setTool(null);
				}

				let {x, y} = app.camera;

				x += currentX - delta[0];
				y += currentY - delta[1];
				const zoom = Math.max(0.1, Math.min(10, app.camera.zoom * scale));
				x = currentX - ((currentX - x) * zoom / app.camera.zoom);
				x = currentY - ((currentY - y) * zoom / app.camera.zoom);

				// Update camera position and zoom level
				app.patchDocument({camera: {x, y, zoom}}, 'zoom');
			},
			onWheel({event, delta: [dx, dy], pinching}) {
				event.preventDefault();

				if (pinching) {
					// Zoom
					const zoom = Math.max(0.1, Math.min(10, app.camera.zoom - (dy * 0.01)));
					const x = event.clientX - ((event.clientX - app.camera.x) * zoom / app.camera.zoom);
					const y = event.clientY - ((event.clientY - app.camera.y) * zoom / app.camera.zoom);
					app.patchDocument({camera: {x, y, zoom}}, 'zoom');
				} else {
					// Pan
					const {x, y} = app.camera;
					const newX = x - dx;
					const newY = y - dy;
					app.patchDocument({camera: {x: newX, y: newY, zoom: app.camera.zoom}}, 'zoom');
				}
			},
		},
		{target: canvasRef, eventOptions: {passive: false}},
	);
};
