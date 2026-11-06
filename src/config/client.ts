import type { ClientConfig } from "./types";

export const client: ClientConfig = {
  name: "Your Agency",
  logo: "/logo.svg",
  contact: {
    email: "contact@example.com",
    phone: "+237 600 000 000",
    whatsapp: "+237600000000",
    address: "Douala, Cameroon",
  },
  socials: { facebook: "", instagram: "", linkedin: "" },
  currency: { default: "XAF", supported: ["XAF", "EUR", "USD"] },
  theme: {
    primary: "#0f766e",
    primaryForeground: "#ffffff",
    accent: "#f59e0b",
    radius: "0.75rem",
  },
  map: { center: [5.95, 12.35], zoom: 6 },
  adminLocale: "en",
};
