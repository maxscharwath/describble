import {useMouseState} from '../hooks/useMouse';
import {useRoom} from 'presence';
import React from 'react';
import {Cursor, type CursorRef} from 'ui';

type RoomState = {
	mouses: Record<string, {x: number; y: number; clicked: boolean}>;
};

type MouseState = {
	x: number;
	y: number;
	clicked: boolean;
	ref: React.RefObject<CursorRef>;
};

const randomColor = (id: string) => {
	const hash = id.split('').reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);
	return `hsl(${hash % 360}, 100%, 50%)`;
};

export const Cursors = () => {
	const [mousesState, setMousesState] = React.useState<Map<string, MouseState>>(new Map());
	const {room, updateData} = useRoom<RoomState>('condensation-whiteboard', {
		defaultData: {mouses: {}},
		onData(data) {
			let changed = false;

			for (const [id, mouse] of Object.entries(data.mouses)) {
				const mouseState = mousesState.get(id);
				const typedMouse = mouse as {x: number; y: number; clicked: boolean};
				if (mouseState) {
					mouseState.ref.current?.update(typedMouse);
				} else {
					mousesState.set(id, {
						x: typedMouse.x,
						y: typedMouse.y,
						clicked: typedMouse.clicked,
						ref: React.createRef(),
					});
					changed = true;
				}
			}

			for (const id of mousesState.keys()) {
				if (!data.mouses[id]) {
					mousesState.delete(id);
					changed = true;
				}
			}

			if (changed) {
				setMousesState(new Map(mousesState));
			}
		},
	});

	useMouseState(state => {
		if (room.current) {
			updateData({
				mouses: {
					[room.current.id]: {
						x: state.x,
						y: state.y,
						clicked: state.clicked,
					},
				},
			});
		}
	});

	return (
		<>
			{Array.from(mousesState.entries()).map(([id, mouse]) => (
				<Cursor
					key={id}
					x={mouse.x}
					y={mouse.y}
					clicked={mouse.clicked}
					color={randomColor(id)}
					ref={mouse.ref}
					label={id}
					interpolate={id !== room.current?.id}
				/>
			))}
		</>
	);
};
