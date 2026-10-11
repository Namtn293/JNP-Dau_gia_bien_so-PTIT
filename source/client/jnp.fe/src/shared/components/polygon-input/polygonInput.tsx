import { Button, Space } from "antd"
import { createId } from "@/shared/utils/createId"
import { RectangleCreate } from "@/shared/utils/rectangleCreate"
import { RingCreate } from "@/shared/utils/ringCreate"
import { RingUpdate } from "@/shared/utils/ringUpdate"


import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import { GeometryTool } from "@/shared/utils/geometryTool"
import { MapTool } from "@/shared/utils/mapTool"
import { GeometryType, type Geometry, type PolygonCoordinate, type RingCoordinate } from "~/shared/types/geometry.type"

type Props = {
    value?: Geometry,
    onChange?: (value?: Geometry) => void,
    map: map4d.Map,
    mapHtml: HTMLDivElement


}



type Area = {
    id: string
    polygon: map4d.Polygon,
    hasHole?: boolean
}
type Status = "none" | "areaSelect" | "editArea" | "addHole" | "addPolygon" | "addRectangle"

const AREA_CONFIG = {
    fillColor: "#4285F4",
    activeFillColor: "#201658"
}
const PolygonInput = (props: Props) => {
    const { onChange, map, mapHtml } = props
    const _map = useRef(map)
    const _mapHtml = useRef(mapHtml)
    const _areaMap = useRef<Map<string, Area>>(undefined)
    if (!_areaMap.current) {
        _areaMap.current = new Map<string, Area>()
    }
    const _events = useRef<map4d.MapsEventListener[]>([])
    const _selectArea = useRef<Area>(undefined)
    const _ringUpdates = useRef<RingUpdate[]>([])
    const _ringCreate = useRef<RingCreate>(undefined)
    const _rectangleCreate = useRef<RectangleCreate>(undefined)
    const [status, setStatus] = useState<Status>("none")
    const _data = useRef<Geometry>(undefined)

    const _addAreasToMap = useRef(() => {
        _areaMap.current?.forEach(a => {
            a.polygon?.setMap(_map.current)
        })
    }).current
    const _removeAreasFromMap = useRef(() => {
        _areaMap.current?.forEach(a => {
            a.polygon?.setMap(null)
        })
    }).current

    const _createArea = useRef((polygonCoordinate: PolygonCoordinate) => {
        let polygon = new map4d.Polygon({
            paths: polygonCoordinate,
            fillColor: AREA_CONFIG.fillColor,
            strokeWidth: 0,
            // draggable: true
        })
        let area = {
            id: createId(),
            polygon: polygon,
            hasHole: polygonCoordinate.length > 1
        } as Area
        polygon.setUserData({ id: area.id })
        _areaMap.current?.set(area.id, area)
        return area
    }).current

    const _resetData = useRef((data: Geometry) => {
        _removeAreasFromMap()
        _areaMap.current?.clear()
        if (data.type == GeometryType.polygon) {
            _createArea(data.coordinates)
        }
        else if (data.type == GeometryType.multiPolygon) {
            data.coordinates.forEach(c => {
                _createArea(c)
            })
        }
        _addAreasToMap()
    }).current

    const _removeEvents = useRef(() => {
        _events.current.forEach(e => e?.remove())
        _events.current = []
    }).current

    const _setEventsForNone = useRef(() => {
        _events.current = [
            _map.current.addListener(map4d.MapEvent.click, (args: any) => {
                let polygon = args.polygon as map4d.Polygon
                let { id } = polygon.getUserData() || {}
                let area = _areaMap.current?.get(id)
                if (area && area != _selectArea.current) {
                    setStatus("areaSelect")
                    _selectArea.current?.polygon.setVisible(true)
                    _selectArea.current?.polygon?.setFillColor(AREA_CONFIG.fillColor)
                    polygon.setFillColor(AREA_CONFIG.activeFillColor)
                    _selectArea.current = area
                    _ringUpdates.current?.forEach(r => r.destroy())
                    _ringCreate.current?.destroy()
                    _removeEvents()
                    _setEventForAreaSelect()
                }
            }, { polygon: true }),
        ]
    }).current
    const _resetToNone = useRef(() => {
        setStatus("none")
        _areaMap.current?.forEach(a => {
            a.polygon.setVisible(true)
        })
        _selectArea.current?.polygon?.setVisible(true)
        _selectArea.current?.polygon?.setFillOpacity(1)
        _selectArea.current?.polygon?.setStrokeWidth(0)
        _selectArea.current?.polygon?.setFillColor(AREA_CONFIG.fillColor)
        _ringCreate.current?.destroy()
        _ringUpdates.current?.forEach(r => r.destroy())
        _rectangleCreate.current?.destroy()
        _selectArea.current = undefined
        _removeEvents()
        _setEventsForNone()
    }).current

    const _setEventForAreaSelect = useRef(() => {
        _events.current = [
            _map.current.addListener(map4d.MapEvent.click, (args: any) => {
                let polygon = args.polygon as map4d.Polygon
                let { id } = polygon.getUserData() || {}
                let area = _areaMap.current?.get(id)
                if (area && area != _selectArea.current) {
                    _selectArea.current?.polygon.setVisible(true)
                    _selectArea.current?.polygon?.setFillColor(AREA_CONFIG.fillColor)
                    polygon.setFillColor(AREA_CONFIG.activeFillColor)
                    _selectArea.current = area
                }
            }, { polygon: true }),
            _map.current.addListener(map4d.MapEvent.click, (args: any) => {
                let polygon = args.polygon as map4d.Polygon
                let { id } = polygon?.getUserData() || {}
                if (!_areaMap.current?.has(id)) {
                    setStatus("none")
                    _selectArea.current?.polygon?.setFillColor(AREA_CONFIG.fillColor)
                    _selectArea.current = undefined
                    _removeEvents()
                    _setEventsForNone()
                }

            }, { location: true, poi: true, building: true, circle: true, polyline: true, polygon: true })
        ]
    }).current

    const apply = useCallback(() => {
        let result: Geometry | undefined
        let areas = Array.from(_areaMap.current?.values() || [])
        if (areas.length == 1) {
            let coord = areas[0].polygon.getPaths()
            let polygonCoordinate = coord.map(ring => {
                return ring.map(point => [point.lng, point.lat])
            }) as PolygonCoordinate
            result = {
                coordinates: polygonCoordinate,
                type: GeometryType.polygon
            }
        }
        else if (areas.length > 1) {
            let coord = areas.map(a => {
                let paths = a.polygon.getPaths()
                let polygonCoordinate = paths.map(ring => {
                    return ring.map(point => [point.lng, point.lat])
                }) as PolygonCoordinate
                return polygonCoordinate
            })
            result = {
                coordinates: coord,
                type: GeometryType.multiPolygon
            }
        }
        _data.current = result
        onChange?.(result)
    }, [onChange])

    const onClickCancel = useCallback(() => {
        _resetToNone()
    }, [])

    const onClickEditArea = useCallback(() => {
        _removeEvents()
        setStatus("editArea")
        _ringUpdates.current?.forEach(r => {
            r.destroy()
        })
        _ringUpdates.current = []
        _selectArea.current?.polygon?.getPaths()?.forEach((ring, index) => {
            let ringCoordinate = (ring?.map(r => [r.lng, r.lat])) as RingCoordinate
            let ringUpdate = new RingUpdate({
                map: _map.current,
                data: ringCoordinate,
                mapHtml: _mapHtml.current,
                style: index == 0 ? "default" : "dark",
                canDelete: index != 0 ? true : false
            })
            ringUpdate.startUpdate()
            _ringUpdates.current.push(ringUpdate)
        })
        _selectArea.current?.polygon.setVisible(false)


    }, [])

    const onClickAddHole = useCallback(() => {
        _removeEvents()
        _selectArea.current?.polygon?.setFillOpacity(0)
        _selectArea.current?.polygon?.setStrokeWidth(2)
        _ringCreate.current = new RingCreate({
            map: _map.current,
            mapHtml: _mapHtml.current,
            style: "dark"
        })
        _ringCreate.current.startCreate()
        setStatus("addHole")
        _ringCreate.current.onDone = () => {
            let rings = _ringCreate.current?.getData()
            if (rings) {
                let paths = _selectArea.current?.polygon?.getPaths().map(ring => {
                    return ring.map(r => {
                        return [r.lng, r.lat]
                    })
                })
                paths = paths?.concat(rings)
                _selectArea.current?.polygon?.setPaths(paths as any)
                _selectArea.current?.polygon?.setStrokeWidth(0)
                _selectArea.current?.polygon?.setVisible(true)
                _selectArea.current?.polygon.setFillOpacity(1)
                setStatus("areaSelect")
                _setEventForAreaSelect()
                _ringUpdates.current?.forEach(r => r.destroy())
                _ringCreate.current?.destroy()
                apply()
            }
        }
    }, [])

    const onClickAddArea = useCallback(() => {
        _removeEvents()
        _selectArea.current?.polygon?.setFillColor(AREA_CONFIG.fillColor)
        _ringCreate.current = new RingCreate({
            map: _map.current,
            mapHtml: _mapHtml.current,
        })
        _ringCreate.current.startCreate()
        setStatus("addPolygon")
        _ringCreate.current.onDone = () => {
            let rings = _ringCreate.current?.getData()
            if (rings) {
                rings.forEach(r => {
                    let area = _createArea([r])
                    area.polygon.setMap(_map.current)
                })
                _resetToNone()
                apply()
            }
        }
    }, [apply])

    const onClickAddRectangle = useCallback(() => {
        _removeEvents()
        _selectArea.current?.polygon?.setFillColor(AREA_CONFIG.fillColor)
        _rectangleCreate.current = new RectangleCreate({
            map: _map.current,
            mapHtml: _mapHtml.current,
        })
        _rectangleCreate.current.startCreate()
        setStatus("addPolygon")
        _rectangleCreate.current.onDone = (polygonCoordinate) => {
            let area = _createArea(polygonCoordinate)
            area.polygon.setMap(_map.current)
            _resetToNone()
            apply()
        }
    }, [apply])

    const onClickDeleteArea = useCallback(() => {
        _selectArea.current?.polygon.setMap(null)
        _areaMap.current?.delete(_selectArea.current?.id || "")
        onClickCancel()
    }, [onClickCancel])

    const onClickDoneEditArea = useCallback(() => {
        let paths = _ringUpdates?.current?.map(r => {
            return r.getData()
        }).filter(r => r) as PolygonCoordinate
        _selectArea.current?.polygon?.setPaths(paths)
        apply()
        _resetToNone()
    }, [apply])

    const onClickDoneAddHole = useCallback(() => {
        let rings = _ringCreate.current?.getData()
        if (rings) {
            let paths = _selectArea.current?.polygon?.getPaths().map(ring => {
                return ring.map(r => {
                    return [r.lng, r.lat]
                })
            })
            paths = paths?.concat(rings)
            _selectArea.current?.polygon?.setPaths(paths as any)
            _resetToNone()
            apply()
        }
    }, [apply])

    useEffect(() => {
        if (props.value && props.value != _data.current) {
            _data.current = props.value
            _resetData(props.value)
            console.log("reset data: ", props.value)
        }
    }, [props.value])

    const fitBound1 = useEffectEvent((value?: Geometry) => {
        if (value && map) {
            let points = GeometryTool.getPoints(value)
            MapTool.fitBound(map, points)
        }
    })

    const fitBound2 = useEffectEvent((theMap?: map4d.Map) => {
        if (props.value && theMap) {
            let points = GeometryTool.getPoints(props.value)
            MapTool.fitBound(theMap, points)
        }
    })

    useEffect(() => {
        if (props.value && props.value != _data.current) {
            fitBound1(props.value)

        }
    }, [props.value, map])

    useEffect(() => {
        if (map) {
            fitBound2(map)

        }
    }, [map])

    useEffect(() => {
        _setEventsForNone()
        return () => {
            _removeEvents()
            _ringCreate.current?.destroy()
            _ringUpdates.current?.forEach(r => r?.destroy())
        }
    }, [])

    useEffect(() => {
        if (mapHtml) {
            _mapHtml.current = mapHtml
            _ringCreate?.current?.setMapHtml(mapHtml)
            _ringUpdates.current?.forEach(r => r.setMapHtml(mapHtml))
        }
    }, [mapHtml])

    useEffect(() => {
        if (map) {
            _setEventsForNone()
            _map.current = map
            _addAreasToMap()
            _ringCreate.current?.setMap(map)
            _ringUpdates.current?.forEach(r => r.setMap(map))
        }
        return () => {
            _removeEvents()
            _removeAreasFromMap()
        }
    }, [map])

    return (
        <Space wrap>
            {
                status != "none" &&
                <>
                    <Button
                        onClick={onClickCancel}
                    >
                        Hủy
                    </Button>
                </>
            }

            {
                status == "none" &&
                <>
                    <Button
                        onClick={onClickAddArea}
                    >
                        Thêm polygon
                    </Button>
                    <Button
                        onClick={onClickAddRectangle}
                    >
                        Thêm Hình chữ nhật
                    </Button>
                </>
            }
            {
                status == "areaSelect" &&
                <>
                    <Button
                        onClick={onClickAddHole}
                    >
                        Thêm hố
                    </Button>
                    <Button
                        onClick={onClickDeleteArea}
                    >
                        Xóa
                    </Button>
                    <Button
                        onClick={onClickEditArea}>
                        Sửa
                    </Button>
                </>
            }
            {
                status == "editArea" &&
                <>
                    <Button
                        onClick={onClickDoneEditArea}
                    >
                        xong
                    </Button>
                </>
            }

            {
                status == "addHole" &&
                <>
                    <Button
                        onClick={onClickDoneAddHole}
                    >
                        xong
                    </Button>
                </>
            }
        </Space>
    )
}

export default PolygonInput