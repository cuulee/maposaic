import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Mapozaic from 'Mapozaic/Mapozaic'
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
          <Mapozaic />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
