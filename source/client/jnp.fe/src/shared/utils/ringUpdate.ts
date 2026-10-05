import type { PointCoordinate, RingCoordinate } from "../types/geometry.type"
import { createId } from "./createId"

export type Options = {
    map: map4d.Map,
    mapHtml?: HTMLDivElement,
    data?: RingCoordinate,
    style?: Style,
    canDelete?: boolean
}

type Point = {
    id: string
    circle: map4d.Circle,
    prevLineId?: string
    nextLineId?: string
}
type Line = {
    id: string
    polyline: map4d.Polyline,
    firstPointId?: string,
    secondPointId?: string
}
type CircleData = {
    id: string
}
type PolylineData = {
    id: string
}


type Style = "default" | "dark"

const CONFIG = {
    default: {
        circle: {
            radius: 7,
            strokeColor: "#3F90E4",
            color: "#1154AA",
            strokeWidth: 3,
            zIndex: 6,
            virtual: {
                zIndex: 5
            }
        },
        polyline: {
            color: "#3F90E4",
            strokeWidth: 3,
            zIndex: 4
        },
        polygon: {
            color: "#3F90E4",
            strokeColor: "#3F90E4",
            strokeWidth: 3,
            opacity: 0.1,
            zIndex: 3
        }
    },
    dark: {
        circle: {
            radius: 7,
            strokeColor: "#3d3d3d",
            color: "#212121",
            strokeWidth: 3,
            zIndex: 6,
            virtual: {
                zIndex: 5
            }
        },
        polyline: {
            color: "#3d3d3d",
            strokeWidth: 3,
            zIndex: 4
        },
        polygon: {
            color: "#3d3d3d",
            strokeColor: "#3d3d3d",
            strokeWidth: 3,
            opacity: 0.1,
            zIndex: 3
        }
    }

}

const getProjection = (line1: map4d.LatLng, line2: map4d.LatLng, pt: map4d.LatLng) => {
    let isValid = false;

    let r = {} as map4d.LatLng;
    if (line1.lat == line2.lat && line1.lng == line2.lng) line1.lat -= 0.00001;

    let U = ((pt.lat - line1.lat) * (line2.lat - line1.lat)) + ((pt.lng - line1.lng) * (line2.lng - line1.lng));

    let Udenom = Math.pow(line2.lat - line1.lat, 2) + Math.pow(line2.lng - line1.lng, 2);

    U /= Udenom;

    r.lat = line1.lat + (U * (line2.lat - line1.lat));
    r.lng = line1.lng + (U * (line2.lng - line1.lng));

    let minx, maxx, miny, maxy;

    minx = Math.min(line1.lat, line2.lat);
    maxx = Math.max(line1.lat, line2.lat);

    miny = Math.min(line1.lng, line2.lng);
    maxy = Math.max(line1.lng, line2.lng);

    isValid = (r.lat >= minx && r.lat <= maxx) && (r.lng >= miny && r.lng <= maxy);

    return isValid ? r : null;
}

const getDistance = (a: map4d.ILatLng, b: map4d.ILatLng) => {
    let measure = new map4d.Measure([a, b])
    return measure.length
}

export class RingUpdate {
    private map: map4d.Map
    private mapHtml?: HTMLDivElement
    private style: Style = "default"
    private canDelete = false
    private readonly polygon = new map4d.Polygon({
        paths: [[[0, 0], [1, 1], [2, 2]]] as any,
        fillColor: CONFIG[this.style].polygon.color,
        fillOpacity: CONFIG[this.style].polygon.opacity,
        clickable: true,
        draggable: true,
        strokeColor: CONFIG[this.style].polygon.strokeColor,
        zIndex: CONFIG[this.style].polygon.zIndex,
        strokeWidth: CONFIG[this.style].polygon.strokeWidth
    })
    private readonly pointMap = new Map<string, Point>()
    private readonly lineMap = new Map<string, Line>()
    private virtualPoint = {
        isDragging: false,
        circle: new map4d.Circle({
            center: [0, 0],
            fillColor: CONFIG[this.style].circle.color,
            strokeColor: CONFIG[this.style].circle.strokeColor,
            strokeWidth: CONFIG[this.style].circle.strokeWidth,
            zIndex: CONFIG[this.style].circle.virtual.zIndex,
            visible: false,
            draggable: true
        }),
        lineId: "",
        pointId: ""
    }
    private events: map4d.MapsEventListener[] = []
    private isDeleted = false

