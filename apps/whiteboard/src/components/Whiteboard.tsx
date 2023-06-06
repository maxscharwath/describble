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
import {ErrorBoundary} from 'react-error-boundary';

type WhiteboardProps = {
	id: string;
	className?: string;
	style?: React.CSSProperties;
} & WhiteboardCallbacks;

function ErrorFallback({error, resetErrorBoundary}: {error: Error; resetErrorBoundary: () => void}) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-400 dark:bg-gray-900'>
			<div className='mx-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 md:mx-0 md:w-full md:max-w-md'>
				<h2 className='mb-4 text-xl font-bold text-gray-800 dark:text-gray-200'>
					Something went wrong:
				</h2>
				<pre className='mb-6 overflow-x-auto font-mono text-sm text-red-700 dark:text-red-400'>
					{error.message}
				</pre>
				<div className='flex justify-end'>
					<button
						onClick={resetErrorBoundary}
						className='rounded-md bg-gray-200 px-3 py-2 text-gray-900 transition-all hover:scale-110 active:scale-90 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-900'
					>
						Hard Reset
					</button>
				</div>
			</div>
		</div>
	);
}

export default function Whiteboard({id, className, style, ...callbacks}: WhiteboardProps) {
	const [app, setApp] = React.useState(() =>
		new WhiteboardApp(id, callbacks),
	);

	const settings = app.useStore(state => state.settings, shallow);

	const hardReset = React.useCallback(() => {
		app.reset();
		setApp(new WhiteboardApp(id, callbacks));
	}, [app, id, callbacks]);

	return (
		<WhiteboardProvider value={app}>
			<div className={clsx(className, settings.darkMode && 'dark')} style={style}>
				<ErrorBoundary FallbackComponent={ErrorFallback} onReset={hardReset}>
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
				</ErrorBoundary>
			</div>
		</WhiteboardProvider>
	);
}
