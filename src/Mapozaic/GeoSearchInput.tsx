import React, { useState } from 'react'
import { AutoComplete, Input } from 'antd'
import { MAPBOX_TOKEN } from './Mapozaic'
import { DrawerPropsType } from './Drawer'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons'

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
  setDrawerVisible,
}: {
  flyTo: DrawerPropsType['flyTo']
  currentCenter: DrawerPropsType['currentCenter']
  setDrawerVisible: DrawerPropsType['setDrawerVisible']
}) => {
  const [searchText, setSearchText] = useState('')
  const [options, setOptions] = useState<GeocoderFeature[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (value: string) => {
    setSearchText(value)
    if (value.length < 1) {
      setOptions([])
      return
    }
    setIsSearching(true)
    const request = `${baseurl}/${value}.json?limit=5&language=fr-FR&access_token=${MAPBOX_TOKEN}&proximity=${currentCenter[0]}%2C${currentCenter[1]}`
    const res = await fetch(request)
    const body: GeocoderResult = await res.json()
    setIsSearching(false)
    setOptions(body.features)
  }

  const handleSelect = (value: string) => {
    const targetOption = options.find((option) => option.id === value)
    if (targetOption) {
      setDrawerVisible(false)
      flyTo(targetOption.center)
    }
  }

  const optionChildren = options.map((option) => {
    const [address, ...rest] = option.place_name.split(',')
    return {
      value: option.id,
      label: (
        <div>
          <div style={{ fontWeight: 500 }}>{address}</div>
          <div>{rest.join('')}</div>
        </div>
      ),
    }
  })

  return (
    <AutoComplete
      style={{ width: 200 }}
      onSearch={handleSearch}
      onSelect={handleSelect}
      value={searchText}
      placeholder="Search location"
      options={optionChildren}
    >
      <Input suffix={isSearching ? <LoadingOutlined /> : <SearchOutlined />} />
    </AutoComplete>
  )
}

export default GeoSearch
