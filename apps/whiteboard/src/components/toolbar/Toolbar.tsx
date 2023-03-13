import React from 'react';
import {ColorButton} from './ColorButton';
import {useWhiteboard} from '../WhiteboardContext';

const colors = [
	'red',
	'orange',
	'yellow',
	'green',
	'blue',
	'indigo',
	'violet',
	'purple',
	'pink',
	'black',
	'gray',
	'white',
] as const;

export function Toolbar() {
	const {selectedColor, layers} = useWhiteboard();
	return (
		<div
			className='pointer-events-auto m-2 flex items-center rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur'>
			<div className='grid grid-cols-6 gap-2'>
				{colors.map(color => (
					<ColorButton
						key={color}
						selected={color === selectedColor.value}
						color={color}
						onClick={() => {
							selectedColor.value = color;
						}}
					/>
				))}
			</div>
			<div className='mx-2 h-full w-px rounded-full bg-gray-200'/>
			<button
				type='button'
				className='rounded-full bg-gray-200 p-2 text-red-900 transition-all hover:scale-110 active:scale-90'
				onClick={() => {
					layers.value = [];
				}}
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='1em'
					height='1em'
					viewBox='0 0 24 24'
				>
					<path
						fill='none'
						stroke='currentColor'
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6'
					></path>
				</svg>
			</button>
		</div>
	);
}
