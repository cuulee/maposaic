import { CanvasDataTransformer } from 'Conf42/CanvasDataTransformer'
import { WorkerPayload } from 'Conf42/types'

const ctx: Worker = self as any

ctx.onmessage = ({ data: { sourcePixelArray, targetPixelArray, size } }: { data: WorkerPayload }) => {
  console.log('working on this')
  const transformer = new CanvasDataTransformer(sourcePixelArray, targetPixelArray, size)
  transformer.paintTargetData()

  ctx.postMessage(transformer.targetPixelArray)
}

export {}
