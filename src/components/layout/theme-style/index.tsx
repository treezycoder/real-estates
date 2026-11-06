import { siteConfig } from "@/config/site.config";

export function ThemeStyle() {
  const t = siteConfig.theme;
  const css = `:root{--primary:${t.primary};--primary-foreground:${t.primaryForeground};--accent:${t.accent};--radius:${t.radius};}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
