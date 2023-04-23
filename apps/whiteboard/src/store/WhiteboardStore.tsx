import React from 'react';
import {create, useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {persist} from 'zustand/middleware';
import {type LayerData} from '../components/layers/Layer';

export type Camera = {
	x: number;
	y: number;
	scale: number;
};

type Whiteboard = {
	selectedColor: string;
	currentTool: 'path' | 'rectangle' | 'circle' | 'image' | 'move' | 'select' | null;
	selectedLayers: LayerData[];
	camera: Camera;
	setCamera: (camera: Camera) => void;
	canvasRef: React.RefObject<SVGSVGElement>;
};

export const whiteboardStore = create<Whiteboard>()(
	persist(
		(set, get) => ({
			selectedColor: '#000000',
			currentTool: 'path',
			selectedLayers: [],
			camera: {x: 0, y: 0, scale: 1},
			setCamera(camera) {
				set({
					camera: {
						x: Math.round(camera.x),
						y: Math.round(camera.y),
						scale: camera.scale,
					},
				});
			},
			canvasRef: React.createRef(),
		}), {
			name: 'whiteboard',
			partialize: ({camera}) => ({camera}),
		}),
);

export function useWhiteboardStore(): Whiteboard;
export function useWhiteboardStore<T>(selector: (state: Whiteboard) => T): T;
export function useWhiteboardStore<T>(selector?: (state: Whiteboard) => T): T {
	return useStore(whiteboardStore, selector!, shallow);
}
