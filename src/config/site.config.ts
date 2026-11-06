import { client } from "./client";

export const siteConfig = {
  ...client,
  nav: [
    { key: "home", href: "/" },
    { key: "properties", href: "/properties" },
    { key: "about", href: "/about" },
    { key: "contact", href: "/contact" },
  ],
  homeSections: ["hero", "featured"],
};
