import {useMouseState} from '../hooks/useMouse';
import {useRoom} from 'presence';
import React, {useEffect} from 'react';
import {Cursor} from 'ui';

type RoomState = {
	mouses: Record<string, {x: number; y: number; clicked: boolean}>;
};

const randomColor = (id: string) => {
	const hash = id.split('').reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);
	return `hsl(${hash % 360}, 100%, 50%)`;
};

export const Cursors = () => {
	const {x, y, clicked} = useMouseState();
	const {data, updateData, room} = useRoom<RoomState>('condensation-whiteboard', {
		mouses: {},
	});

	useEffect(() => {
		if (room.current) {
			updateData({
				mouses: {
					[room.current.id]: {x, y, clicked},
				},
			});
		}
	}, [x, y, clicked, room, updateData]);

	if (!room.current) {
		return null;
	}

	return (
		<>
			{Object.entries(data.mouses).map(([id, mouse]) => (
				<Cursor
					key={id}
					x={mouse.x}
					y={mouse.y}
					clicked={mouse.clicked}
					color={randomColor(id)}
					label={id}
					interpolate={id !== room.current?.id}
				/>
			))}
		</>
	);
};
