import { ColorConfig, MaposaicColors } from 'Colors/types'
import { OnPosterSizeChangePayload, SpecificColorTransforms } from 'Maposaic/types'

export type DrawerPropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyleURL: string
  changeMapStyle: (style: string) => void
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
