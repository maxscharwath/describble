import React from 'react';
import {create, type StateCreator, useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {persist} from 'zustand/middleware';
import {type LayerData, Layers} from './layers/Layer';

export type Camera = {
	x: number;
	y: number;
	scale: number;
};

type Tool = {
	selectedColor: string;
	currentTool: 'path' | 'rectangle' | 'circle' | 'image' | 'move' | 'select' | null;
};

type Canvas = {
	layers: LayerData[];
	history: LayerData[];
	camera: Camera;
	canvasRef: React.RefObject<SVGSVGElement>;
	addLayer: (layer: LayerData) => void;
};

const createToolSlice: StateCreator<Tool & Canvas, [], [], Tool> = () => ({
	selectedColor: '#000000',
	currentTool: 'path',
});

const createCanvasSlice: StateCreator<Canvas> = set => ({
	layers: [],
	history: [],
	camera: {x: 0, y: 0, scale: 1},
	canvasRef: React.createRef(),
	addLayer(layer: LayerData) {
		const parsedLayer = Layers.getFactory(layer.type)?.schema.safeParse(layer);
		if (!parsedLayer?.success) {
			console.error('Invalid layer', layer);
			return;
		}

		set(state => ({
			layers: [...state.layers, parsedLayer.data],
			history: [],
		}));
	},
});

export const whiteboardStore = create<Tool & Canvas>()((...a) => ({
	...createToolSlice(...a),
	...persist(
		createCanvasSlice, {
			name: 'whiteboard',
			partialize: ({layers, history, camera}) => ({layers, history, camera}),
		})(...a),
}));

export function useWhiteboardContext(): Tool & Canvas;
export function useWhiteboardContext<T>(selector: (state: Tool & Canvas) => T): T;
export function useWhiteboardContext<T>(selector?: (state: Tool & Canvas) => T): T {
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

	const setCamera = (camera: Camera) => {
		whiteboardStore.setState({
			camera: {
				x: Math.round(camera.x),
				y: Math.round(camera.y),
				scale: camera.scale,
			},
		});
	};

	return {
		camera,
		setCamera,
	};
};
