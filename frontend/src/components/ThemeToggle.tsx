import Button from "./ui/Button";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <Button variant="outline" size="sm" onClick={() => setDark(v => !v)}>
      {dark ? "Light" : "Dark"}
    </Button>
  );
}
