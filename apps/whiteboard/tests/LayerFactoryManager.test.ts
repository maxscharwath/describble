import {Layers} from '../src/components/layers/Layer';
import {PathFactory} from '../src/components/layers/factory/PathFactory';
import {RectangleFactory} from '../src/components/layers/factory/RectangleFactory';
import {CircleFactory} from '../src/components/layers/factory/CircleFactory';
import {ImageFactory} from '../src/components/layers/factory/ImageFactory';

describe('LayerFactoryManager', () => {
	test('should register factories correctly', () => {
		const {records, array} = Layers;

		expect(Object.keys(records)).toEqual([
			'path',
			'rectangle',
			'circle',
			'image',
		]);

		expect(array.length).toBe(4);
	});

	test('should retrieve factory instances by type', () => {
		const pathFactory = Layers.getFactory('path');
		const rectangleFactory = Layers.getFactory('rectangle');
		const circleFactory = Layers.getFactory('circle');
		const imageFactory = Layers.getFactory('image');

		expect(pathFactory).toBeInstanceOf(PathFactory);
		expect(rectangleFactory).toBeInstanceOf(RectangleFactory);
		expect(circleFactory).toBeInstanceOf(CircleFactory);
		expect(imageFactory).toBeInstanceOf(ImageFactory);
	});

	test('should return undefined for unknown factory type', () => {
		const unknownFactory = Layers.getFactory('unknown');
		expect(unknownFactory).toBeUndefined();
	});
});
