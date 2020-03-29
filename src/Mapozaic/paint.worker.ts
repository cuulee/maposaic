// my-worker-file.js
/* eslint-disable no-restricted-globals */
onmessage = ({ data }) => {
  console.log(data)
  console.log('Posting message back to main script')
  // @ts-ignore
  postMessage('ça va ?')
}
