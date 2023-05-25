import React from 'react';
import {shallow} from 'zustand/shallow';
import {ColorButton} from '~components/ui/ColorButton';
import {
	ArrowIcon,
	CircleIcon,
	EmbedIcon,
	HandIcon,
	ImageIcon,
	LineIcon,
	PathIcon,
	RectangleIcon,
	RedoIcon,
	SelectIcon,
	TextIcon,
	TrashIcon,
	UndoIcon,
} from 'ui/components/Icons';
import {Button} from '~components/ui/Buttons';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {type Tools} from '~core/WhiteboardApp';

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

const Separator = () => <div className='m-2 h-px w-full rounded-full bg-gray-200 dark:bg-gray-700 sm:h-full sm:w-px'/>;

type ToolButtonProps = {tool: Tools; icon: React.ReactNode; onClick: (tool: Tools) => void; currentTool?: Tools};
const ToolButton = (props: ToolButtonProps) => {
	const {tool, icon, onClick, currentTool} = props;
	const handleButtonClick = React.useCallback(() => {
		onClick(tool);
	}, [props]);

	return (
		<Button
			aria-label={`${tool} tool`}
			active={currentTool === tool}
			onClick={handleButtonClick}
		>
			{icon}
		</Button>
	);
};

export const Toolbar = () => {
	const app = useWhiteboard();

	const handleUndo = React.useCallback(() => {
		app.undo();
	}, [app]);

	const handleRedo = React.useCallback(() => {
		app.redo();
	}, [app]);

	const handleSetTool = React.useCallback((tool: Tools) => {
		app.setTool(tool);
	}, [app]);

	const handleClear = React.useCallback(() => {
		app.clearLayers();
	}, [app]);

	const {selectedTool, selectedColor} = app.useStore(state => ({
		selectedTool: state.appState.currentTool,
		selectedColor: state.appState.currentStyle.color,
	}), shallow);
	return (
		<div
			className='pointer-events-auto m-2 flex h-full flex-col items-center rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200 sm:flex-row'
		>
			<div className='grid grid-cols-6 gap-2'>
				{Object.entries(colors).map(([color, value]) => (
					<ColorButton
						key={color}
						selected={selectedColor === value || selectedColor === color}
						color={value}
						aria-label={color}
						onClick={() => {
							app.patchStyle({
								color: value,
							}, `set_style_color_${color}`);
						}}
					/>
				))}
			</div>

			<Separator/>
			<div className='grid grid-cols-5 gap-2'>
				<ToolButton
					tool='select'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<SelectIcon/>}
				/>

				<ToolButton
					tool='move'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<HandIcon/>}
				/>

				<ToolButton
					tool='path'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<PathIcon/>}
				/>

				<ToolButton
					tool='rectangle'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<RectangleIcon/>}
				/>

				<ToolButton
					tool='circle'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<CircleIcon/>}
				/>

				<ToolButton
					tool='line'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<LineIcon/>}
				/>

				<ToolButton
					tool='arrow'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<ArrowIcon/>}
				/>

				<ToolButton
					tool='image'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<ImageIcon/>}
				/>

				<ToolButton
					tool='text'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<TextIcon/>}
				/>

				<ToolButton
					tool='embed'
					currentTool={selectedTool}
					onClick={handleSetTool}
					icon={<EmbedIcon/>}
				/>
			</div>
			<Separator/>
			<div className='grid grid-cols-2 gap-2'>
				<Button
					aria-label='Undo action'
					onClick={handleUndo}
				>
					<RedoIcon/>
				</Button>
				<Button
					aria-label='Redo action'
					onClick={handleRedo}
				>
					<UndoIcon/>
				</Button>
			</div>
			<Separator/>
			<div className='grid grid-cols-2 gap-2'>
				<Button
					aria-label='Clear canvas'
					className='text-red-900 dark:text-red-500'
					onClick={handleClear}
				>
					<TrashIcon/>
				</Button>
			</div>
		</div>
	);
};
