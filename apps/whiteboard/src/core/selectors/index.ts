import {type Document, type WhiteboardState} from '~core/WhiteboardApp';

export const cameraSelector = (state: Document) => state.camera;

export const layersSelector = (state: Document) => state.layers;

export const layerSelector = (layerId: string) => (state: Document) => layersSelector(state)[layerId];

export const selectionSelector = (state: WhiteboardState) => state.appState.selection;
