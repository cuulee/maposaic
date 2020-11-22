import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Maposaic from 'Maposaic/Maposaic'
import Gallery from 'Gallery/Gallery'

import 'App.less'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/gallery">
          <Gallery />
        </Route>
        <Route path="/">
          <Maposaic />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
