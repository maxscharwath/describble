import React, {memo} from 'react';
import {useWhiteboard} from '../core/hooks/useWhiteboard';
import {getLayerUtil, type Layer as TLayer} from '../core/layers';
import {shallow} from 'zustand/shallow';
import {layerSelector} from '../core/selectors';
import {useLayerEvents} from '../core/hooks/useLayerEvents';

export const Layer = React.memo(({layerId}: {layerId: string}) => {
	const app = useWhiteboard();
	const layer = app.useStore(layerSelector(layerId));
	if (!layer) {
		return null;
	}

	const asset = layer.assetId ? app.asset.getAsset(layer.assetId) : undefined;

	const {Component} = getLayerUtil(layer);
	const events = useLayerEvents(layerId);
	return (
		<g {...events}>
			<Component layer={layer as never} asset={asset}/>
		</g>
	);
});
Layer.displayName = 'Layer';

export const PreviewLayer = memo(({layer, ...props}: {layer: TLayer} & React.SVGProps<SVGSVGElement>) => {
	const {getBounds} = getLayerUtil(layer);
	const {x, y, width, height} = getBounds(layer as never);
	return (
		<svg {...props} viewBox={`${x} ${y} ${width} ${height}`}>
			<Layer layerId={layer.id}/>
		</svg>
	);
}, shallow);
PreviewLayer.displayName = 'PreviewLayer';
