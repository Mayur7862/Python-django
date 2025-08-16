import { useState } from "react";

const ORGS = ["acme", "globex"];

export default function OrgPicker() {
  const [org, setOrg] = useState(localStorage.getItem("orgSlug") || "acme");

  const onChange = (value: string) => {
    if (value === localStorage.getItem("orgSlug")) {
      setOrg(value);
      return;
    }
    localStorage.setItem("orgSlug", value);
    setOrg(value);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={org}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
      >
        {ORGS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
