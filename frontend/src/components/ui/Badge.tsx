import cn from "../../utils/cn";

export default function Badge({ children, color="slate" }: { children: React.ReactNode; color?: "slate"|"green"|"amber"|"blue" }) {
  const colors: Record<string,string> = {
    slate: "border-slate-300 text-slate-700",
    green: "border-green-300 text-green-700",
    amber: "border-amber-300 text-amber-700",
    blue: "border-blue-300 text-blue-700",
  };
  return (
    <span className={cn("text-xs px-2 py-1 border rounded-xl", colors[color])}>
      {children}
    </span>
  );
}
