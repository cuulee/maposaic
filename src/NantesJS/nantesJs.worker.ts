const ctx: Worker = self as any

ctx.onmessage = (message) => {
  console.log('on y travaille', message)
}

export {}
