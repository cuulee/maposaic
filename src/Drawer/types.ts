import { ColorConfig } from 'Colors/types'
import { MapboxStyle, OnPosterSizeChangePayload, SpecificColorTransforms } from 'Maposaic/types'

export type DrawerPropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyle: string
  changeMapStyle: (style: MapboxStyle) => void
  specificColorTransforms: SpecificColorTransforms
  setNewSpecificColorTransforms: (colors: SpecificColorTransforms) => void
  remainingTime: number | null
  estimatedTime: number | null
  onPosterSizeChange: (p: OnPosterSizeChangePayload) => void
  colorConfig: ColorConfig
  setColorConfig: (colorConfig: ColorConfig) => void
  isMobile: boolean
}
