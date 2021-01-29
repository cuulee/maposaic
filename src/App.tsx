import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { Spin } from 'antd'
import spinner from 'assets/spinner.png'
import 'spinner.style.less'
import 'App.style.less'
import { useCheckWasmAvailability } from 'Maposaic/utils'

const Gallery = lazy(() => import('Gallery/Gallery'))
const Maposaic = lazy(() => import('Maposaic/Maposaic'))
const GameOfLife = lazy(() => import('GameOfLife/GameOfLife'))

function App() {
  useEffect(() => {
    void fetch('https://us-central1-maposaic-99785.cloudfunctions.net/fetch3Geonames') // warmup the api
  }, [])

  const [isWasmAvailable, setIsWasmAvailable] = useState<boolean | null>(null)
  useCheckWasmAvailability(setIsWasmAvailable)

  return (
    <Router>
      <Suspense
        fallback={
          <Spin
            spinning={true}
            className="fallback-spinner"
            indicator={<img className="spinner" src={spinner} alt="spin" />}
          />
        }
      >
        <Switch>
          <Route path="/gallery">
            <Gallery />
          </Route>
          <Route path="/game-of-life">
            <GameOfLife />
          </Route>
          <Route path="/">
            <Maposaic isWasmAvailable={isWasmAvailable} />
          </Route>
        </Switch>
      </Suspense>
    </Router>
  )
}

export default App
