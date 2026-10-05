export class MapTool {
    static fitBound = (map: map4d.Map, points: map4d.ILatLng[], options?: { animationOptions?: map4d.AnimationOptions, padding?: map4d.PaddingOptions }) => {
        if (points.length < 2) return
        let bound = new map4d.LatLngBounds()
        points.forEach(p => {
            bound.extend(p)
        })
        let camera = map.getCameraWithBounds(bound, options?.padding)
        map.moveCamera(camera, options?.animationOptions)
    }
}