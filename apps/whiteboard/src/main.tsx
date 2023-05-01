import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainApp from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<MainApp id='new-whiteboard' />
	</React.StrictMode>,
);
