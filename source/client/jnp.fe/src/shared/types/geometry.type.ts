export type PointCoordinate = [number, number]
export type RingCoordinate = [PointCoordinate, PointCoordinate, PointCoordinate, PointCoordinate, ...PointCoordinate[]]
export type PolygonCoordinate = [RingCoordinate, ...RingCoordinate[]]
export type LineCoordinate = [PointCoordinate, PointCoordinate, ...PointCoordinate[]]

export const GeometryType = {
    point: "Point",
    multiPoint: "MultiPoint",
    line: "LineString",
    multiLine: "MultiLineString",
    polygon: "Polygon",
    multiPolygon: "MultiPolygon"
} as const

export const RenderType = {
    point: "point",
    line: "line",
    polygon: "polygon",
} as const

export type Geometry =
    {
        type: "Point",
        coordinates: PointCoordinate
    }
    |
    {
        type: "MultiPoint",
        coordinates: PointCoordinate[]
    }
    |
    {
        type: "LineString",
        coordinates: LineCoordinate
    }
    |
    {
        type: "MultiLineString",
        coordinates: LineCoordinate[]
    }
    |
    {
        type: "Polygon",
        coordinates: PolygonCoordinate
    }
    |
    {
        type: "MultiPolygon",
        coordinates: PolygonCoordinate[]
    }