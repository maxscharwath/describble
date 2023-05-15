import React, {memo} from 'react';
import {shallow} from 'zustand/shallow';
import {useLayerEvents, useWhiteboard} from '~core/hooks';
import {getLayerUtil, type Layer as TLayer} from '~core/layers';
import {layerSelector} from '~core/selectors';

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
	const app = useWhiteboard();
	const asset = layer.assetId ? app.asset.getAsset(layer.assetId) : undefined;
	const {PreviewComponent, Component, getBounds} = getLayerUtil(layer);
	if (PreviewComponent) {
		return (
			<svg {...props}>
				<PreviewComponent layer={layer as never} asset={asset}/>
			</svg>
		);
	}

	const {x, y, width, height} = getBounds(layer as never);
	return (
		<svg {...props} viewBox={`${x} ${y} ${width} ${height}`}>
			<Component layer={layer as never} asset={asset}/>
		</svg>
	);
}, shallow);
PreviewLayer.displayName = 'PreviewLayer';
