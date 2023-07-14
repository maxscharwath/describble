import {Moodie} from 'moodie';
import React from 'react';
import {twMerge} from 'tailwind-merge';

export const KeyAvatar = ({value, className}: {value: string; className?: string}) => <div className='avatar'>
	<div className={twMerge('rounded-full', className)}>
		<Moodie
			size='100%'
			square
			name={value}
			colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
		/>
	</div>
</div>;
