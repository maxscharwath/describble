import React from 'react';

export const Separator = () => <div className='my-2 h-px bg-gray-300 dark:bg-gray-700'/>;

export const Sidebar = (props: React.PropsWithChildren<{title: string}>) => (
	<div
		className='pointer-events-auto flex max-h-96 flex-col overflow-y-auto rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200 dark:backdrop-blur'
	>
		<h2 className='text-base font-bold text-gray-800 dark:text-gray-200'>{props.title}</h2>
		<Separator/>
		{props.children}
	</div>
);

