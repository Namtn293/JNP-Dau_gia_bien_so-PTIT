import { isGeometryObject } from "geojson-validation";
import * as turf from '@turf/turf'
import { GeometryType, type Geometry, type PointCoordinate } from "../types/geometry.type";

export class GeometryTool {
    static getPoints = (geometry: Geometry) => {
        let points = [] as PointCoordinate[]
        switch (geometry?.type) {
            case GeometryType.polygon:
                geometry.coordinates.forEach(ring => {
                    ring?.forEach(point => {
                        points.push(point)
                    })
                })
                break;
            case GeometryType.multiPolygon:
                geometry.coordinates?.forEach(polygon => {
                    polygon.forEach(ring => {
                        ring?.forEach(point => {
                            points.push(point)
                        })
                    })
                })
                break;
            case GeometryType.line:
                points = geometry.coordinates
                break;
            case GeometryType.multiLine:
                geometry.coordinates.forEach(line => {
                    line?.forEach(point => {
                        points.push(point)
                    })
                })
                break;
            case GeometryType.multiPoint:
                geometry.coordinates.forEach(point => {
                    if (point?.length > 1) {
                        points.push(point)
                    }
                })
                break;
            case GeometryType.point:
                points = geometry.coordinates.length > 1 ? [geometry.coordinates] : [[0, 0]] as PointCoordinate[]
                break;
            default:
                break;
        }
        return points
    }
     static isValid = (geometry: any) => {
        let check = isGeometryObject(geometry)
        if (check) {
            turf.coordEach(geometry, (coord) => {
                if (coord.length !== 2) {
                    check = false
                }
            });
        }
        return check
    }
}