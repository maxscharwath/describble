import React from 'react';
import ReactDOM from 'react-dom/client';
import './locales/config';
import './index.css';
import {WhiteboardApp} from '~core/WhiteboardApp';
import {WhiteboardProvider} from '~core/hooks';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {Document} from '~pages/Document';
import {Root} from '~pages/Root';
import {Login} from '~pages/login/Login';

const app = new WhiteboardApp('whiteboard');
const router = createBrowserRouter([
	{
		path: '/document/:id',
		async loader({params}) {
			try {
				return await app.documentManager.open(params.id!);
			} catch {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw new Response('Not Found', {status: 404});
			}
		},
		element: <Document />,
		errorElement: <div>Document not found</div>,
	},
	{
		path: '/',
		element: <Root />,
	},
	{
		path: 'login',
		element: <Login />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WhiteboardProvider value={app}>
			<RouterProvider router={router} />
		</WhiteboardProvider>
	</React.StrictMode>,
);
