import Container from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Section className="py-8 md:py-12">
      <Container aria-busy="true">
        <Skeleton className="mb-6 h-5 w-40" />
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </Container>
    </Section>
  );
}
