import React from 'react';
import {Toolbar} from './toolbar/Toolbar';
import {Cursor} from 'ui';
import {Canvas} from './Canvas';
import {useMouseState} from '../hooks/useMouse';
import {WhiteboardProvider} from './WhiteboardContext';

const Cursors = () => {
	const {x, y, clicked} = useMouseState();
	return (
		<>
			<Cursor color='red' label='User 1' x={x} y={y} clicked={clicked}/>
			<Cursor color='blue' label='User 2' x={x + 100} y={y} clicked={clicked} interpolate/>
		</>
	);
};

export default function Whiteboard() {
	return (
		<WhiteboardProvider>
			<div className='relative cursor-none'>
				<Canvas/>
				<div className='pointer-events-none absolute inset-x-0 top-0 flex justify-center'>
					<Toolbar/>
				</div>
				<Cursors/>
			</div>
		</WhiteboardProvider>
	);
}
