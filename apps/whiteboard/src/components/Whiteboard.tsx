import React from 'react';
import {Toolbar} from '~components/toolbar/Toolbar';
import {Canvas} from '~components/Canvas';
import {LayersSidebar} from '~components/sidebar/LayersSidebar';
import {Cursors} from '~components/Cursors';
import {SelectionsToolbar} from '~components/ui/Selections';
import {DebugBar} from '~components/toolbar/DebugBar';
import {StyleSidebar} from '~components/sidebar/StyleSidebar';
import {WhiteboardApp, type WhiteboardCallbacks} from '~core/WhiteboardApp';
import {WhiteboardProvider} from '~core/hooks';

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
			<Canvas />
			<div className='pointer-events-none fixed flex h-screen w-screen flex-col'>
				<div className='portrait:standalone:mt-14 m-2 flex w-full flex-row items-center justify-center'>
					<Toolbar />
					<SelectionsToolbar />
				</div>
				<div className='flex grow flex-row justify-end overflow-y-auto'>
					<div className='m-2 flex h-full w-48 flex-col justify-start space-y-2 md:w-72'>
						<StyleSidebar />
						<LayersSidebar />
					</div>
				</div>
				<div className='flex w-full flex-row items-center justify-center'>
					<DebugBar />
				</div>
			</div>
			<Cursors />
		</WhiteboardProvider>
	);
}
