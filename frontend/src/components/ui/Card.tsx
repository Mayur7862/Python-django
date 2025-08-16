import cn from "../../utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("rounded-2xl border p-4 bg-white/80 dark:bg-zinc-900/60", className)} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("font-semibold", className)} />;
}
export function CardMeta({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("text-xs opacity-70", className)} />;
}
