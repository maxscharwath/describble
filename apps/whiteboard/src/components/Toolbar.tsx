import { create } from 'zustand'
import { clsx } from 'clsx'

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

type ToolbarState = {
  selectedColor: typeof colors[number],
}

export const useToolbar = create<ToolbarState>(() => ({
  selectedColor: 'black'
}))

export function Toolbar () {
  const { selectedColor } = useToolbar()
  return (
    <div
      className="bg-gray-100/80 backdrop-blur p-2 m-2 rounded-lg shadow-lg flex flex-col items-center border border-gray-200">
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            type="button"
            className={clsx(
              'rounded-full w-8 h-8 bg-gray-200 transition-all',
              'hover:scale-110',
              'active:scale-90',
              selectedColor === color && 'ring-2 ring-offset-2 ring-black ring-opacity-60'
            )}
            style={{ backgroundColor: color }}
            key={color}
            onClick={() => useToolbar.setState({ selectedColor: color })}
          />
        ))}
      </div>
    </div>
  )
}
