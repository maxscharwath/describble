import React from 'react';
import {cleanup, render} from '@testing-library/react';
import {CircleSchema} from '../src/components/layers/factory/CircleFactory';
import {Layer, PreviewLayer} from '../src/components/layers/Layer';
import {RectangleSchema} from '../src/components/layers/factory/RectangleFactory';
import {PathSchema} from '../src/components/layers/factory/PathFactory';
import {ImageSchema} from '../src/components/layers/factory/ImageFactory';

afterEach(cleanup);

describe('Layer', () => {
	test('should render Circle', () => {
		const circleProps = CircleSchema.parse({
			type: 'circle',
			uuid: 'test-uuid',
			visible: true,
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			color: 'red',
		});

		const {container} = render(<svg><Layer {...circleProps} /></svg>);
		const circle = container.querySelector('ellipse');
		expect(circle).toBeInTheDocument();
	});

	test('should render Rectangle', () => {
		const rectangleProps = RectangleSchema.parse({
			type: 'rectangle',
			uuid: 'test-uuid',
			visible: true,
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			color: 'red',
		});

		const {container} = render(<svg><Layer {...rectangleProps} /></svg>);
		const rectangle = container.querySelector('rect');
		expect(rectangle).toBeInTheDocument();
	});

	test('should render Path', () => {
		const pathProps = PathSchema.parse({
			type: 'path',
			uuid: 'test-uuid',
			visible: true,
			points: [
				[50, 50, 0.5],
				[100, 100, 0.5],
			],
			color: 'blue',
			strokeOptions: {
				size: 5,
				thinning: 0.5,
				smoothing: 0.5,
				roundness: 1,
			},
		});

		const {container} = render(<svg><Layer {...pathProps} /></svg>);
		const path = container.querySelector('path');
		expect(path).toBeInTheDocument();
	});

	test('should render Image', () => {
		const imageProps = ImageSchema.parse({
			type: 'image',
			uuid: 'test-uuid',
			visible: true,
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			src: 'https://example.com/image.png',
		});

		const {container} = render(<svg><Layer {...imageProps} /></svg>);
		const image = container.querySelector('image');
		expect(image).toBeInTheDocument();
	});

	test('should not render unknown type', () => {
		const unknownProps = {
			type: 'unknown',
			uuid: 'test-uuid',
			visible: true,
		};

		// @ts-expect-error - We're testing invalid data
		const {container} = render(<svg><Layer {...unknownProps} /></svg>);
		expect(container.querySelector('svg')?.children.length).toBe(0);
	});

	test('should not render invalid data', () => {
		const invalidCircleProps = {
			type: 'circle',
			uuid: 'test-uuid',
			visible: true,
			x: 50,
			y: 50,
			width: 'invalid', // Invalid width value
			height: 100,
			color: 'red',
		};
		// @ts-expect-error - We're testing invalid data
		const {container} = render(<svg><Layer {...invalidCircleProps} /></svg>);
		expect(container.querySelector('ellipse')).not.toBeInTheDocument();
	});

	test('should update element attributes', () => {
		const initialCircleProps = CircleSchema.parse({
			type: 'circle',
			uuid: 'test-uuid',
			visible: true,
			x: 100,
			y: 100,
			width: 100,
			height: 100,
			color: 'red',
		});

		const updatedCircleProps = CircleSchema.parse({
			...initialCircleProps,
			x: 125,
			y: -100,
			color: 'blue',
		});

		const {rerender, container} = render(<svg><Layer {...initialCircleProps} /></svg>);
		const circle = container.querySelector('ellipse');

		// Check initial attributes
		expect(circle).toHaveAttribute('cx', '150');
		expect(circle).toHaveAttribute('cy', '150');
		expect(circle).toHaveAttribute('fill', 'red');

		// Update the component
		rerender(<svg><Layer {...updatedCircleProps} /></svg>);

		// Check updated attributes
		expect(circle).toHaveAttribute('cx', '175');
		expect(circle).toHaveAttribute('cy', '-50');
		expect(circle).toHaveAttribute('fill', 'blue');
	});
});

describe('PreviewLayer', () => {
	it('should create an svg element', () => {
		const layer = CircleSchema.parse({
			type: 'circle',
			uuid: 'test-uuid',
			visible: true,
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			color: 'red',
		});

		const {container} = render(<PreviewLayer layer={layer}/>);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('should not create an svg element if layer is not valid', () => {
		const layer = {
			type: 'circle',
			uuid: 'test-uuid',
			visible: true,
			x: 50,
			y: 50,
			width: 'invalid', // Invalid width value
			height: 100,
			color: 'red',
		};

		// @ts-expect-error - We're testing invalid data
		const {container} = render(<PreviewLayer layer={layer}/>);
		const svg = container.querySelector('svg');
		expect(svg).not.toBeInTheDocument();
	});

	it('should not create an svg element if layer type is unknown', () => {
		const layer = {
			type: 'unknown',
			uuid: 'test-uuid',
			visible: true,
		};

		// @ts-expect-error - We're testing invalid data
		const {container} = render(<PreviewLayer layer={layer}/>);
		const svg = container.querySelector('svg');
		expect(svg).not.toBeInTheDocument();
	});
});
