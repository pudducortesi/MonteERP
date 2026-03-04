import { Skeleton } from "@/components/ui/skeleton";

export default function FeesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}