    constructor(options: Options) {
        const { map, mapHtml, data, style, canDelete = false } = options
        this.style = (style || "default")
        this.map = map
        this.canDelete = canDelete
        this.mapHtml = mapHtml

        if (data) {
            this.setData(data)
        }

        this.updateSizePoint()

        this.virtualPoint.circle.setStrokeColor(CONFIG[this.style].circle.strokeColor)
        this.virtualPoint.circle.setFillColor(CONFIG[this.style].circle.color)

        this.polygon.setStrokeColor(CONFIG[this.style].polygon.strokeColor)
        this.polygon.setFillColor(CONFIG[this.style].polygon.color)

    }

    private updateSizePoint = () => {
        let r = this.map.getMeterFromPx(CONFIG[this.style].circle.radius) || 0
        this.virtualPoint.circle.setRadius(r)
        this.pointMap.forEach(p => {
            p.circle.setRadius(r)
        })
    }

    private readonly mouseMove = (e: MouseEvent) => {
        if (this.mapHtml) {
            let { left = 0, top = 0 } = this.mapHtml?.getBoundingClientRect() || {}
            let x = e.clientX - left
            let y = e.clientY - top
            let projection = new map4d.Projection(this.map)
            let point = projection.fromScreenToLatLng({ x, y })

            if (!this.virtualPoint.isDragging) {
                let line = this.lineMap.get(this.virtualPoint.lineId)
                let a = this.pointMap.get(line?.firstPointId || "")?.circle?.getCenter()
                let b = this.pointMap.get(line?.secondPointId || "")?.circle?.getCenter()
                if (line && a && b) {
                    let projectionPoint = getProjection(a, b, point)
                    if (projectionPoint) {
                        let distance = getDistance(point, projectionPoint)
                        let distancePx = this.map.getPxFromMeter(distance) || 0
                        if (distancePx <= CONFIG[this.style].circle.radius) {
                            this.virtualPoint.circle?.setCenter(projectionPoint as any)
                            this.virtualPoint.circle?.setVisible(true)

                            // setPositionTooltip(projectionPoint)
                            // setDescriptions([
                            //     "Kéo để thay đổi"
                            // ])
                            // setHeightChbild(20)
                            // setWidthChild(20)
                            // setShowTooltip(true)
                        }
                        else {
                            this.virtualPoint.circle?.setVisible(false)
                        }
                    }
                }
                else {
                    this.virtualPoint.circle.setVisible(false)
                }
            }
        }

    }

    setMap = (map: map4d.Map) => {
        this.map = map
        this.updateSizePoint()
        this.setEventForMap()

    }
    setMapHtml = (mapHtml: HTMLDivElement) => {
        this.mapHtml = mapHtml
        this.setEventForMapHtml()
        this.addAllAnnotationToMap()

    }
    setData = (data: RingCoordinate) => {
        this.createPointsAndLinesByData(data)
        this.polygon?.setPaths([data])
    }

    startUpdate = () => {
        this.isDeleted = false
        this.removeAllAnnotationFromMap()
        this.addAllAnnotationToMap()
        this.setEventForMapHtml()
        this.setEventForMap()

    }

    getData = () => {
        if (this.isDeleted) {
            return undefined
        }
        else {
            return (this.polygon?.getPaths()?.[0]?.map(p => [p.lng, p.lat])) as RingCoordinate
        }
    }

    private removeAllAnnotationFromMap = () => {
        this.pointMap.forEach(p => {
            p.circle?.setMap(null)
        })
        this.lineMap.forEach(l => {
            l.polyline?.setMap(null)
        })
        this.virtualPoint.circle.setMap(null)
        this.polygon.setMap(null)
    }


