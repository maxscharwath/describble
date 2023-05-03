import React, {memo} from 'react';
import {useWhiteboard} from '../core/useWhiteboard';
import {getLayerUtil, type Layer as TLayer} from '../core/layers';
import {shallow} from 'zustand/shallow';

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

export const PreviewLayer = memo(({layer, ...props}: {layer: TLayer} & React.SVGProps<SVGSVGElement>) => {
	const {Component, getBounds} = getLayerUtil(layer);
	const {x, y, width, height} = getBounds(layer as never);
	return (
		<svg {...props} viewBox={`${x} ${y} ${width} ${height}`}>
			<Component layer={layer as never}/>
		</svg>
	);
}, shallow);
PreviewLayer.displayName = 'PreviewLayer';
