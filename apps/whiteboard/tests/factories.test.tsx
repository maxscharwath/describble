import React from 'react';
import {render} from '@testing-library/react';
import {CircleFactory, type CircleSchema} from '../src/components/layers/factory/CircleFactory';
import {ImageFactory, type ImageSchema} from '../src/components/layers/factory/ImageFactory';
import {PathFactory, type PathSchema} from '../src/components/layers/factory/PathFactory';
import {RectangleFactory, type RectangleSchema} from '../src/components/layers/factory/RectangleFactory';
import {describe} from 'vitest';
import {type z} from 'zod';

describe('Factory components tests', () => {
	function testComponent<Props extends Record<string, unknown>>(
		Component: React.FC<Props>,
		props: Props,
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
		test('should render Circle component', () => {
			const circleFactory = new CircleFactory();
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

			testComponent(circleFactory.component, circleProps, 'ellipse', {
				cx: '80',
				cy: '90',
				rx: '50',
				ry: '40',
				fill: 'red',
			});
		});
	});

	describe('Image component', () => {
		test('should render Image component', () => {
			const imageFactory = new ImageFactory();
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
			const imageProps = {
				type: 'image',
				uuid: 'test-uuid',
				visible: true,
				x: 50,
				y: 50,
				width: -100,
				height: -100,
				src: 'https://example.com/image.png',
			} satisfies z.infer<typeof ImageSchema>;

			testComponent(imageFactory.component, imageProps, 'image', {
				x: '-50',
				y: '-50',
				width: '100',
				height: '100',
				href: 'https://example.com/image.png',
			});
		});
	});

	describe('Path component', () => {
		test('should render Path component', () => {
			const pathFactory = new PathFactory();
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

			const {container} = render(<svg>{<pathFactory.component {...pathProps}/>}</svg>);
			const path = container.querySelector('path');
			expect(path).toBeInTheDocument();
			expect(path).toHaveAttribute('d');
			expect(path).toHaveAttribute('fill', 'blue');
		});

		test('should render Path component with no points', () => {
			const pathFactory = new PathFactory();
			const pathProps = {
				type: 'path',
				uuid: 'test-uuid',
				visible: true,
				points: [],
				color: 'blue',
				strokeOptions: {
					size: 5,
					thinning: 0.5,
					smoothing: 0.5,
					roundness: 1,
				},
			} satisfies z.infer<typeof PathSchema>;

			const {container} = render(<svg>{<pathFactory.component {...pathProps}/>}</svg>);
			const path = container.querySelector('path');
			expect(path).toBeInTheDocument();
			expect(path).toHaveAttribute('d');
			expect(path).toHaveAttribute('fill', 'blue');
		});
	});

	describe('Rectangle component', () => {
		test('should render Rectangle component', () => {
			const rectangleFactory = new RectangleFactory();
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
			const rectangleProps = {
				type: 'rectangle',
				uuid: 'test-uuid',
				visible: true,
				x: 10,
				y: 50,
				width: -80,
				height: -100,
				color: 'red',
			} satisfies z.infer<typeof RectangleSchema>;

			testComponent(rectangleFactory.component, rectangleProps, 'rect', {
				x: '-70',
				y: '-50',
				width: '80',
				height: '100',
				fill: 'red',
			});
		});
	});
});
