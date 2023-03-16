import React from 'react';
import {useStore} from 'zustand';
import {createStore} from 'zustand/vanilla';
import {shallow} from 'zustand/shallow';
import {type LayerData} from './layers/Layer';
import {persist} from 'zustand/middleware';

export type WhiteboardContext = {
	selectedColor: string;
	currentTool: 'path' | 'rectangle' | 'circle' | 'move';
	layers: LayerData[];
	history: LayerData[];
	currentLayer: LayerData | null;
};

export const whiteboardStore = createStore<WhiteboardContext>()(persist((_set, _get) => ({
	selectedColor: '#000000',
	layers: [],
	history: [],
	currentLayer: null,
	currentTool: 'path',
}), {name: 'whiteboard'}));

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
