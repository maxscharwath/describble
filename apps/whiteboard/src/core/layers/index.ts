import {
	createLayerUtils,
	type LayerUtilsKey,
	type LayerUtilsType,
	makeGetLayerUtil,
} from './LayerUtil';
import {RectangleLayerUtil} from './Rectangle';
import {CircleLayerUtil} from './Circle';
import {PathLayerUtil} from './Path';

export const layerUtils = createLayerUtils(
	new RectangleLayerUtil(),
	new CircleLayerUtil(),
	new PathLayerUtil(),
);

export type LayerType = LayerUtilsKey<typeof layerUtils>;
export type Layer = LayerUtilsType<typeof layerUtils>;

export const getLayerUtil = makeGetLayerUtil(layerUtils);
