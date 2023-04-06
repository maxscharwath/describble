import React from 'react';
import {useStore} from 'zustand';
import {createStore} from 'zustand/vanilla';
import {shallow} from 'zustand/shallow';
import {type LayerData} from './layers/Layer';
import {persist} from 'zustand/middleware';

export type Camera = {
	x: number;
	y: number;
	scale: number;
};

export type WhiteboardContext = {
	selectedColor: string;
	currentTool: 'path' | 'rectangle' | 'circle' | 'image' | 'move' | 'select';
	layers: LayerData[];
	history: LayerData[];
	currentLayer: LayerData | null;
	camera: Camera;
	canvasRef: React.RefObject<SVGSVGElement>;
};

export const whiteboardStore = createStore<WhiteboardContext>()(persist((_set, _get) => ({
	selectedColor: '#000000',
	layers: [],
	history: [],
	currentLayer: null,
	currentTool: 'path',
	camera: {x: 0, y: 0, scale: 1},
	canvasRef: React.createRef(),
}), {name: 'whiteboard', partialize: ({layers, history, camera}) => ({layers, history, camera})}));

export function useWhiteboardContext(): WhiteboardContext;
export function useWhiteboardContext<T>(selector: (state: WhiteboardContext) => T): T;
export function useWhiteboardContext<T>(selector?: (state: WhiteboardContext) => T): T {
	return useStore(whiteboardStore, selector!, shallow);
}

export const useHistory = () => {
	const {layers, history} = useWhiteboardContext(({layers, history}) => ({layers, history}));

	const undo = () => {
		whiteboardStore.setState(state => {
			const history = [...state.history];
			const layers = [...state.layers];

			const last = history.pop();
			if (last) {
				layers.push(last);
			}

			return {
				history,
				layers,
			};
		});
	};

	const redo = () => {
		whiteboardStore.setState(state => {
			const history = [...state.history];
			const layers = [...state.layers];

			const last = layers.pop();
			if (last) {
				history.push(last);
			}

			return {
				history,
				layers,
			};
		});
	};

	return {
		undo,
		redo,
		canUndo: history.length > 0,
		canRedo: layers.length > 0,
	};
};

export const useCamera = () => {
	const {camera} = useWhiteboardContext(({camera}) => ({camera}));

	const setCamera = (camera: WhiteboardContext['camera']) => {
		whiteboardStore.setState({camera});
	};

	return {
		camera,
		setCamera,
	};
};
