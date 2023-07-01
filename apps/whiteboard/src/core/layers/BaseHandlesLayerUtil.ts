import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Handle} from '~core/types';

export interface BaseHandlesLayer extends BaseLayer {
	handles: Handle[];
}

export abstract class BaseHandlesLayerUtil<TLayer extends BaseHandlesLayer> extends BaseLayerUtil<TLayer> {
	public getBounds(layer: TLayer): Bounds {
		const start = layer.handles[0] ?? {x: 0, y: 0};
		const end = layer.handles[layer.handles.length - 1] ?? {x: 0, y: 0};

		return {
			x: Math.min(start.x, end.x) + layer.position.x,
			y: Math.min(start.y, end.y) + layer.position.y,
			width: Math.abs(end.x - start.x),
			height: Math.abs(end.y - start.y),
		};
	}

	public resize(current: TLayer, layer: TLayer, bounds: Bounds): TLayer {
		const oldBounds = this.getBounds(layer);

		const scaleX = bounds.width / (oldBounds.width || 1);
		const scaleY = bounds.height / (oldBounds.height || 1);

		layer.handles.forEach((handle, index) => {
			current.handles[index] = {
				x: handle.x * scaleX,
				y: handle.y * scaleY,
			};
		});

		current.position.x = ((layer.position.x - oldBounds.x) * scaleX) + bounds.x;
		current.position.y = ((layer.position.y - oldBounds.y) * scaleY) + bounds.y;

		return current;
	}
}
