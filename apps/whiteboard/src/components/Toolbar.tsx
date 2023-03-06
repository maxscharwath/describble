import { clsx } from 'clsx'
import { useState } from 'react'

const colors = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
  'purple',
  'pink',
  'black',
  'gray',
  'white',
] as const

type Color = (typeof colors)[number];

type ToolbarProps = {
  onDelete: () => void;
  onSelectedColorChange: (color: Color) => void;
};

export function Toolbar (props: ToolbarProps) {
  const [selectedColor, setSelectedColor] = useState<Color>('black')
  const handleColorChange = (color: Color) => {
    setSelectedColor(color)
    props.onSelectedColorChange(color)
  }
  return (
    <div
      className="bg-gray-100/80 backdrop-blur p-2 m-2 rounded-lg shadow-lg flex items-center border border-gray-200 pointer-events-auto">
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            type="button"
            className={clsx(
              'rounded-full w-6 h-6 bg-gray-200 transition-all border border-black border-opacity-20',
              'hover:scale-110',
              'active:scale-90',
              selectedColor === color &&
              'ring-2 ring-offset-2 ring-black ring-opacity-50'
            )}
            style={{ backgroundColor: color }}
            key={color}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </div>
      <div className="w-px h-full bg-gray-200 mx-2 rounded-full"/>
      <button
        type="button"
        onClick={props.onDelete}
        className="p-2 rounded-full bg-gray-200 hover:scale-110 active:scale-90 transition-all text-red-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"
          ></path>
        </svg>
      </button>
    </div>
  )
}
