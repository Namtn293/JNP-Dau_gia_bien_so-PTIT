import { GeometryType, type Geometry, type PolygonCoordinate } from "@/shared/types/geometry.type";
import { createId } from "@shared/utils/createId";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MFPolygon } from "react-map4d-map";

type DataModel = {
    path: PolygonCoordinate,
    id: string,
}
type GeometryDrawProps = {
    geometry?: Geometry,
    color?: string,
    url?: string,
    map?: map4d.Map,
    opacity?: number
    lineColor?: string,
    lineWidth?: number,
    zIndex?: number
    clickable?: boolean,
    bindData?: any,
    onHover?: (args: any, bindData?: any) => void,
    onClick?: (args: any) => void;
}
 export const PolygonDraw = (props: GeometryDrawProps) => {
    const { color, geometry, map, opacity, lineColor, lineWidth, zIndex, clickable = true, bindData, onHover, onClick } = props
    const _polygons = useRef<map4d.Polygon[]>([])
    const data = useMemo(() => {
        let result = [] as DataModel[]
        if (geometry?.type == GeometryType.multiPolygon) {
            result = geometry.coordinates.map(c => {
                return {
                    id: createId(),
                    path: c
                }
            })
        }
        else if (geometry?.type == GeometryType.polygon) {
            result = [
                {
                    id: createId(),
                    path: geometry?.coordinates
                }
            ]
        }
        return result
    }, [geometry])

    const onCreated = useCallback((index: number) => {
        return (value: map4d.Polygon) => {
            _polygons.current[index] = value
        }
    }, [])


    useEffect(() => {
        let e = map?.addListener(map4d.MapEvent.hover, (args: any) => {
            if (_polygons.current.includes(args.polygon)) {
                onHover?.(args, bindData)
            }
        }, { polygon: true })
        return () => {
            e?.remove()
        }
    }, [map, onHover, bindData])

    return (

        map && data.length > 0 && data.map((d, i) => {
            return (
                <MFPolygon
                    onCreated={onCreated(i)}
                    key={d.id}
                    map={map}
                    paths={d.path}
                    fillColor={color}
                    fillOpacity={opacity}
                    strokeColor={lineColor}
                    strokeWidth={lineWidth}
                    zIndex={zIndex}
                    clickable={clickable}
                    onClick={onClick}
                />
            )
        })

    )
}