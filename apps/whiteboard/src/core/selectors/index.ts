import {type WhiteboardState} from '../WhiteboardApp';

export const documentSelector = (state: WhiteboardState) => state.documents[state.appState.currentDocumentId];

export const cameraSelector = (state: WhiteboardState) => documentSelector(state).camera;

export const layersSelector = (state: WhiteboardState) => documentSelector(state).layers;

export const layerSelector = (layerId: string) => (state: WhiteboardState) => layersSelector(state)[layerId];
