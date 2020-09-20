const ctx: Worker = self as any

export type WorkerResponse = Uint8ClampedArray

// Respond to message from parent thread
ctx.onmessage = (ev) => {
  console.log('worker', ev)
  ctx.postMessage('gotit')
}

export {}
