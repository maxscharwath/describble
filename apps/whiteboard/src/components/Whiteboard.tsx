import React from 'react'
import { Toolbar } from './toolbar/Toolbar'
import { Cursor } from 'ui'
import { Canvas } from './Canvas'
import { useMouseState } from '../hooks/useMouse'

export default function Whiteboard () {
	const { x, y, clicked } = useMouseState()
	const [color, setColor] = React.useState('black')
	return (
		<div className="relative cursor-none">
			<Canvas color={color}/>
			<div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
				<Toolbar onSelectColor={setColor} selectedColor={color}/>
			</div>
			<Cursor color="red" label="User 1" x={x} y={y} clicked={clicked}/>
			<Cursor color="blue" label="User 2" x={x + 100} y={y} clicked={clicked} interpolate/>
		</div>
	)
}
