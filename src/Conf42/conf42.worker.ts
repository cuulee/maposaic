import { CanvasDataTransformer } from 'Conf42/CanvasDataTransformer'
import { WorkerPayload } from 'Conf42/types'

// eslint-disable-next-line
const ctx: Worker = self as any

export type WorkerResponse = Uint8ClampedArray

// Respond to message from parent thread
ctx.onmessage = ({ data: { sourcePixelArray, targetPixelArray, size } }: { data: WorkerPayload }) => {
  // eslint-disable-next-line no-console
  console.log('worker')
  const transformer = new CanvasDataTransformer(sourcePixelArray, targetPixelArray, size)
  transformer.paintTargetData()
  ctx.postMessage(transformer.targetPixelArray)
}

export {}
