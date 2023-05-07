import React from 'react';
import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

export const Button = ({
	active,
	disabled,
	activeSlot,
	inactiveSlot,
	children,
	className,
	...props
}: React.ComponentProps<'button'> & {
	active?: boolean;
	activeSlot?: React.ReactNode;
	inactiveSlot?: React.ReactNode;
}) => (
	<button
		type='button'
		className={twMerge(
			clsx(
				'rounded-full bg-gray-200 p-2 transition-all hover:scale-110 active:scale-90 dark:bg-gray-700 dark:hover:bg-gray-900',
				active && 'bg-gray-900 text-white dark:bg-gray-500 dark:text-gray-200',
				disabled && 'cursor-not-allowed opacity-50 dark:opacity-50',
			),
			className,
		)}
		disabled={disabled}
		{...props}
	>
		{(active ? activeSlot : inactiveSlot) ?? children}
	</button>
);
