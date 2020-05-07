export type ImagePoint = { x: number; y: number }
export type RGBColor = { r: number; g: number; b: number }

export enum Corner {
  ONO = 'ONO',
  NNO = 'NNO',
  NNE = 'NNE',
  ENE = 'ENE',
  SSO = 'SSO',
  OSO = 'OSO',
  SSE = 'SSE',
  ESE = 'ESE',
}

export enum Adjacent {
  N = 'N',
  E = 'E',
  O = 'O',
  S = 'S',
}

export enum Border {
  NOtoNE,
  NEtoNO,
  SOtoSE,
  SEtoSO,
  NEtoSE,
  SEtoNE,
  SOtoNO,
  NOtoSO,
}

export enum Draw {
  Right = 'h 1',
  Left = 'h -1',
  Up = 'v -1',
  Down = 'v 1',
}

export type PointWithIndex = {
  point: ImagePoint
  pixelIndex: number
}

export type BorderPoint = {
  parentCorner: Corner
  pixelIndex: number
  point: ImagePoint
}

export type Path = {
  d: string
  id: number
  color: string
}
