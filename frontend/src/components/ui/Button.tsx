import { ButtonHTMLAttributes } from "react";
import cn from "../../utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
};

export default function Button({ className, variant="solid", size="md", ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-2xl transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
        variant === "solid" && "bg-black text-white hover:shadow",
        variant === "outline" && "border hover:bg-black/5",
        variant === "ghost" && "hover:bg-black/5",
        className
      )}
    />
  );
}
