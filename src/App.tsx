import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Spin } from 'antd'
import spinner from 'assets/spinner.png'
import 'spinner.style.less'
import 'App.style.less'

const Gallery = lazy(() => import('Gallery/Gallery'))
const Maposaic = lazy(() => import('Maposaic/Maposaic'))

function App() {
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
          <Route path="/">
            <Maposaic />
          </Route>
        </Switch>
      </Suspense>
    </Router>
  )
}

export default App
