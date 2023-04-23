import React from 'react';
import {Toolbar} from './toolbar/Toolbar';
import {Canvas} from './Canvas';
import {Sidebar} from './sidebar/Sidebar';
import {Cursors} from './Cursors';
import {SelectionsToolbar} from './ui/Selections';

export default function Whiteboard() {
	return (
		<div className='cursor-none'>
			<Canvas/>
			<div className='pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center justify-center'>
				<Toolbar/>
				<SelectionsToolbar/>
			</div>
			<div className='pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center'>
				<Sidebar/>
			</div>
			<Cursors/>
		</div>
	);
}
