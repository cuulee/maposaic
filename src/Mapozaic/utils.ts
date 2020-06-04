import { Size } from './types'

export const getTargetSizeFromSourceSize = (sourceSize: Size, canvassRatio: number) => {
  return {
    w: Math.ceil(sourceSize.w / canvassRatio),
    h: Math.ceil(sourceSize.h / canvassRatio),
  }
}
