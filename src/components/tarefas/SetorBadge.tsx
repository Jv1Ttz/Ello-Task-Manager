import { SETORES } from "@/constants/setores";
import type { Setor } from "@/types";

export function SetorBadge({ setor }: { setor: Setor }) {
  const s = SETORES.find((x) => x.slug === setor);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s?.cor_hex + "22", color: s?.cor_hex }}
    >
      {s?.nome ?? setor}
    </span>
  );
}
