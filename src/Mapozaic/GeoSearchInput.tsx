import React, { useState } from 'react'
import { AutoComplete } from 'antd'
import { MAPBOX_TOKEN } from './Mapozaic'
import { DrawerPropsType } from './Drawer'

const { Option } = AutoComplete
type GeocoderFeature = {
  id: string
  place_name: string
  center: [number, number]
}

type GeocoderResult = {
  features: GeocoderFeature[]
}
const baseurl = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

const GeoSearch = ({
  flyTo,
  currentCenter,
}: {
  flyTo: DrawerPropsType['flyTo']
  currentCenter: DrawerPropsType['currentCenter']
}) => {
  const [searchText, setSearchText] = useState('')
  const [options, setOptions] = useState<GeocoderFeature[]>([])

  const handleSearch = async (value: string) => {
    setSearchText(value)
    if (value.length < 1) {
      setOptions([])
      return
    }
    const request = `${baseurl}/${value}.json?limit=5&language=fr-FR&access_token=${MAPBOX_TOKEN}&proximity=${currentCenter[0]}%2C${currentCenter[1]}`
    const res = await fetch(request)
    const body: GeocoderResult = await res.json()
    setOptions(body.features)
  }

  const handleSelect = (value: string) => {
    const targetOption = options.find((option) => option.id === value)
    if (targetOption) {
      flyTo(targetOption.center)
    }
  }

  const optionChildren = options.map((option) => {
    const [address, ...rest] = option.place_name.split(',')
    return (
      <Option key={option.id} value={option.id}>
        <div style={{ fontWeight: 500 }}>{address}</div>
        <div>{rest.join('')}</div>
      </Option>
    )
  })

  return (
    <AutoComplete
      style={{ width: 200 }}
      onSearch={handleSearch}
      onSelect={handleSelect}
      value={searchText}
      placeholder="Search location"
    >
      {optionChildren}
    </AutoComplete>
  )
}

export default GeoSearch
