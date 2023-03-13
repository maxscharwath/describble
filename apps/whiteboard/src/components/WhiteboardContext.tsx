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
	currentLayer: LayerData | null;
};

export const whiteboardStore = createStore<WhiteboardContext>()(persist((_set, _get) => ({
	selectedColor: '#000000',
	layers: [],
	currentLayer: null,
	currentTool: 'path',
}), {name: 'whiteboard'}));

export function useWhiteboardContext(): WhiteboardContext;
export function useWhiteboardContext<T>(selector: (state: WhiteboardContext) => T): T;
export function useWhiteboardContext<T>(selector?: (state: WhiteboardContext) => T): T {
	return useStore(whiteboardStore, selector!, shallow);
}
