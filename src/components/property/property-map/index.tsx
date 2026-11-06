"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("../property-map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

export function PropertyMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="h-72 overflow-hidden rounded-lg border border-border md:h-96">
      <Inner lat={lat} lng={lng} />
    </div>
  );
}
