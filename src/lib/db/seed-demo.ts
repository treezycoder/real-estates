import { and, count, eq, notInArray } from "drizzle-orm";
import { client } from "../../config/client";
import { db, TENANT_ID } from "./index";
import {
  agents,
  properties,
  propertyImages,
  propertyTranslations,
  type PropertyType,
  type ListingType,
} from "./schema";

const RATES: Record<string, number> = { XAF: 1, EUR: 655.957, USD: 600 };

type Seed = {
  slug: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  currency: string;
  rentPeriod?: "month" | "year" | "night";
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  city: string;
  region: string;
  lat: number;
  lng: number;
  features: string[];
  featured: boolean;
  en: { title: string; description: string };
  fr: { title: string; description: string };
};

const SEEDS: Seed[] = [
  {
    slug: "modern-family-house-bonanjo",
    type: "house",
    listingType: "sale",
    price: 85_000_000,
    currency: "XAF",
    bedrooms: 4,
    bathrooms: 3,
    area: 260,
    city: "Douala",
    region: "Littoral",
    lat: 4.0511,
    lng: 9.7679,
    features: ["garden", "parking", "security", "water_tank"],
    featured: true,
    en: {
      title: "Modern family house in Bonanjo",
      description:
        "Spacious four-bedroom house with a private garden, covered parking and 24/7 security, close to schools and the business district.",
    },
    fr: {
      title: "Maison familiale moderne à Bonanjo",
      description:
        "Spacieuse maison de quatre chambres avec jardin privé, parking couvert et sécurité 24h/24, proche des écoles et du quartier d'affaires.",
    },
  },
  {
    slug: "bright-apartment-bastos",
    type: "apartment",
    listingType: "rent",
    price: 250_000,
    currency: "XAF",
    rentPeriod: "month",
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    city: "Yaoundé",
    region: "Centre",
    lat: 3.848,
    lng: 11.5021,
    features: ["furnished", "balcony", "generator", "parking"],
    featured: true,
    en: {
      title: "Bright 2-bedroom apartment in Bastos",
      description:
        "Furnished apartment with a balcony, backup generator and secure parking in a quiet, well-connected neighborhood.",
    },
    fr: {
      title: "Appartement lumineux de 2 chambres à Bastos",
      description:
        "Appartement meublé avec balcon, groupe électrogène et parking sécurisé dans un quartier calme et bien desservi.",
    },
  },
  {
    slug: "seaside-plot-kribi",
    type: "land",
    listingType: "sale",
    price: 15_000_000,
    currency: "XAF",
    area: 600,
    city: "Kribi",
    region: "Sud",
    lat: 2.94,
    lng: 9.91,
    features: ["land_title", "road_access"],
    featured: false,
    en: {
      title: "600 m² plot near the beach in Kribi",
      description:
        "Flat, ready-to-build plot with a land title and direct road access, a few minutes from the coast.",
    },
    fr: {
      title: "Terrain de 600 m² près de la plage à Kribi",
      description:
        "Terrain plat, prêt à construire, avec titre foncier et accès routier direct, à quelques minutes de la côte.",
    },
  },
  {
    slug: "hillside-villa-buea",
    type: "villa",
    listingType: "sale",
    price: 180_000,
    currency: "EUR",
    bedrooms: 5,
    bathrooms: 4,
    area: 380,
    city: "Buea",
    region: "Sud-Ouest",
    lat: 4.1527,
    lng: 9.241,
    features: ["mountain_view", "garden", "garage", "security"],
    featured: true,
    en: {
      title: "Hillside villa with mountain views in Buea",
      description:
        "Elegant five-bedroom villa with panoramic views, a large garden and a double garage in a calm residential area.",
    },
    fr: {
      title: "Villa sur les hauteurs avec vue montagne à Buea",
      description:
        "Élégante villa de cinq chambres avec vue panoramique, grand jardin et garage double dans un quartier résidentiel calme.",
    },
  },
  {
    slug: "commercial-space-akwa",
    type: "commercial",
    listingType: "rent",
    price: 1_200_000,
    currency: "XAF",
    rentPeriod: "month",
    bathrooms: 2,
    area: 150,
    city: "Douala",
    region: "Littoral",
    lat: 4.0483,
    lng: 9.7043,
    features: ["street_front", "air_conditioning", "parking"],
    featured: false,
    en: {
      title: "Street-front commercial space in Akwa",
      description:
        "150 m² air-conditioned space on a busy street, ideal for a showroom, bank agency or office.",
    },
    fr: {
      title: "Local commercial en bord de rue à Akwa",
      description:
        "Local climatisé de 150 m² sur une rue animée, idéal pour un showroom, une agence bancaire ou des bureaux.",
    },
  },
];

