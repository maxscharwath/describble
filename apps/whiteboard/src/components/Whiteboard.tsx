import style from './Whiteboard.module.scss'
import React, { PointerEvent, useMemo, useState } from 'react'
import { getStroke } from 'perfect-freehand'
import { Toolbar } from './Toolbar'

type Point = number[];

type Layer = {
  path: string;
  color: string;
};

/**
 * Convert a stroke to a path string with quadratic curves
 * @param stroke - A stroke as an array of [x, y, pressure] points
 */
function strokeToPath (stroke: Point[]) {
  if (!stroke.length) return ''
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...stroke[0], 'Q']
  )

  return [...d, 'Z'].join(' ')
}

export default function Whiteboard () {
  const [layers, setLayers] = useState<Layer[]>([])
  const [points, setPoints] = useState<Point[]>([])
  const [color, setColor] = useState<string>('black')
  const pathData = useMemo(() => {
    const stroke = getStroke(points, {
      size: 16,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    })
    return strokeToPath(stroke)
  }, [points])

  function handlePointerDown (e: PointerEvent<SVGElement>) {
    (e.target as SVGElement).setPointerCapture(e.pointerId)
    setPoints([[e.pageX, e.pageY, e.pressure]])
  }

  function handlePointerMove (e: PointerEvent<SVGElement>) {
    if (e.buttons !== 1) return
    setPoints([...points, [e.pageX, e.pageY, e.pressure]])
  }

  function handlePointerUp () {
    setLayers([...layers, { path: pathData, color }])
    setPoints([])
  }

  return (
    <div className="relative">
      <svg
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        className={style.whiteboard}
      >
        {layers.map((layer, i) => (
          <path key={i} d={layer.path} fill={layer.color}/>
        ))}
        {points && <path d={pathData} fill={color}/>}
      </svg>
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
        <Toolbar
          onDelete={() => setLayers([])}
          onSelectedColorChange={(color) => setColor(color)}
        />
      </div>
    </div>
  )
}
