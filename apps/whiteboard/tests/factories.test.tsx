import React from 'react';
import {render} from '@testing-library/react';
import {CircleFactory, type CircleSchema} from '../src/components/layers/factory/CircleFactory';
import {ImageFactory, type ImageSchema} from '../src/components/layers/factory/ImageFactory';
import {PathFactory, type PathSchema} from '../src/components/layers/factory/PathFactory';
import {RectangleFactory, type RectangleSchema} from '../src/components/layers/factory/RectangleFactory';
import {describe} from 'vitest';
import {type z} from 'zod';

describe('Factory components tests', () => {
	function testComponent<TProps extends Record<string, unknown>>(
		Component: React.FC<TProps>,
		props: TProps,
		query: string,
		testAttributes: Record<string, string>,
	) {
		const {container} = render(<svg>{<Component {...props}/>}</svg>);
		const element = container.querySelector(query);
		expect(element).toBeInTheDocument();

		for (const [attribute, value] of Object.entries(testAttributes)) {
			expect(element).toHaveAttribute(attribute, value);
		}
	}

	describe('Circle component', () => {
		const circleProps = {
			type: 'circle',
			uuid: 'test-uuid',
			visible: true,
			x: 30,
			y: 50,
			width: 100,
			height: 80,
			color: 'red',
		} satisfies z.infer<typeof CircleSchema>;

		test('should render Circle component', () => {
			const circleFactory = new CircleFactory();

			testComponent(circleFactory.component, circleProps, 'ellipse', {
				cx: '80',
				cy: '90',
				rx: '50',
				ry: '40',
				fill: 'red',
			});
		});

		test('should get bounds for Circle component', () => {
			const circleFactory = new CircleFactory();

			expect(circleFactory.getBounds(circleProps)).toEqual({
				x: 30,
				y: 50,
				width: 100,
				height: 80,
			});
		});
	});

	describe('Image component', () => {
		const imageProps = {
			type: 'image',
			uuid: 'test-uuid',
			visible: true,
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			src: 'https://example.com/image.png',
		} satisfies z.infer<typeof ImageSchema>;

		test('should render Image component', () => {
			const imageFactory = new ImageFactory();

			testComponent(imageFactory.component, imageProps, 'image', {
				x: '50',
				y: '50',
				width: '100',
				height: '100',
				href: 'https://example.com/image.png',
			});
		});

		test('should render Image component with negative dimensions', () => {
			const imageFactory = new ImageFactory();
			const imagePropsWithNegativeDimensions = {
				...imageProps,
				x: 50,
				y: 50,
				width: -100,
				height: -100,
			} satisfies z.infer<typeof ImageSchema>;

			testComponent(imageFactory.component, imagePropsWithNegativeDimensions, 'image', {
				x: '-50',
				y: '-50',
				width: '100',
				height: '100',
				href: 'https://example.com/image.png',
			});
		});

		test('should get bounds for Image component', () => {
			const imageFactory = new ImageFactory();

			expect(imageFactory.getBounds(imageProps)).toEqual({
				x: 50,
				y: 50,
				width: 100,
				height: 100,
			});
		});
	});

	describe('Path component', () => {
		const pathProps = {
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
		} satisfies z.infer<typeof PathSchema>;

		test('should render Path component', () => {
			const pathFactory = new PathFactory();
			const {container} = render(<svg>{<pathFactory.component {...pathProps}/>}</svg>);
			const path = container.querySelector('path');
			expect(path).toBeInTheDocument();
			expect(path).toHaveAttribute('d');
			expect(path).toHaveAttribute('fill', 'blue');
		});

		test('should render Path component with no points', () => {
			const pathFactory = new PathFactory();
			const pathPropsWithNoPoints = {
				...pathProps,
				points: [],
			} satisfies z.infer<typeof PathSchema>;

			const {container} = render(<svg>{<pathFactory.component {...pathPropsWithNoPoints}/>}</svg>);
			const path = container.querySelector('path');
			expect(path).toBeInTheDocument();
			expect(path).toHaveAttribute('d');
			expect(path).toHaveAttribute('fill', 'blue');
		});

		test('should get bounds for Path component', () => {
			const pathFactory = new PathFactory();

			expect(pathFactory.getBounds(pathProps)).toEqual({
				x: 50,
				y: 50,
				width: 50,
				height: 50,
			});
		});
	});

	describe('Rectangle component', () => {
		const rectangleProps = {
			type: 'rectangle',
			uuid: 'test-uuid',
			visible: true,
			x: 10,
			y: 50,
			width: 80,
			height: 100,
			color: 'red',
		} satisfies z.infer<typeof RectangleSchema>;

		test('should render Rectangle component', () => {
			const rectangleFactory = new RectangleFactory();

			testComponent(rectangleFactory.component, rectangleProps, 'rect', {
				x: '10',
				y: '50',
				width: '80',
				height: '100',
				fill: 'red',
			});
		});

		test('should render Rectangle component with negative dimensions', () => {
			const rectangleFactory = new RectangleFactory();
			const rectanglePropsWithNegativeDimensions = {
				...rectangleProps,
				x: 10,
				y: 50,
				width: -80,
				height: -100,
			} satisfies z.infer<typeof RectangleSchema>;

			testComponent(rectangleFactory.component, rectanglePropsWithNegativeDimensions, 'rect', {
				x: '-70',
				y: '-50',
				width: '80',
				height: '100',
				fill: 'red',
			});
		});
	});
});
