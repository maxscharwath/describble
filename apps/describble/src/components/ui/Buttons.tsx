import React from 'react';
import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

export const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'> & {
	active?: boolean;
	activeSlot?: React.ReactNode;
	inactiveSlot?: React.ReactNode;
}>(({active, disabled, activeSlot, inactiveSlot, children, className, ...props}, ref) => (
	<button
		ref={ref}
		type='button'
		className={twMerge(
			clsx(
				'btn-sm btn-circle btn',
				active && 'btn-neutral btn-active',
				disabled && 'btn-disabled',
			),
			className,
		)}
		disabled={disabled}
		{...props}
	>
		{(active ? activeSlot : inactiveSlot) ?? children}
	</button>
));
Button.displayName = 'Button';
