"use client"
import { MAP_OPTION } from "@/configs/map-config"
import { useCallback, useEffect, useMemo, useState } from "react"
import { MFMap } from "react-map4d-map"


// TODO: export type MapViewProps = MapProps & {}
export type MapViewProps = {
  options?: map4d.MapOptions
  mapid?: string
  onMapReady?: (map: map4d.Map) => void
  onClickLocation?: (args: any) => void
  onRightClickLocation?: (args: any) => void
  onCameraChanging?: (args: any) => void
  children?: any;
  innerRef?: (ref: HTMLDivElement) => void
  showMapType?: boolean,
  showMapControl?: boolean
  showTimeline?: boolean,
  showSourceControl?: boolean,
  showPrintMap?: boolean,
  showCaptureMap?: boolean,
  showRatio?: boolean,
  gesture?: boolean,
  showDirection?: boolean,
  showRightClickMenu?: boolean,
  onChangeRightClickAction?: (action: string) => void
}

export default function MapView(props: MapViewProps) {
  const { gesture = true } = props

  const [map, setMap] = useState<map4d.Map | null>(null)

  const sdkDomain = import.meta.env.VITE_SDK_DOMAIN
  const mapVersion = import.meta.env.VITE_MAP_VERSION
  const mapKey = import.meta.env.VITE_MAP_KEY
  const mapEnvironment = import.meta.env.VITE_MAP_ENVIRONMENT

  const onMapReady = (map: map4d.Map) => {
    map.setBuildingsEnabled(false)
    setMap(map)
    map.setAllGesturesEnabled(gesture)
    props.onMapReady && props.onMapReady(map)
  }

  useEffect(() => {
    return () => {
      map?.destroy()
    }
  }, [map])

  const options = useMemo(() => {
    let result = {
      center: MAP_OPTION.center,
      geolocate: true,
      zoom: MAP_OPTION.zoom,
      controls: MAP_OPTION.controls,
      keyboardShortcuts: MAP_OPTION.keyboardShortcuts,
    } as map4d.MapOptions
    // if (typeof window !== "undefined") {
    //   // browser code
    //   let cam = new URLSearchParams(window.location.search).get("c")
    //   if (cam) {
    //     let camera = decodeCamera(cam)
    //     result = Object.assign(result, {
    //       bearing: camera.bearing,
    //       center: [camera.lng, camera.lat],
    //       tilt: camera.tilt,
    //       zoom: camera.zoom
    //     })
    //   }
    // }

    return result
  }, [])


  const onRef = useCallback((ref: HTMLDivElement | null) => {
    if (!ref) return
    props?.innerRef?.(ref)
  }, [props.innerRef])


  return (
    <>
      <div ref={onRef} className="w-full h-full relative overflow-hidden">
        <MFMap
          {...props}
          sdkDomain={sdkDomain}
          options={options}
          onMapReady={onMapReady}
          version={mapVersion}
          accessKey={mapKey || ""}
          environment={mapEnvironment as any}
        >
        </MFMap>
      </div >
    </>
  )
}
