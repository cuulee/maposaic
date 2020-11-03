import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/analytics'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAuounsVwHYGk-hZ_0EBsLi0aQLhYepYJk',
  authDomain: 'maposaic-99785.firebaseapp.com',
  databaseURL: 'https://maposaic-99785.firebaseio.com',
  projectId: 'maposaic-99785',
  storageBucket: 'maposaic-99785.appspot.com',
  messagingSenderId: '702337108747',
  appId: '1:702337108747:web:488c6903c51e09917ff00e',
  measurementId: 'G-GCGS9CE9RL',
}

firebase.initializeApp(firebaseConfig)
firebase.analytics()
export const db = firebase.firestore()
export const firestore = firebase.storage()

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