    private getDataByPoints = () => {
        let result: PointCoordinate[] = []
        let orderPoints = this.getOrderPoints()
        result = orderPoints.map(p => {
            let loc = p.circle.getCenter()
            return [loc.lng, loc.lat]
        })
        if (result.length > 0) {
            result.push(result[0])
        }
        return result as RingCoordinate
    }

    private getOrderPoints = () => {
        let result = [] as Point[]
        let [firstPoint] = Array.from(this.pointMap.values())
        if (firstPoint) {
            result.push(firstPoint)
            let nextLine = this.lineMap.get(firstPoint.nextLineId || "")
            let point = this.pointMap.get(nextLine?.secondPointId || "")
            while (point && point.id != firstPoint.id) {
                result.push(point)
                let line = this.lineMap.get(point?.nextLineId || "")
                point = this.pointMap.get(line?.secondPointId || "")
            }
        }
        return result
    }

    private setEventForMap = () => {
        this.events?.forEach(e => {
            e.remove()
        })
        this.events = [
            this.map.addListener(map4d.MapEvent.drag, (args: any) => {
                let circle = args.circle as map4d.Circle
                let pointId = (circle?.getUserData() as CircleData)?.id
                let point = this.pointMap.get(pointId)
                if (circle == this.virtualPoint.circle) {
                    point = this.pointMap.get(this.virtualPoint.pointId)
                    point?.circle.setCenter(circle.getCenter())
                }
                if (point) {
                    let prevLine = this.lineMap.get(point.prevLineId || "")
                    if (prevLine) {
                        prevLine.polyline.setPath([prevLine.polyline.getPath()[0], circle.getCenter()])
                    }
                    let nextLine = this.lineMap.get(point.nextLineId || "")
                    if (nextLine) {
                        nextLine.polyline.setPath([circle.getCenter(), nextLine.polyline.getPath()[1]])
                    }
                }

            }, { circle: true }),


            this.map.addListener(map4d.MapEvent.hover, (args: any) => {
                let polyline = args?.polyline as map4d.Polyline
                let lineId = (polyline.getUserData() as PolylineData)?.id
                if (this.lineMap.has(lineId)) {
                    this.virtualPoint.lineId = lineId
                    // thí
                }
            }, { polyline: true }),

            this.map.addListener(map4d.MapEvent.dragStart, (args: any) => {
                let circle = args.circle as map4d.Circle
                if (circle === this.virtualPoint.circle) {
                    // _isDragVirtual.current = true
                    let line = this.lineMap.get(this.virtualPoint.lineId)
                    let a = this.pointMap.get(line?.firstPointId || "")
                    let b = this.pointMap.get(line?.secondPointId || "")

                    if (line && a && b) {
                        let loc = this.virtualPoint.circle.getCenter()
                        let point = this.createPoint([loc.lng, loc.lat])
                        let line1 = this.createLineWithPoints(a, point)
                        let line2 = this.createLineWithPoints(point, b)

                        line1.polyline.setMap(this.map || null)
                        line2.polyline.setMap(this.map || null)
                        point.circle.setDraggable(true)
                        point.circle.setMap(this.map || null)

                        line.polyline.setMap(null)
                        this.lineMap.delete(line.id)
                        this.virtualPoint.pointId = point.id
                    }
                }
                else {
                    let pointId = (circle?.getUserData() as CircleData)?.id
                    let point = this.pointMap.get(pointId)
                    if (point) {
                        this.virtualPoint.lineId = ""
                        this.virtualPoint.pointId = ""
                        // _isDragVirtual.current = false
                        this.virtualPoint.circle.setVisible(false)
                    }
                }

            }, { circle: true }),

            this.map.addListener(map4d.MapEvent.dragEnd, (args: any) => {
                let circle = args.circle as map4d.Circle
                let pointId = (circle?.getUserData() as CircleData)?.id
                let point = this.pointMap.get(pointId)
                if (circle === this.virtualPoint.circle) {
                    this.virtualPoint.lineId = ""
                    this.virtualPoint.pointId = ""
                    // _isDragVirtual.current = false
                    this.virtualPoint.circle.setVisible(false)
                    let ring = this.getDataByPoints()
                    this.polygon.setPaths([ring])
                }
                else if (point) {
                    let ring = this.getDataByPoints()
                    this.polygon.setPaths([ring])
                }
            }, { circle: true }),

            this.map.addListener(map4d.MapEvent.click, (args: any) => {

                let circle = args.circle as map4d.Circle
                let pointId = (circle?.getUserData() as CircleData)?.id
                let point = this.pointMap.get(pointId)
                if (point) {
                    if (this.pointMap.size > 3) {
                        let newLine = this.deletePoint(point)
                        if (newLine && this.map) {
                            newLine?.polyline.setMap(this.map)
                        }
                        let ring = this.getDataByPoints()
                        this.polygon.setPaths([ring])

                        // _hoverLineId.current = ""
                        // _virtualCircle.current?.setVisible(false)
                    }
                    // else {
                    //     deleteAll()
                    //     _eventForEdit?.current?.remove()
                    //     _eventForDraw.current = registerEventForDraw(this.map ?, theMapHtml)
                    //     onChange?.(null as any)
                    // }
                    // setShowTooltip(false)
                }
            }, { circle: true }),

            this.map.addListener(map4d.MapEvent.hover, (_args: any) => {
                // let circle = args.circle as map4d.Circle
                // setPositionTooltip(circle.getCenter())
                // if (circle === _virtualCircle.current) {
                //     setDescriptions([
                //         "Kéo để thay đổi"
                //     ])
                // }
                // else {
                //     setDescriptions([
                //         "Kéo để thay đổi",
                //         "Nhấp để xóa điểm"
                //     ])
                // }
                // setHeightChild(20)
                // setWidthChild(20)
                // setShowTooltip(true)
            }, { circle: true }),
            this.map.addListener(map4d.MapEvent.hover, (_args: any) => {
                // setPositionTooltip(args.location)
                // setDescriptions([
                //     "Kéo để di chuyển",
                //     "Nhấp để xóa vùng"
                // ])
                // setHeightChild(0)
                // setWidthChild(0)
                // setShowTooltip(true)
            }, { polygon: true }),
            this.map.addListener(map4d.MapEvent.dragStart, () => {
                // setShowTooltip(false)

            }, { polygon: true, circle: true }),

            this.map.addListener(map4d.MapEvent.click, (args: any) => {
                let polygon = args.polygon as map4d.Polygon
                if (this.canDelete && polygon == this.polygon) {
                    this.isDeleted = true
                    this.destroy()
                }
                // deleteAll()
                // _eventForEdit?.current?.remove()
                // _eventForDraw.current = registerEventForDraw(this.map ?, theMapHtml)
                // onChange?.(null as any)
                // setShowTooltip(false)
            }, { polygon: true }),

            this.map.addListener(map4d.MapEvent.hover, () => {
                // setShowTooltip(false)
            }, { location: true, place: true }),
            this.map.addListener(map4d.MapEvent.drag, (args: any) => {
                let polygon = args.polygon as map4d.Polygon
                if (polygon === this.polygon) {
                    let data = polygon.getPaths()[0]
                    let orderPoints = this.getOrderPoints()
                    orderPoints.forEach((p, index) => {
                        p.circle?.setCenter(data[index])
                        let line = this.lineMap.get(p.nextLineId || "")
                        if (line) {
                            line.polyline?.setPath([data[index], data[index + 1]])
                        }
                    })
                }
            }, { polygon: true }),


            this.map.addListener(map4d.MapEvent.idle, (_args: any) => {
                this.updateSizePoint()
            })
        ]
    }

