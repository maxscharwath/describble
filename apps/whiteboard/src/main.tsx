import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/Whiteboard'
import './index.css'
import { Cursor } from 'ui'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App/>
		<Cursor color="red"/>
	</React.StrictMode>,
)
