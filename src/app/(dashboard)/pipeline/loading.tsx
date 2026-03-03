import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-[280px] flex-shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
