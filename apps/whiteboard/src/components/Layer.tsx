import React from 'react';
import {useWhiteboard} from '../core/useWhiteboard';
import {getLayerUtil} from '../core/layers';

export const Layer = React.memo(({layerId}: {layerId: string}) => {
	const app = useWhiteboard();
	const layer = app.useStore(state => state.document.layers[layerId]);
	if (!layer) {
		return null;
	}

	const {Component} = getLayerUtil(layer);
	return <Component layer={layer as never}/>;
});

Layer.displayName = 'Layer';
