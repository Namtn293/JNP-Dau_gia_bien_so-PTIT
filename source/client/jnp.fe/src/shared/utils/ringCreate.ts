import type { PointCoordinate, PolygonCoordinate, RingCoordinate } from "../types/geometry.type"

export type Options = {
    map: map4d.Map,
    mapHtml?: HTMLDivElement,
    style?: Style
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

/*
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
*/

export class RingCreate {
    private map: map4d.Map
    private mapHtml?: HTMLDivElement
    private style: Style = "default"
    private readonly polygon = new map4d.Polygon({
        paths: [[[0, 0], [1, 1], [2, 2]]] as any,
        fillColor: CONFIG[this.style].polygon.color,
        fillOpacity: CONFIG[this.style].polygon.opacity,
        clickable: false,
        strokeColor: CONFIG[this.style].polygon.strokeColor,
        zIndex: CONFIG[this.style].polygon.zIndex,
        strokeWidth: CONFIG[this.style].polygon.strokeWidth,
        visible: false,
    })

    private polygons: map4d.Polygon[] = []
    private events: map4d.MapsEventListener[] = []
    private circles: map4d.Circle[] = []
    private polyline: map4d.Polyline = new map4d.Polyline({
        path: [[0, 0], [0, 0]],
        strokeColor: CONFIG[this.style].polyline.color,
        strokeWidth: CONFIG[this.style].polyline.strokeWidth,
        zIndex: CONFIG[this.style].polyline.zIndex,
        visible: false,
        clickable: false
    })

    public onDone?: () => void

    constructor(options: Options) {
        const { map, mapHtml, style } = options
        this.style = (style || "default")
        this.map = map
        this.mapHtml = mapHtml
        this.updateSizePoint()

        this.polygon.setStrokeColor(CONFIG[this.style].polygon.strokeColor)
        this.polygon.setFillColor(CONFIG[this.style].polygon.color)

        this.polyline.setStrokeColor(CONFIG[this.style].polyline.color)

    }

    readonly setMapHtml = (mapHtml: HTMLDivElement)=>{
        this.mapHtml = mapHtml
        this.setEventForMapHtml()
    }

    readonly setMap = (map: map4d.Map)=>{
        this.map = map
        this.setEventForMap()
    }

    getData = () => {
        let result = this.polygons.map(p => {
            let path = p.getPaths()[0]
            return path.map(p => {
                return [p.lng, p.lat]
            })
        }) as RingCoordinate[]
        return result
    }

    private updateSizePoint = () => {
        let r = this.map.getMeterFromPx(CONFIG[this.style].circle.radius) || 0
        this.circles.forEach(c => {
            c.setRadius(r)
        })
    }

    private readonly mouseMove = (e: MouseEvent) => {
        let { left = 0, top = 0 } = this.mapHtml?.getBoundingClientRect() || {}
        let x = e.clientX - left
        let y = e.clientY - top
        let projection = new map4d.Projection(this.map)
        let point = projection.fromScreenToLatLng({ x, y })
        if (this.circles.length == 1) {
            let path = [this.circles[0].getCenter(), point]
            this.polyline.setPath(path)
        }
        else if (this.circles.length >= 2) {
            let paths = this.circles.map(c => {
                return c.getCenter()
            })
            paths.push(point)
            paths.push(paths[0])
            this.polygon.setPaths([paths])
        }
    }


    private createPolygon = (coord: PolygonCoordinate) => {
        let polygon = new map4d.Polygon({
            paths: coord,
            fillColor: CONFIG[this.style].polygon.color,
            fillOpacity: CONFIG[this.style].polygon.opacity,
            clickable: false,
            strokeColor: CONFIG[this.style].polygon.strokeColor,
            zIndex: CONFIG[this.style].polygon.zIndex,
            strokeWidth: CONFIG[this.style].polygon.strokeWidth
        })
        this.polygons.push(polygon)
        return polygon
    }


    startCreate = () => {
        this.removeAllAnnotationFromMap()
        this.addAllAnnotationToMap()
        this.setEventForMapHtml()
        this.setEventForMap()
    }

    private addAllAnnotationToMap = () => {
        this.circles.forEach(c => c.setMap(this.map))
        this.polygons.forEach(p => p.setMap(this.map))
        this.polygon.setMap(this.map)
        this.polyline.setMap(this.map)
    }

    private removeAllAnnotationFromMap = () => {
        this.circles.forEach(c => {
            c?.setMap(null)
        })
        this.polygons.forEach(p => {
            p?.setMap(null)
        })
        this.polygon.setMap(null)
    }

    private setEventForMap = () => {
        this.events?.forEach(e => {
            e.remove()
        })
        this.events = [
            this.map?.addListener(map4d.MapEvent.click, (args: any) => {
                let loc = args.location as map4d.LatLng
                let circle = this.createCircle([loc.lng, loc.lat])
                circle.setMap(this.map)
                if (this.circles.length == 1) {
                    this.polyline.setVisible(true)
                }
                else {
                    this.polyline.setVisible(false)
                    this.polygon.setVisible(true)
                }
                // let firstNode = _nodes.current[_nodes.current.length - 1]
                // let node = insertNodeAfterIndex(location, map, _nodes.current.length - 1)
                // firstNode && createLine(firstNode, node, map)
            }, { location: true, place: true, polyline: true, polygon: true }),

            this.map?.addListener(map4d.MapEvent.click, (args: any) => {
                let circle = args.circle as map4d.Circle
                if (this.circles.includes(circle)) {
                    let length = this.circles.length
                    if (length >= 3) {
                        let paths = this.circles.map(n => {
                            let loc = n.getCenter()
                            return [loc.lng, loc.lat]
                        }) as RingCoordinate
                        paths.push(paths[0])
                        let polygon = this.createPolygon([paths])
                        polygon.setMap(this.map)
                        this.onDone?.()
                    }
                    this.circles.forEach(c => c.setMap(null))
                    this.circles = []
                    this.polygon.setVisible(false)
                    this.polyline.setVisible(false)
                }

                // setShowTooltip(false)

            }, { circle: true }),

            this.map?.addListener(map4d.MapEvent.hover, (_args: any) => {
                // if (!_disable.current) {
                //     setPositionTooltip(args.location)
                //     let des = [
                //         "Nhấp để thêm điểm",

                //     ]
                //     if (_nodes.current?.length >= 2) {
                //         des.push("Nhấp double để thêm điểm và kết thúc")
                //     }
                //     setDescriptions(des)
                //     setWidthChild(0)
                //     setHeightChild(0)
                //     setShowTooltip(true)
                // }
            }, { location: true }),

            this.map?.addListener(map4d.MapEvent.hover, (_args: any) => {
                // if (!_disable.current) {
                //     let circle = args.circle as map4d.Circle
                //     setPositionTooltip(circle.getCenter())
                //     let des = [
                //         "Nhấp để kết thúc",

                //     ]
                //     setDescriptions(des)
                //     setWidthChild(20)
                //     setHeightChild(20)
                //     setShowTooltip(true)
                // }
            }, { circle: true }),
            this.map.addListener(map4d.MapEvent.idle, (_args: any) => {
                this.updateSizePoint()
            })
        ]
    }

    private setEventForMapHtml = () => {
        this.mapHtml?.removeEventListener("mousemove", this.mouseMove)
        this.mapHtml?.addEventListener("mousemove", this.mouseMove)
    }
    private createCircle = (pointCoordinate: PointCoordinate) => {
        let radius = this.map.getMeterFromPx(CONFIG[this.style].circle.radius)
        let circle = new map4d.Circle({
            center: pointCoordinate,
            radius: radius,
            strokeColor: CONFIG[this.style].circle.strokeColor,
            fillColor: CONFIG[this.style].circle.color,
            strokeWidth: CONFIG[this.style].circle.strokeWidth,
            zIndex: CONFIG[this.style].circle.zIndex
        })
        this.circles.push(circle)
        return circle
    }

    createLine = (firstLocation: PointCoordinate, secondLocation: PointCoordinate) => {
        let polyline = new map4d.Polyline({
            path: [firstLocation, secondLocation],
            strokeColor: CONFIG[this.style].polyline.color,
            strokeWidth: CONFIG[this.style].polyline.strokeWidth,
            zIndex: CONFIG[this.style].polyline.zIndex
        })
        this
        return polyline
    }
    destroy = () => {
        this.circles.forEach(c => c.setMap(null))
        this.polygons.forEach(p => p.setMap(null))
        this.polyline.setMap(null)
        this.polygon.setMap(null)
        this.mapHtml?.removeEventListener("mousemove", this.mouseMove)
        this.events?.forEach(e => {
            e.remove()
        })
    }
}
