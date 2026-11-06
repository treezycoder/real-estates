import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-foreground",
  muted: "border border-border bg-muted text-foreground",
  dark: "bg-black/70 text-white",
};

export function Badge({
  variant = "muted",
  className,
  ...props
}: React.ComponentProps<"span"> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