    private removeAllAnnotation = () => {
        this.pointMap.forEach(p => {
            p.circle?.setMap(null)
        })
        this.lineMap.forEach(l => {
            l.polyline?.setMap(null)
        })
        this.virtualPoint.circle.setMap(null)
        this.polygon.setMap(null)
    }

    private addAllAnnotationToMap = () => {
        this.pointMap.forEach(p => {
            p.circle?.setMap(this.map)
        })
        this.lineMap.forEach(l => {
            l.polyline?.setMap(this.map)
        })
        this.virtualPoint.circle.setMap(this.map)
        this.polygon.setMap(this.map)
    }

    private setEventForMapHtml = () => {
        this.mapHtml?.removeEventListener("mousemove", this.mouseMove)
        this.mapHtml?.addEventListener("mousemove", this.mouseMove)
    }

    private deletePoint = (point: Point) => {
        let prevLine = this.lineMap.get(point?.prevLineId || "")
        let firstPoint: (Point | undefined)
        if (prevLine) {
            firstPoint = this.pointMap.get(prevLine.firstPointId || "")
            if (firstPoint) {
                delete firstPoint.nextLineId
            }
            prevLine.polyline.setMap(null)
            this.lineMap.delete(prevLine.id)
        }

        let nextLine = this.lineMap.get(point?.nextLineId || "")
        let secondPoint: (Point | undefined)
        if (nextLine) {
            secondPoint = this.pointMap.get(nextLine.secondPointId || "")
            if (secondPoint) {
                delete secondPoint.prevLineId
            }
            nextLine.polyline.setMap(null)
            this.lineMap.delete(nextLine.id)
        }
        point.circle.setMap(null)
        this.pointMap.delete(point.id)
        if (firstPoint && secondPoint) {
            let line = this.createLineWithPoints(firstPoint, secondPoint)
            return line
        }

        else return undefined
    }

