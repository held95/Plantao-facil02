// Ambient module declaration for react-leaflet.
// No top-level imports — this must remain a script file so the
// declaration is visible globally across the TypeScript compilation.

declare module 'react-leaflet' {
  import type { CSSProperties, ReactNode, ReactElement } from 'react';
  import type { Map, LatLngExpression, Icon, DivIcon } from 'leaflet';

  export interface MapContainerProps {
    center: LatLngExpression;
    zoom: number;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
    [key: string]: unknown;
  }

  export interface MarkerProps {
    position: LatLngExpression;
    icon?: Icon | DivIcon;
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface PopupProps {
    minWidth?: number;
    children?: ReactNode;
    [key: string]: unknown;
  }

  export function MapContainer(props: MapContainerProps): ReactElement;
  export function TileLayer(props: TileLayerProps): ReactElement | null;
  export function Marker(props: MarkerProps): ReactElement | null;
  export function Popup(props: PopupProps): ReactElement | null;
  export function useMap(): Map;
}
