import React from 'react';
import ReactDOM from 'react-dom/client';
import {Moodie} from './src';

const App = () => (
	<>
		<h1>Moodies</h1>
		{Array.from({length: 100}, (_, index) => {
			const uuid = crypto.randomUUID();
			return (
				<Moodie
					key={uuid}
					name={uuid}
					size={100}
					onClick={e => {
						const svgData = e.currentTarget.outerHTML;
						const blob = new Blob([svgData], {type: 'image/svg+xml'});
						const url = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						link.download = `moodie-${index}.svg`;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}}
				/>
			);
		})}
	</>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
