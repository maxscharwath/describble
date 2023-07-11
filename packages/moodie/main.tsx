import React from 'react';
import ReactDOM from 'react-dom/client';
import {Moodie} from './src';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<h1>Moodies</h1>
		{Array.from({length: 100}, () => {
			const uuid = crypto.randomUUID();
			return (
				<Moodie key={uuid} name={uuid} size={100}/>
			);
		})}
	</React.StrictMode>,
);
