import cn from "../../utils/cn";

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-black/10 dark:bg-white/10", className)} />;
}
