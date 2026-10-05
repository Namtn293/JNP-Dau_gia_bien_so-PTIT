// declare module "*.svg" {
//   const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
//   export default content;
// }
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare namespace map4d {
  interface MapOptions {
    center?: number[];
    zoom?: number;
    controls?: boolean;
    keyboardShortcuts?: boolean;
    [key: string]: any;
  }

  class Map {
    constructor(container: HTMLElement, options?: MapOptions);
    [key: string]: any;
  }

  enum MapType {
    roadmap = 'roadmap',
    satellite = 'satellite',
    raster = 'raster',
    map3d = 'map3d',
  }

  const vn: any;
}
