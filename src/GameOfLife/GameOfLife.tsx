import { convert, run, Universe } from 'map-converter'
import React, { useEffect, useState } from 'react'

const EXAMPLE = Array.from({ length: 3 * 4 * 4 }, (_) => Math.round(Math.random() * 255))

const GameOfLife = () => {
  const [gameResult, setGameResult] = useState<null | string>(null)
  const loadMapConverter = () => {
    const universe = Universe.new()
    console.log('EXAMPLE', EXAMPLE)
    // run()
    convert(250)

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
