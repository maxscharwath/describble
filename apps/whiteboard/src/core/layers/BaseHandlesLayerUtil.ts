import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Handle} from '~core/types';

export interface BaseHandlesLayer extends BaseLayer {
	handles: Handle[];
}

export abstract class BaseHandlesLayerUtil<TLayer extends BaseHandlesLayer> extends BaseLayerUtil<TLayer> {
	public getBounds(layer: TLayer): Bounds {
		const [start, end] = layer.handles;

		return {
			x: Math.min(start.x, end.x) + layer.position.x,
			y: Math.min(start.y, end.y) + layer.position.y,
			width: Math.abs(end.x - start.x),
			height: Math.abs(end.y - start.y),
		};
	}

	public resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
		const oldBounds = this.getBounds(layer);

		const scaleX = bounds.width / (oldBounds.width || 1);
		const scaleY = bounds.height / (oldBounds.height || 1);

		return {
			handles: layer.handles.map(({x, y, ...rest}) => ({
				x: x * scaleX,
				y: y * scaleY,
				...rest,
			})),
			position: {
				x: ((layer.position.x - oldBounds.x) * scaleX) + bounds.x,
				y: ((layer.position.y - oldBounds.y) * scaleY) + bounds.y,
			},
		} satisfies Partial<BaseHandlesLayer> as Partial<TLayer>;
	}
}
