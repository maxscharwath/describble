import React from 'react';
import clsx from 'clsx';
import {ColorButton} from './ColorButton';
import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';

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

export const Toolbar = () => {
	const context = useWhiteboardContext(state => ({
		selectedColor: state.selectedColor,
		currentTool: state.currentTool,
	}));

	const store = whiteboardStore;

	return (
		<div
			className='pointer-events-auto m-2 flex items-center rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur'>
			<div className='grid grid-cols-6 gap-2'>
				{colors.map(color => (
					<ColorButton
						key={color}
						selected={color === context.selectedColor}
						color={color}
						onClick={() => {
							store.setState({selectedColor: color});
						}}
					/>
				))}
			</div>

			<div className='mx-2 h-full w-px rounded-full bg-gray-200' />

			<button
				type='button'
				className={clsx(
					'rounded-full bg-gray-200 p-2 transition-all hover:scale-110 active:scale-90',
					context.currentTool === 'path' && 'bg-gray-900 text-white',
				)}
				onClick={() => {
					store.setState({currentTool: 'path'});
				}}
			>
				<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='currentColor' d='m18.85 10.39l1.06-1.06c.78-.78.78-2.05 0-2.83L18.5 5.09c-.78-.78-2.05-.78-2.83 0l-1.06 1.06l4.24 4.24zm-5.66-2.83l-9.05 9.05a.5.5 0 0 0-.14.35v3.54c0 .28.22.5.5.5h3.54c.13 0 .26-.05.35-.15l9.05-9.05l-4.25-4.24zM19 17.5c0 2.19-2.54 3.5-5 3.5c-.55 0-1-.45-1-1s.45-1 1-1c1.54 0 3-.73 3-1.5c0-.47-.48-.87-1.23-1.2l1.48-1.48c1.07.63 1.75 1.47 1.75 2.68zM4.58 13.35C3.61 12.79 3 12.06 3 11c0-1.8 1.89-2.63 3.56-3.36C7.59 7.18 9 6.56 9 6c0-.41-.78-1-2-1c-1.26 0-1.8.61-1.83.64c-.35.41-.98.46-1.4.12a.992.992 0 0 1-.15-1.38C3.73 4.24 4.76 3 7 3s4 1.32 4 3c0 1.87-1.93 2.72-3.64 3.47C6.42 9.88 5 10.5 5 11c0 .31.43.6 1.07.86l-1.49 1.49z'/></svg>
			</button>

			<button
				type='button'
				className={clsx(
					'rounded-full bg-gray-200 p-2 transition-all hover:scale-110 active:scale-90',
					context.currentTool === 'rectangle' && 'bg-gray-900 text-white',
				)}
				onClick={() => {
					store.setState({currentTool: 'rectangle'});
				}}
			>
				<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='currentColor' d='M4 6h16v12H4z' opacity='.3'/><path fill='currentColor' d='M2 4v16h20V4H2zm18 14H4V6h16v12z'/></svg>
			</button>

			<button
				type='button'
				className={clsx(
					'rounded-full bg-gray-200 p-2 transition-all hover:scale-110 active:scale-90',
					context.currentTool === 'circle' && 'bg-gray-900 text-white',
				)}
				onClick={() => {
					store.setState({currentTool: 'circle'});
				}}
			>
				<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 48 48'><mask id='ipTRound0'><circle cx='24' cy='24' r='20' fill='#555' stroke='#fff' strokeWidth='4'/></mask><path fill='currentColor' d='M0 0h48v48H0z' mask='url(#ipTRound0)'/></svg>
			</button>

			<button
				type='button'
				className={clsx(
					'rounded-full bg-gray-200 p-2 transition-all hover:scale-110 active:scale-90',
					context.currentTool === 'move' && 'bg-gray-900 text-white',
				)}
				onClick={() => {
					store.setState({currentTool: 'move'});
				}}
			>
				<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='currentColor' d='M13 6v5h5V7.75L22.25 12L18 16.25V13h-5v5h3.25L12 22.25L7.75 18H11v-5H6v3.25L1.75 12L6 7.75V11h5V6H7.75L12 1.75L16.25 6H13Z'/></svg>
			</button>

			<div className='mx-2 h-full w-px rounded-full bg-gray-200' />

			<button
				type='button'
				className='rounded-full bg-gray-200 p-2 text-red-900 transition-all hover:scale-110 active:scale-90'
				onClick={() => {
					store.setState({layers: []});
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
};
