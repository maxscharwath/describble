import React, { useState } from 'react'
import { Toolbar } from './Toolbar'
import { Cursor } from 'ui'
import { Canvas } from './Canvas'

const useMousePosition = () => {
	const [state, setState] = useState({ x: 0, y: 0, clicked: false })
	React.useEffect(() => {
		const handleMouse = (e: MouseEvent) => {
			setState({ x: e.pageX, y: e.pageY, clicked: e.buttons > 0 })
		}

		window.addEventListener('pointermove', handleMouse)
		window.addEventListener('pointerdown', handleMouse)
		window.addEventListener('pointerup', handleMouse)
		return () => {
			window.removeEventListener('pointermove', handleMouse)
			window.removeEventListener('pointerdown', handleMouse)
			window.removeEventListener('pointerup', handleMouse)
		}
	}, [])
	return state
}

export default function Whiteboard () {
	const { x, y, clicked } = useMousePosition()
	return (
		<div className="relative cursor-none">
			<Canvas/>
			<div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
				<Toolbar/>
			</div>
			<Cursor color="red" label="User 1" x={x} y={y} clicked={clicked}/>
			<Cursor color="blue" label="User 2" x={x + 100} y={y} clicked={clicked} interpolate/>
		</div>
	)
}
