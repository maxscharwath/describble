import React from 'react';
import ReactDOM from 'react-dom/client';
import './locales/config';
import './index.css';
import {WhiteboardApp} from '~core/WhiteboardApp';
import {useShortcuts, WhiteboardProvider} from '~core/hooks';
import {
	createBrowserRouter,
	createRoutesFromElements,
	type LoaderFunction,
	type LoaderFunctionArgs,
	Outlet,
	redirect,
	Route,
	RouterProvider,
} from 'react-router-dom';
import {Document} from '~pages/Document';
import {Root} from '~pages/Root';
import {Auth} from '~pages/auth/Auth';
import {initSeeder} from '~seeders';
import {Login} from '~pages/auth/login/Login';
import {Register} from '~pages/auth/register/Register';
import {Recover} from '~pages/auth/recover/Recover';
import {ThemeProvider} from '~components/ThemeProvider';
import {NotFound} from '~pages/NotFound';
import {ErrorBoundary} from '~pages/ErrorBoundary';
import {HotkeysProvider} from 'react-hotkeys-hook';

const app = new WhiteboardApp('whiteboard');

await initSeeder(app);

const createMiddleware = (...middlewares: LoaderFunction[]) => async (arg: LoaderFunctionArgs) => middlewares.reduce<Promise<any>>(async (previousPromise, currentMiddleware) => {
	await previousPromise;
	return currentMiddleware(arg);
}, Promise.resolve());

const authMiddleware = createMiddleware(() => {
	try {
		return app.sessionManager.currentSession;
	} catch {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal -- this is a redirect
		throw redirect('/login');
	}
});

const documentMiddleware = createMiddleware(authMiddleware, async ({params}) => {
	try {
		return await app.documentManager.open(params.id!);
	} catch {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response('Not Found', {status: 404});
	}
});

function Layout() {
	useShortcuts();
	return <>
		<Outlet />
	</>;
}

const router = createBrowserRouter(createRoutesFromElements(
	<Route element={<Layout />} errorElement={<ErrorBoundary />}>
		<Route path='/' loader={authMiddleware} element={<Root />} />
		<Route element={<Auth />}>
			<Route path='/login' element={<Login />} />
			<Route path='/register' element={<Register />} />
			<Route path='/recover' element={<Recover />} />
		</Route>
		<Route loader={documentMiddleware} path='/document/:id' element={<Document />} />
		<Route path='*' element={<NotFound />} />
	</Route>,
));

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WhiteboardProvider value={app}>
			<HotkeysProvider initiallyActiveScopes={['global']}>
				<ThemeProvider>
					<RouterProvider router={router} />
				</ThemeProvider>
			</HotkeysProvider>
		</WhiteboardProvider>
	</React.StrictMode>,
);
