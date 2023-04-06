import {useCamera, useWhiteboardContext} from '../WhiteboardContext';
import {usePointerEvents} from '../../hooks/usePointerEvents';

export const MoveTool = () => {
	const {canvasRef} = useWhiteboardContext();
	const {camera, setCamera} = useCamera();
	usePointerEvents(canvasRef, {
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			setCamera({
				...camera,
				x: camera.x + event.movementX,
				y: camera.y + event.movementY,
			});
		},
	});

	return null;
};
