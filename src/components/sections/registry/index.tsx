import type { ReactNode } from "react";
import { Hero } from "../hero";
import { FeaturedListings } from "../featured-listings";

export type SectionComponent = (props: {
  locale: string;
}) => ReactNode | Promise<ReactNode>;

export const sectionRegistry: Record<string, SectionComponent> = {
  hero: Hero,
  featured: FeaturedListings,
};
