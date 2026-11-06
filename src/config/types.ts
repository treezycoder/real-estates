export type ClientConfig = {
  name: string;
  logo: string;
  contact: { email: string; phone: string; whatsapp: string; address: string };
  socials: { facebook: string; instagram: string; linkedin: string };
  currency: { default: string; supported: string[] };
  theme: {
    primary: string;
    primaryForeground: string;
    accent: string;
    radius: string;
  };
  map: { center: [number, number]; zoom: number };
  adminLocale: "en" | "fr";
};
