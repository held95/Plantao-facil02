// Ambient module declarations for leaflet and leaflet/dist/leaflet.css.
// No top-level imports — must remain a script file so declarations are globally visible.

declare module 'leaflet' {
  export type LatLngTuple = [number, number];

  export type LatLngExpression =
    | LatLngTuple
    | { lat: number; lng: number; alt?: number };

  export interface DivIconOptions {
    html?: string | HTMLElement | false;
    className?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
    tooltipAnchor?: [number, number];
    bgPos?: [number, number];
  }

  export class DivIcon {
    constructor(options?: DivIconOptions);
  }

  export interface IconOptions {
    iconUrl: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
  }

  export class Icon {
    constructor(options: IconOptions);
  }

  export class LatLngBounds {
    constructor(corner1: LatLngExpression, corner2?: LatLngExpression);
  }

  export type LatLngBoundsExpression = LatLngBounds | LatLngTuple[];

  export interface FitBoundsOptions {
    padding?: [number, number];
    paddingTopLeft?: [number, number];
    paddingBottomRight?: [number, number];
    maxZoom?: number;
    animate?: boolean;
  }

  export class Map {
    fitBounds(bounds: LatLngBoundsExpression, options?: FitBoundsOptions): this;
    setView(center: LatLngExpression, zoom?: number): this;
    remove(): this;
  }

  export function divIcon(options?: DivIconOptions): DivIcon;
  export function latLngBounds(latlngs: LatLngExpression[]): LatLngBounds;
  export function map(element: HTMLElement | string, options?: Record<string, unknown>): Map;

  const L: {
    DivIcon: typeof DivIcon;
    Icon: typeof Icon;
    LatLngBounds: typeof LatLngBounds;
    Map: typeof Map;
    divIcon: typeof divIcon;
    latLngBounds: typeof latLngBounds;
    map: typeof map;
  };

  export default L;
}

declare module 'leaflet/dist/leaflet.css' {
  // CSS side-effect import — no exports
}
