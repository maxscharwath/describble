import React from 'react';
import ReactDOM from 'react-dom/client';
import './locales/config';
import './index.css';
import {WhiteboardApp} from '~core/WhiteboardApp';
import {WhiteboardProvider} from '~core/hooks';
import {createBrowserRouter, redirect, RouterProvider} from 'react-router-dom';
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

const app = new WhiteboardApp('whiteboard');

await initSeeder(app);

const authMiddleware = () => {
	try {
		return app.sessionManager.currentSession;
	} catch {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal -- this is a redirect
		throw redirect('/login');
	}
};

const router = createBrowserRouter([
	{path: '/', errorElement: <ErrorBoundary />, children: [
		{
			path: '/',
			loader: authMiddleware,
			element: <Root />,
		},
		{
			path: '/',
			element: <Auth />,
			children: [
				{
					path: '/login',
					element: <Login />,
				},
				{
					path: '/register',
					element: <Register />,
				},
				{
					path: '/recover',
					element: <Recover />,
				},
			],
		},
		{
			path: '/document/:id',
			async loader({params}) {
				authMiddleware();
				try {
					return await app.documentManager.open(params.id!);
				} catch {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
					throw new Response('Not Found', {status: 404});
				}
			},
			element: <Document />,
		},
		{
			path: '*',
			element: <NotFound />,
		},
	]},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WhiteboardProvider value={app}>
			<ThemeProvider>
				<RouterProvider router={router} />
			</ThemeProvider>
		</WhiteboardProvider>
	</React.StrictMode>,
);
