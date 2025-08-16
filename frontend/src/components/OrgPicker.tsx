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
    <select value={org} onChange={(e) => onChange(e.target.value)}>
      {ORGS.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
