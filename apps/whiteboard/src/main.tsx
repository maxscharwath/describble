import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Whiteboard from './components/Whiteboard';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Whiteboard id='new-whiteboard' className='fixed h-screen w-screen'/>
	</React.StrictMode>,
);
