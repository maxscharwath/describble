import React from 'react';
import {create, useStore} from 'zustand';
import {shallow} from 'zustand/shallow';
import {persist} from 'zustand/middleware';
import {type LayerData} from '../components/layers/Layer';

type Whiteboard = {
	selectedLayers: LayerData[];
	canvasRef: React.RefObject<SVGSVGElement>;
};

export const whiteboardStore = create<Whiteboard>()(
	persist(
		(set, get) => ({
			selectedLayers: [],
			canvasRef: React.createRef(),
		}), {
			name: 'whiteboard',
		}),
);

export function useWhiteboardStore(): Whiteboard;
export function useWhiteboardStore<T>(selector: (state: Whiteboard) => T): T;
export function useWhiteboardStore<T>(selector?: (state: Whiteboard) => T): T {
	return useStore(whiteboardStore, selector!, shallow);
}