    private createPointsAndLinesByData = (data: RingCoordinate) => {
        this.pointMap.forEach((point) => {
            point.circle?.setMap(null)
        })
        this.pointMap.clear()

        this.lineMap.forEach((line) => {
            line.polyline?.setMap(null)
        })
        this.lineMap.clear()
        let firstPoint = this.createPoint(data[0])

        data?.slice(1, -1).forEach((pointCoordinate, _index) => {
            let point = this.createPoint(pointCoordinate)
            this.createLineWithPoints(firstPoint, point)
            firstPoint = point
        })

        const [lastPoint] = Array.from(this.pointMap.values());
        this.createLineWithPoints(firstPoint, lastPoint)
    }

    private createLineWithPoints = (firstPoint: Point, secondPoint: Point) => {
        let line = this.createLine([firstPoint.circle.getCenter().lng, firstPoint.circle.getCenter().lat], [secondPoint.circle.getCenter().lng, secondPoint.circle.getCenter().lat])
        firstPoint.nextLineId = line.id
        secondPoint.prevLineId = line.id
        line.firstPointId = firstPoint.id
        line.secondPointId = secondPoint.id
        return line
    }

    private createPoint = (pointCoordinate: PointCoordinate) => {
        let radius = this.map.getMeterFromPx(CONFIG[this.style].circle.radius)
        let circle = new map4d.Circle({
            center: pointCoordinate,
            draggable: true,
            radius: radius,
            strokeColor: CONFIG[this.style].circle.strokeColor,
            fillColor: CONFIG[this.style].circle.color,
            strokeWidth: CONFIG[this.style].circle.strokeWidth,
            zIndex: CONFIG[this.style].circle.zIndex
        })
        let point = {
            id: createId(),
            circle: circle,
        } as Point
        circle.setUserData({ id: point.id } as CircleData)
        this.pointMap.set(point.id, point)
        return point
    }

    createLine = (firstLocation: PointCoordinate, secondLocation: PointCoordinate) => {
        let polyline = new map4d.Polyline({
            path: [firstLocation, secondLocation],
            strokeColor: CONFIG[this.style].polyline.color,
            strokeWidth: CONFIG[this.style].polyline.strokeWidth,
            zIndex: CONFIG[this.style].polyline.zIndex
        })
        let line = {
            id: createId(),
            polyline: polyline,
        } as Line
        polyline.setUserData({ id: line.id } as PolylineData)
        this.lineMap.set(line.id, line)
        return line
    }
    destroy = () => {
        this.removeAllAnnotation()
        this.mapHtml?.removeEventListener("mousemove", this.mouseMove)
        this.events?.forEach(e => {
            e.remove()
        })
    }
}