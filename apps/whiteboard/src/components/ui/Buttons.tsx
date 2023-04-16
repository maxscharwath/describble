import React from 'react';
import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

export const Button = ({active, disabled, activeSlot, inactiveSlot, children, className, ...props}: React.ComponentProps<'button'> & {
	active?: boolean;
	activeSlot?: React.ReactNode;
	inactiveSlot?: React.ReactNode;
}) => (
	<button
		type='button'
		className={twMerge(clsx(
			'rounded-full bg-gray-200 p-2 transition-all hover:scale-110 active:scale-90',
			active && 'bg-gray-900 text-white',
			disabled && 'cursor-not-allowed opacity-50',
		), className)}
		disabled={disabled}
		{...props}
	>
		{(active ? activeSlot : inactiveSlot) ?? children}
	</button>
);
