"use client";

import L from "leaflet";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { RestaurantSearchResult } from "@lib/restaurant-api";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

type MapCenter = { lat: number; lng: number };

const MAP_HEIGHT_PX = 320;

/** Leaflet needs invalidateSize after the container gets real dimensions. */
function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const fix = () => {
      map.invalidateSize();
    };
    fix();
    const t1 = window.setTimeout(fix, 0);
    const t2 = window.setTimeout(fix, 150);

    const container = map.getContainer().parentElement;
    let observer: ResizeObserver | undefined;
    if (container) {
      observer = new ResizeObserver(() => {
        fix();
      });
      observer.observe(container);
    }

    window.addEventListener("resize", fix);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer?.disconnect();
      window.removeEventListener("resize", fix);
    };
  }, [map]);

  return null;
}

function MapFlyTo({ center }: { center: MapCenter }) {
  const map = useMap();
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      map.setView([center.lat, center.lng], 14);
      return;
    }
    map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 0.6 });
  }, [center.lat, center.lng, map]);

  return null;
}

const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapSearchMapProps = {
  center: MapCenter;
  results: RestaurantSearchResult[];
  selectedId: number | null;
  onSelectId: (id: number | null) => void;
  viewDetailLabel: string;
  kmLabel: string;
  height?: string | number;
};

export function MapSearchMap({
  center,
  results,
  selectedId,
  onSelectId,
  viewDetailLabel,
  kmLabel,
  height = "100%",
}: MapSearchMapProps) {
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className="relative z-0 w-full overflow-hidden"
      style={{ height: heightStyle }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom
        style={{ height: heightStyle, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeFix />
        <MapFlyTo center={center} />
        {results.map((r) =>
          r.lat !== null && r.long !== null ? (
            <Marker
              key={r.id}
              position={[r.lat, r.long]}
              icon={selectedId === r.id ? redIcon : blueIcon}
              eventHandlers={{
                click: () => onSelectId(r.id),
              }}
            >
              <Popup>
                <div className="max-w-52">
                  <p className="font-semibold text-title">{r.name}</p>
                  <p className="mt-1 text-xs text-subtitle">{r.address}</p>
                  {r.distanceKm != null ? (
                    <p className="mt-1 text-xs text-caption">
                      {r.distanceKm.toFixed(1)} {kmLabel}
                    </p>
                  ) : null}
                  <Link
                    href={`/restaurants/${r.id}`}
                    className="mt-2 inline-flex rounded bg-primary px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {viewDetailLabel}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}
      </MapContainer>
    </div>
  );
}

