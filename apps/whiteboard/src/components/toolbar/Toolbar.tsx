import React from 'react';
import {ColorButton} from './ColorButton';
import {useWhiteboardStore, whiteboardStore} from '../../store/WhiteboardStore';
import {greet} from 'hello-wasm';
import {
	CircleIcon,
	ImageIcon,
	MoveIcon,
	PathIcon,
	RectangleIcon,
	RedoIcon,
	SelectIcon,
	TrashIcon,
	UndoIcon,
	WASMIcon,
} from 'ui/components/Icons';
import {Button} from '../ui/Buttons';
import {useHistory, useLayersStore} from '../../store/CanvasStore';

const colors = {
	red: '#FF0000',
	orange: '#FFA500',
	yellow: '#FFFF00',
	green: '#008000',
	blue: '#0000FF',
	indigo: '#4B0082',
	violet: '#EE82EE',
	purple: '#800080',
	pink: '#FFC0CB',
	black: '#000000',
	gray: '#808080',
	white: '#FFFFFF',
} as const;

const Separator = () => <div className='m-2 h-px w-full rounded-full bg-gray-200 sm:h-full sm:w-px'/>;

export const Toolbar = () => {
	const context = useWhiteboardStore(state => ({
		selectedColor: state.selectedColor,
		currentTool: state.currentTool,
	}));

	const {clearLayers} = useLayersStore(({clearLayers}) => ({clearLayers}));

	const store = whiteboardStore;

	const history = useHistory();

	return (
		<div
			className='pointer-events-auto m-2 flex flex-col items-center rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur sm:flex-row'
		>
			<div className='grid grid-cols-6 gap-2'>
				{Object.entries(colors).map(([color, value]) => (
					<ColorButton
						key={color}
						selected={context.selectedColor === value || context.selectedColor === color}
						color={value}
						aria-label={color}
						onClick={() => {
							store.setState({selectedColor: value});
						}}
					/>
				))}
			</div>

			<Separator/>
			<div className='grid grid-cols-3 gap-2'>
				<Button
					aria-label='Path tool'
					active={context.currentTool === 'path'}
					onClick={() => {
						store.setState({currentTool: 'path'});
					}}
				>
					<PathIcon/>
				</Button>

				<Button
					aria-label='Rectangle tool'
					active={context.currentTool === 'rectangle'}
					onClick={() => {
						store.setState({currentTool: 'rectangle'});
					}}
				>
					<RectangleIcon/>
				</Button>

				<Button
					aria-label='Circle tool'
					active={context.currentTool === 'circle'}
					onClick={() => {
						store.setState({currentTool: 'circle'});
					}}
				>
					<CircleIcon/>
				</Button>

				<Button
					aria-label='Image tool'
					active={context.currentTool === 'image'}
					onClick={() => {
						store.setState({currentTool: 'image'});
					}}
				>
					<ImageIcon/>
				</Button>

				<Button
					aria-label='Move tool'
					active={context.currentTool === 'move'}
					onClick={() => {
						store.setState({currentTool: 'move'});
					}}
				>
					<MoveIcon/>
				</Button>

				<Button
					aria-label='Select tool'
					active={context.currentTool === 'select'}
					onClick={() => {
						store.setState({currentTool: 'select'});
					}}
				>
					<SelectIcon/>
				</Button>
			</div>
			<Separator/>
			<div className='grid grid-cols-2 gap-2'>
				<Button
					aria-label='Undo action'
					disabled={!history.pastStates.length}
					onClick={() => history.undo(1)}
				>
					<RedoIcon/>
				</Button>
				<Button
					aria-label='Redo action'
					disabled={!history.futureStates.length}
					onClick={() => history.redo(1)}
				>
					<UndoIcon/>
				</Button>
			</div>
			<Separator/>
			<div className='grid grid-cols-2 gap-2'>
				<Button
					aria-label='Clear canvas'
					className='text-red-900'
					onClick={() => {
						clearLayers();
					}}
				>
					<TrashIcon/>
				</Button>
				<Button
					aria-label='WASM test'
					onClick={() => {
						greet('from the button');
					}}
				>
					<WASMIcon/>
				</Button>
			</div>
		</div>
	);
};
