import React from 'react';
import {Toolbar} from '~components/toolbar/Toolbar';
import {Canvas} from '~components/Canvas';
import {LayersSidebar} from '~components/sidebar/LayersSidebar';
import {Cursors} from '~components/Cursors';
import {SelectionsToolbar} from '~components/toolbar/SelectionsToolbar';
import {DebugBar} from '~components/toolbar/DebugBar';
import {StyleSidebar} from '~components/sidebar/StyleSidebar';
import {WhiteboardApp, type WhiteboardCallbacks} from '~core/WhiteboardApp';
import {WhiteboardProvider} from '~core/hooks';
import clsx from 'clsx';
import {shallow} from 'zustand/shallow';

type WhiteboardProps = {
	id: string;
	className?: string;
	style?: React.CSSProperties;
} & WhiteboardCallbacks;

export default function Whiteboard({id, className, style, ...callbacks}: WhiteboardProps) {
	const [app, setApp] = React.useState(() =>
		new WhiteboardApp(id, callbacks),
	);
	React.useLayoutEffect(() => {
		setApp(new WhiteboardApp(id, callbacks));
	}, [id]);

	const settings = app.useStore(state => state.settings, shallow);

	return (
		<WhiteboardProvider value={app}>
			<div className={clsx(className, settings.darkMode && 'dark')} style={style}>
				<div className='relative h-full w-full overflow-hidden'>
					<Canvas />
					<div className='pointer-events-none flex h-full w-full flex-col'>
						<div className='m-2 flex w-full flex-col items-center justify-center portrait:standalone:mt-14'>
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
				</div>
			</div>
		</WhiteboardProvider>
	);
}
