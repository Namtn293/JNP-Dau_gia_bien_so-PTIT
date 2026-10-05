import type { PointCoordinate, PolygonCoordinate, RingCoordinate } from "../types/geometry.type"

export type Options = {
    map: map4d.Map,
    mapHtml?: HTMLDivElement,
    style?: Style
}


type Style = "default" | "dark"

const CONFIG = {
    polygon: {
        color: "#3F90E4",
        strokeColor: "#3F90E4",
        strokeWidth: 3,
        opacity: 0.1,
        zIndex: 3
    },


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
*/

const Status = {
    start: 0,
    has1Point: 1,
    none: 2
}

export class RectangleCreate {
    private map: map4d.Map
    private mapHtml?: HTMLDivElement
    private readonly polygon = new map4d.Polygon({
        paths: [[[0, 0], [1, 1], [2, 2]]] as any,
        fillColor: CONFIG.polygon.color,
        fillOpacity: CONFIG.polygon.opacity,
        clickable: false,
        strokeColor: CONFIG.polygon.strokeColor,
        zIndex: CONFIG.polygon.zIndex,
        strokeWidth: CONFIG.polygon.strokeWidth,
        visible: true,
    })
    private events: map4d.MapsEventListener[] = []

    private startLoc: PointCoordinate = [0, 0]
    private status = Status.none

    public onDone?: (polygonCoordinate: PolygonCoordinate) => void

    constructor(options: Options) {
        const { map, mapHtml } = options
        this.map = map
        this.mapHtml = mapHtml
        this.setEventForMapHtml()
        this.setEventForMap()
    }

    readonly setMapHtml = (mapHtml: HTMLDivElement) => {
        this.mapHtml = mapHtml
        this.setEventForMapHtml()
    }

    readonly setMap = (map: map4d.Map) => {
        this.map = map
        this.setEventForMap()
    }

    private readonly clickAction = {
        [Status.start]: (point: PointCoordinate) => {
            this.startLoc = point
            this.status = Status.has1Point
        },
        [Status.has1Point]: (point2: PointCoordinate) => {
            let point1 = this.startLoc
            let ring = [
                point1,
                [point1[0], point2[1]],
                point2,
                [point2[0], point1[1]]
            ] as RingCoordinate
            ring[4] = ring[0]
            this.onDone?.([ring] as PolygonCoordinate)
            this.polygon.setMap(null)
            this.status = Status.none
        }
    }


    private readonly mouseMove = (e: MouseEvent) => {
        if (this.status == Status.has1Point) {
            let projection = new map4d.Projection(this.map)

            let { left = 0, top = 0 } = this.mapHtml?.getBoundingClientRect() || {}
            let x2 = e.clientX - left
            let y2 = e.clientY - top

            let p = projection.fromScreenToLatLng({ x: x2, y: y2 })
            let point1 = this.startLoc
            let point2 = [p.lng, p.lat]

            let ring = [
                point1,
                [point1[0], point2[1]],
                point2,
                [point2[0], point1[1]]
            ] as PointCoordinate[]
            ring[4] = ring[0]
            this.polygon.setPaths([ring])
            this.map && this.polygon.setMap(this.map)
        }

    }


    startCreate = () => {
        this.status = Status.start
        this.polygon.setMap(this.map)
    }


    private setEventForMap = () => {
        this.events?.forEach(e => {
            e.remove()
        })
        this.events = [
            this.map?.addListener(map4d.MapEvent.click, (args: any) => {
                let loc = args.location as map4d.LatLng
                this.clickAction[this.status as keyof typeof this.clickAction]?.([loc.lng, loc.lat])

            }, { location: true, place: true, polyline: true, polygon: true }),
        ]
    }

    private setEventForMapHtml = () => {
        this.mapHtml?.removeEventListener("mousemove", this.mouseMove)
        this.mapHtml?.addEventListener("mousemove", this.mouseMove)
    }

    destroy = () => {
        this.status = Status.none
        this.polygon.setMap(null)
        this.mapHtml?.removeEventListener("mousemove", this.mouseMove)
        this.events?.forEach(e => {
            e.remove()
        })
    }
}