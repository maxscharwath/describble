import {useGesture} from '@use-gesture/react';
import {useWhiteboard} from '~core/hooks';
import {useRef} from 'react';

export const useZoom = (canvasRef: React.RefObject<Element>) => {
	const app = useWhiteboard();
	const lastPosition = useRef<{x: number; y: number} | null>(null);
	const initialDistance = useRef(0);
	useGesture(
		{
			onWheel({event}) {
				event.preventDefault();

				const [dx, dy, z] = normalizeWheel(event);

				if ((event.altKey || event.ctrlKey || event.metaKey) && event.buttons === 0) {
					const zoom = Math.max(0.1, Math.min(10, app.camera.zoom + (z * app.camera.zoom)));
					const x = event.clientX - ((event.clientX - app.camera.x) * zoom / app.camera.zoom);
					const y = event.clientY - ((event.clientY - app.camera.y) * zoom / app.camera.zoom);
					app.setCamera({x, y, zoom});
					return;
				}

				const {x, y} = app.camera;
				const newX = x - dx;
				const newY = y - dy;
				app.setCamera({x: newX, y: newY, zoom: app.camera.zoom});
			},
			onTouchStart({event}) {
				if (event.touches.length === 2) {
					lastPosition.current = {
						x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
						y: (event.touches[0].clientY + event.touches[1].clientY) / 2,
					};

					const dx = event.touches[0].clientX - event.touches[1].clientX;
					const dy = event.touches[0].clientY - event.touches[1].clientY;
					initialDistance.current = Math.hypot(dx, dy);

					app.setTool(null);
				}
			},
			onTouchMove({event}) {
				if (event.touches.length === 2) {
					const currentX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
					const currentY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

					let {x, y} = app.camera;

					if (lastPosition.current) {
						x += currentX - lastPosition.current.x;
						y += currentY - lastPosition.current.y;
					}

					const dx = event.touches[0].clientX - event.touches[1].clientX;
					const dy = event.touches[0].clientY - event.touches[1].clientY;
					const distance = Math.hypot(dx, dy);

					const scaleFactor = distance / initialDistance.current;
					const newScale = Math.max(0.1, Math.min(10, app.camera.zoom * scaleFactor));

					x = currentX - ((currentX - x) * newScale / app.camera.zoom);
					y = currentY - ((currentY - y) * newScale / app.camera.zoom);

					app.setCamera({x, y, zoom: newScale});

					initialDistance.current = distance;
					lastPosition.current = {x: currentX, y: currentY};
				}
			},
			onTouchEnd() {
				lastPosition.current = null;
				initialDistance.current = 0;
			},
		},
		{target: canvasRef, eventOptions: {passive: false}},
	);
};

const MAX_ZOOM_STEP = -0.1;

// Adapted from https://stackoverflow.com/a/13650579
function normalizeWheel(event: WheelEvent) {
	const {deltaY, deltaX} = event;

	let deltaZ = 0;

	if (event.ctrlKey || event.metaKey) {
		const signY = Math.sign(event.deltaY);
		const absDeltaY = Math.abs(event.deltaY);

		let dy = deltaY;

		if (absDeltaY > MAX_ZOOM_STEP) {
			dy = MAX_ZOOM_STEP * signY;
		}

		deltaZ = dy;
	}

	return [deltaX, deltaY, deltaZ];
}