async function assertSafe() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo data with NODE_ENV=production");
  }
  if (client.currency.default !== "XAF") {
    throw new Error("The demo data assumes XAF as the default currency");
  }
  if (process.argv.includes("--force")) return;

  // Anything that isn't one of the demo rows counts as real data
  const [props] = await db
    .select({ n: count() })
    .from(properties)
    .where(
      and(
        eq(properties.tenantId, TENANT_ID),
        notInArray(
          properties.slug,
          SEEDS.map((s) => s.slug),
        ),
      ),
    );
  const [people] = await db
    .select({ n: count() })
    .from(agents)
    .where(
      and(
        eq(agents.tenantId, TENANT_ID),
        notInArray(agents.name, ["Agent One", "Agent Two"]),
      ),
    );

  if (props.n > 0 || people.n > 0) {
    throw new Error(
      `This database has ${props.n} real propert(ies) and ${people.n} real agent(s). ` +
        `Demo seeding deletes this tenant's properties and agents, so it was cancelled. ` +
        `Use --force only on a throwaway database.`,
    );
  }
}

async function main() {
  await assertSafe();
  console.log("Seeding demo data...");

  // Idempotent: wipe this tenant's sample data first (translations/images cascade)
  await db.delete(properties).where(eq(properties.tenantId, TENANT_ID));
  await db.delete(agents).where(eq(agents.tenantId, TENANT_ID));

  // Agents
  const insertedAgents = await db
    .insert(agents)
    .values([
      {
        tenantId: TENANT_ID,
        name: "Agent One",
        phone: "+237 600 000 001",
        whatsapp: "+237600000001",
        email: "agent1@example.com",
        bio: {
          en: "Senior advisor for residential sales.",
          fr: "Conseiller senior en ventes résidentielles.",
        },
      },
      {
        tenantId: TENANT_ID,
        name: "Agent Two",
        phone: "+237 600 000 002",
        whatsapp: "+237600000002",
        email: "agent2@example.com",
        bio: {
          en: "Specialist in rentals and commercial space.",
          fr: "Spécialiste de la location et des locaux commerciaux.",
        },
      },
    ])
    .returning({ id: agents.id });

  for (const [i, s] of SEEDS.entries()) {
    const priceBase = (s.price * RATES[s.currency]) / RATES.XAF;

    const [p] = await db
      .insert(properties)
      .values({
        tenantId: TENANT_ID,
        slug: s.slug,
        type: s.type,
        listingType: s.listingType,
        price: String(s.price),
        currency: s.currency,
        priceBase: String(priceBase),
        rentPeriod: s.rentPeriod,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        area: s.area != null ? String(s.area) : undefined,
        city: s.city,
        region: s.region,
        lat: s.lat,
        lng: s.lng,
        features: s.features,
        featured: s.featured,
        agentId: insertedAgents[i % insertedAgents.length].id,
      })
      .returning({ id: properties.id });

    await db.insert(propertyTranslations).values([
      { propertyId: p.id, locale: "en", ...s.en },
      { propertyId: p.id, locale: "fr", ...s.fr },
    ]);

    await db.insert(propertyImages).values(
      [0, 1, 2].map((n) => ({
        propertyId: p.id,
        url: `https://picsum.photos/seed/${s.slug}-${n}/1200/800`,
        fileKey: `seed-${s.slug}-${n}`,
        position: n,
        isCover: n === 0,
      })),
    );
  }

  console.log(
    `Done: ${SEEDS.length} properties, ${insertedAgents.length} agents.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
