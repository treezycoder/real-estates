import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCardSkeleton } from "@/components/property/property-card-skeleton";
export default function Loading() {
  return (
    <div aria-busy="true">
      <Section className="bg-muted py-12 md:py-16">
        <Container className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </Container>
      </Section>
      <Section className="py-10 md:py-12">
        <Container className="space-y-8">
          <Skeleton className="h-44 w-full sm:h-32" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
