import { useEffect, useState } from "react";

export default function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  const Toast = msg ? (
    <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-xl shadow">
      {msg}
    </div>
  ) : null;

  return { setToast: setMsg, Toast };
}
