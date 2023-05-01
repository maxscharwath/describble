import {
	createLayerUtils,
	type LayerUtilsKey,
	type LayerUtilsType,
	makeGetLayerUtil,
} from './BaseLayerUtil';
import {RectangleLayerUtil} from './Rectangle';
import {CircleLayerUtil} from './Circle';
import {PathLayerUtil} from './Path';

export const Circle = new CircleLayerUtil();
export const Rectangle = new RectangleLayerUtil();
export const Path = new PathLayerUtil();

export const layerUtils = createLayerUtils(
	Circle,
	Rectangle,
	Path,
);

export type LayerType = LayerUtilsKey<typeof layerUtils>;
export type Layer = LayerUtilsType<typeof layerUtils>;

export const getLayerUtil = makeGetLayerUtil(layerUtils);
