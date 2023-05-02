import React from 'react';
import {Toolbar} from './toolbar/Toolbar';
import {Canvas} from './Canvas';
import {Sidebar} from './sidebar/Sidebar';
import {Cursors} from './Cursors';
import {SelectionsToolbar} from './ui/Selections';
import {WhiteboardApp, type WhiteboardCallbacks} from '../core/WhiteboardApp';
import {WhiteboardProvider} from '../core/useWhiteboard';
import {DebugBar} from './toolbar/DebugBar';

type WhiteboardProps = {
	id: string;
} & WhiteboardCallbacks;

export default function Whiteboard({id, ...callbacks}: WhiteboardProps) {
	const [app, setApp] = React.useState(() =>
		new WhiteboardApp(id, callbacks),
	);
	React.useLayoutEffect(() => {
		setApp(new WhiteboardApp(id, callbacks));
	}, [id]);
	return (
		<WhiteboardProvider value={app}>
			<Canvas/>
			<div className='pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center justify-center'>
				<Toolbar/>
				<SelectionsToolbar/>
			</div>
			<div className='pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center'>
				<Sidebar/>
			</div>
			<Cursors/>
			<DebugBar/>
		</WhiteboardProvider>
	);
}
