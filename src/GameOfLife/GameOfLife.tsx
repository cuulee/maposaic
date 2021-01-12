import { convert, parse_vec, Size, Universe } from 'map-converter'
import React, { useEffect, useState } from 'react'

const SIZE = { w: 3, h: 2 }

const subEXAMPLE = Array.from({ length: 8 }, (_) => Math.round(Math.random() * 255))
// const EXAMPLE = Array.from({ length: 24 }, (_) => 38)

const EXAMPLE = [
  35,
  36,
  37,
  38,
  35,
  36,
  37,
  38,
  255,
  255,
  255,
  255,
  35,
  36,
  37,
  38,
  40,
  41,
  42,
  43,
  255,
  255,
  255,
  255,
  35,
  36,
  37,
  38,
  ...subEXAMPLE,
]

const logArray = (arr: number[] | Uint8Array) => {
  const res = []
  for (let i = 0; i < SIZE.h; i++) {
    const r = []
    for (let j = 0; j < SIZE.w * 4; j++) {
      r.push(arr[i * SIZE.w * 4 + j])
    }
    res.push(r)
  }
  console.log('object', res)
}

const GameOfLife = () => {
  const [gameResult, setGameResult] = useState<null | string>(null)
  const loadMapConverter = () => {
    const universe = Universe.new()
    // run()
    convert(250)
    const size = Size.new(SIZE.w, SIZE.h)

    const a = parse_vec(new Uint8Array(EXAMPLE), size)

    logArray(EXAMPLE)
    logArray(a)

    console.log('parse_vec', EXAMPLE, a)

    const renderLoop = () => {
      setGameResult(universe.render())
      universe.tick()

      requestAnimationFrame(renderLoop)
    }

    requestAnimationFrame(renderLoop)
  }
  useEffect(() => {
    loadMapConverter()
  }, [])

  //   console.log(mapConverter)
  return (
    <div>
      <pre>{gameResult ?? "le jeu n'est pas disponible"}</pre>
    </div>
  )
}

export default GameOfLife
