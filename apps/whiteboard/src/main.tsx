import React from 'react';
import ReactDOM from 'react-dom/client';
import './locales/config';
import './index.css';
import {WhiteboardApp} from '~core/WhiteboardApp';
import {WhiteboardProvider} from '~core/hooks';
import {createBrowserRouter, redirect, RouterProvider} from 'react-router-dom';
import {Document} from '~pages/Document';
import {Root} from '~pages/Root';
import {Auth} from '~pages/login/Auth';
import {initSeeder} from '~seeders';

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
	{
		path: '/',
		loader: authMiddleware,
		element: <Root />,
	},
	{
		path: 'login',
		element: <Auth />,
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
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WhiteboardProvider value={app}>
			<RouterProvider router={router} />
		</WhiteboardProvider>
	</React.StrictMode>,
);
