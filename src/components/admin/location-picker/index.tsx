"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("../location-picker-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

export function LocationPicker(props: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <div className="h-72 overflow-hidden rounded-lg border border-border">
      <Inner {...props} />
    </div>
  );
}
