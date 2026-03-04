import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
