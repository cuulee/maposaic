import { notification } from 'antd'
import 'Mapozaic/notification.style.less'

export const openPlaceNotification = (placeName: string | null) => {
  if (null === placeName) {
    return
  }
  notification.open({
    message: placeName,
    placement: 'bottomRight',
  })
}
