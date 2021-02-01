import { ColorConfig } from 'Colors/types'
import { MapboxStyle, OnPosterSizeChangePayload, SpecificColorTransforms } from 'Maposaic/types'
import { Dispatch, SetStateAction } from 'react'

export type DrawerPropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyle: string
  changeMapStyle: (style: MapboxStyle) => void
  sizeFactor: number
  setNewSizeFactor: (sizeFactor: number) => void
  specificColorTransforms: SpecificColorTransforms
  setNewSpecificColorTransforms: (colors: SpecificColorTransforms) => void
  remainingTime: number | null
  estimatedTime: number | null
  updateEstimatedTime: (sizeFactor: number) => void
  onPosterSizeChange: (p: OnPosterSizeChangePayload) => void
  colorConfig: ColorConfig
  setColorConfig: (colorConfig: ColorConfig) => void
}
