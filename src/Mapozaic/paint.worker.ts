// eslint-disable-next-line
// @ts-ignore
onmessage = ({ data }): void => {
  console.log(data)
  console.log('Posting message back to main script')
  // eslint-disable-next-line
  // @ts-ignore
  postMessage('ça va ?')
}
