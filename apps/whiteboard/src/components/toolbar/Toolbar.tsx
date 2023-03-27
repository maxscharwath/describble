import React from 'react';
import clsx from 'clsx';
import {ColorButton} from './ColorButton';
import {useHistory, useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import {greet} from 'hello-wasm';

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

const Button = ({
	active,
	disabled,
	...props
}: React.ComponentProps<'button'> & {active?: boolean; disabled?: boolean}) => (
	<button
		type='button'
		className={clsx(
			'rounded-full bg-gray-200 p-2 transition-all hover:scale-110 active:scale-90',
			active && 'bg-gray-900 text-white',
			disabled && 'cursor-not-allowed opacity-50',
		)}
		disabled={disabled}
		{...props}
	>
		{props.children}
	</button>
);

const Separator = () => <div className='mx-2 h-full w-px rounded-full bg-gray-200'/>;

export const Toolbar = () => {
	const context = useWhiteboardContext(state => ({
		selectedColor: state.selectedColor,
		currentTool: state.currentTool,
	}));

	const store = whiteboardStore;

	const history = useHistory();

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

			<Separator/>
			<div className='grid grid-cols-3 gap-2'>
				<Button
					active={context.currentTool === 'path'}
					onClick={() => {
						store.setState({currentTool: 'path'});
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
						<path fill='currentColor'
							d='m18.85 10.39l1.06-1.06c.78-.78.78-2.05 0-2.83L18.5 5.09c-.78-.78-2.05-.78-2.83 0l-1.06 1.06l4.24 4.24zm-5.66-2.83l-9.05 9.05a.5.5 0 0 0-.14.35v3.54c0 .28.22.5.5.5h3.54c.13 0 .26-.05.35-.15l9.05-9.05l-4.25-4.24zM19 17.5c0 2.19-2.54 3.5-5 3.5c-.55 0-1-.45-1-1s.45-1 1-1c1.54 0 3-.73 3-1.5c0-.47-.48-.87-1.23-1.2l1.48-1.48c1.07.63 1.75 1.47 1.75 2.68zM4.58 13.35C3.61 12.79 3 12.06 3 11c0-1.8 1.89-2.63 3.56-3.36C7.59 7.18 9 6.56 9 6c0-.41-.78-1-2-1c-1.26 0-1.8.61-1.83.64c-.35.41-.98.46-1.4.12a.992.992 0 0 1-.15-1.38C3.73 4.24 4.76 3 7 3s4 1.32 4 3c0 1.87-1.93 2.72-3.64 3.47C6.42 9.88 5 10.5 5 11c0 .31.43.6 1.07.86l-1.49 1.49z'/>
					</svg>
				</Button>

				<Button
					active={context.currentTool === 'rectangle'}
					onClick={() => {
						store.setState({currentTool: 'rectangle'});
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
						<path fill='currentColor' d='M4 6h16v12H4z' opacity='.3'/>
						<path fill='currentColor' d='M2 4v16h20V4H2zm18 14H4V6h16v12z'/>
					</svg>
				</Button>

				<Button
					active={context.currentTool === 'circle'}
					onClick={() => {
						store.setState({currentTool: 'circle'});
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 48 48'>
						<mask id='ipTRound0'>
							<circle cx='24' cy='24' r='20' fill='#555' stroke='#fff' strokeWidth='4'/>
						</mask>
						<path fill='currentColor' d='M0 0h48v48H0z' mask='url(#ipTRound0)'/>
					</svg>
				</Button>

				<Button
					active={context.currentTool === 'image'}
					onClick={() => {
						store.setState({currentTool: 'image'});
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='currentColor' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>
				</Button>

				<Button
					active={context.currentTool === 'move'}
					onClick={() => {
						store.setState({currentTool: 'move'});
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
						<path fill='currentColor'
							d='M13 6v5h5V7.75L22.25 12L18 16.25V13h-5v5h3.25L12 22.25L7.75 18H11v-5H6v3.25L1.75 12L6 7.75V11h5V6H7.75L12 1.75L16.25 6H13Z'/>
					</svg>
				</Button>

				<Button
					active={context.currentTool === 'select'}
					onClick={() => {
						store.setState({currentTool: 'select'});
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='currentColor' d='M15.15 21.375q-.575.275-1.15.063t-.85-.788l-3-6.45l-2.325 3.25q-.425.6-1.125.375t-.7-.95V4.05q0-.625.563-.9t1.062.125l10.1 7.95q.575.425.338 1.1T17.1 13h-4.2l2.975 6.375q.275.575.063 1.15t-.788.85Z'/></svg>
				</Button>
			</div>
			<Separator/>
			<div className='grid grid-cols-2 gap-2'>
				<Button
					disabled={!history.canRedo}
					onClick={history.redo}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
						<path fill='currentColor'
							d='M8 19q-.425 0-.713-.288Q7 18.425 7 18t.287-.712Q7.575 17 8 17h6.1q1.575 0 2.737-1Q18 15 18 13.5T16.837 11q-1.162-1-2.737-1H7.8l1.9 1.9q.275.275.275.7q0 .425-.275.7q-.275.275-.7.275q-.425 0-.7-.275L4.7 9.7q-.15-.15-.213-.325Q4.425 9.2 4.425 9t.062-.375Q4.55 8.45 4.7 8.3l3.6-3.6q.275-.275.7-.275q.425 0 .7.275q.275.275.275.7q0 .425-.275.7L7.8 8h6.3q2.425 0 4.163 1.575Q20 11.15 20 13.5q0 2.35-1.737 3.925Q16.525 19 14.1 19Z'/>
					</svg>
				</Button>
				<Button
					disabled={!history.canUndo}
					onClick={history.undo}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
						<path fill='currentColor'
							d='M9.9 19q-2.425 0-4.162-1.575Q4 15.85 4 13.5q0-2.35 1.738-3.925Q7.475 8 9.9 8h6.3l-1.9-1.9q-.275-.275-.275-.7q0-.425.275-.7q.275-.275.7-.275q.425 0 .7.275l3.6 3.6q.15.15.213.325q.062.175.062.375t-.062.375q-.063.175-.213.325l-3.6 3.6q-.275.275-.7.275q-.425 0-.7-.275q-.275-.275-.275-.7q0-.425.275-.7l1.9-1.9H9.9q-1.575 0-2.737 1Q6 12 6 13.5T7.163 16q1.162 1 2.737 1H16q.425 0 .712.288q.288.287.288.712t-.288.712Q16.425 19 16 19Z'/>
					</svg>
				</Button>
			</div>
			<Separator/>
			<div className='grid grid-cols-2 gap-2'>
				<button
					type='button'
					className='rounded-full bg-gray-200 p-2 text-red-900 transition-all hover:scale-110 active:scale-90'
					onClick={() => {
						store.setState({layers: []});
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
						<path fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
							d='M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6'></path>
					</svg>
				</button>
				<Button
					onClick={() => {
						greet('from the button');
					}}
				>
					<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 32 32'>
						<path fill='#654ff0' d='M19.153 2.35v.15a3.2 3.2 0 1 1-6.4 0v-.15H2v27.919h27.919V2.35Z'/>
						<path fill='#fff'
							d='M8.485 17.4h1.85l1.265 6.723h.023L13.14 17.4h1.731l1.371 6.81h.027l1.44-6.81h1.815l-2.358 9.885h-1.837l-1.36-6.728h-.036l-1.456 6.728h-1.87Zm13.124 0h2.917l2.9 9.885h-1.911l-.63-2.2h-3.323l-.486 2.2h-1.859Zm1.11 2.437l-.807 3.627h2.512l-.924-3.632Z'/>
					</svg>
				</Button>
			</div>
		</div>
	);
};
