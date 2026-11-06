import type { PropertyListItem } from "@/lib/db/queries/properties";
import { PropertyCard } from "../property-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export function PropertyGrid({ items }: { items: PropertyListItem[] }) {
  return (
    <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <StaggerItem key={p.id} className="h-full">
          <PropertyCard property={p} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
