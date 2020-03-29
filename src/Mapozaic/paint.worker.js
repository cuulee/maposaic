// my-worker-file.js
/* eslint-disable no-restricted-globals */
export default () => {
  self.onmessage = ({ data }) => {
    console.log(data)
    console.log('Posting message back to main script')
    postMessage('ça va ?', 'origin')
  }
}
