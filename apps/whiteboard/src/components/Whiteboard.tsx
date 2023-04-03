import React from 'react';
import {Toolbar} from './toolbar/Toolbar';
import {Cursor} from 'ui';
import {Canvas} from './Canvas';
import {useMouseState} from '../hooks/useMouse';
import {useRoom} from 'presence';
import {Sidebar} from './sidebar/Sidebar';

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

const Cursors = () => {
	const {x, y, clicked} = useMouseState();
	const {data, updateData, room} = useRoom<RoomState>('condensation-whiteboard', {
		mouses: {
		},
	});

	if (!room.current) {
		return null;
	}

	updateData({
		mouses: {
			[room.current?.id]: {x, y, clicked},
		},
	});

	return (
		<>
			{Object.entries(data.mouses)
				.map(([id, mouse]) => (
					<Cursor key={id} x={mouse.x} y={mouse.y} clicked={mouse.clicked} color={randomColor(id)} label={id} interpolate={id !== room.current?.id} />
				))}
		</>
	);
};

export default function Whiteboard() {
	return (
		<div className='cursor-none'>
			<Canvas />
			<div className='pointer-events-none absolute inset-x-0 top-0 flex justify-center'>
				<Toolbar />
			</div>
			<div className='pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center'>
				<Sidebar />
			</div>
			<Cursors />
		</div>
	);
}
