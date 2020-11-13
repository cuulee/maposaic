import { notification } from 'antd'
import { GeoData } from 'Mapozaic/types'
import 'Mapozaic/notification.style.less'

export const openPlaceNotification = (data: GeoData) => {
  const city = data.geodata.nearest[0]?.city[0]
  const timezone = data.geodata.nearest[0]?.timezone[0]
  const prov = data.geodata.nearest[0]?.prov[0]
  const isCity = city && city.length
  const isTimezone = timezone && timezone.length
  const isProv = prov && prov.length

  if (!isCity && !isTimezone && !isProv) {
    return
  }
  notification.open({
    message: `${city}${isProv && ', '}${prov}${isTimezone && ', '}${timezone}`,
    placement: 'bottomRight',
  })
}
