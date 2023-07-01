import {type DocumentData, type WhiteboardState} from '~core/WhiteboardApp';

export const cameraSelector = (state: DocumentData) => state.camera;

export const layersSelector = (state: DocumentData) => state.layers;

export const layerSelector = (layerId: string) => (state: DocumentData) => layersSelector(state)[layerId];

export const selectionSelector = (state: WhiteboardState) => state.appState.selection;
