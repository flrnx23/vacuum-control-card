import "./editor";
import { VacuumCard } from "./vacuum-card";
import type { WindowWithCustomCards } from "./types";

if (!customElements.get("vacuum-control-card")) {
  customElements.define("vacuum-control-card", VacuumCard);
}

const registry = window as unknown as WindowWithCustomCards;
registry.customCards = registry.customCards ?? [];

if (!registry.customCards.some((card) => card.type === "vacuum-control-card")) {
  registry.customCards.push({
    type: "vacuum-control-card",
    name: "Vacuum Control Card",
    description: "Safe and elegant controls for vacuum and mop robots with optional dock status.",
    preview: true,
    getEntitySuggestion: (_hass, entityId) => {
      if (!entityId.startsWith("vacuum.")) return null;
      return {
        config: {
          type: "custom:vacuum-control-card",
          entity: entityId,
        },
      };
    },
  });
}

export { VacuumCard } from "./vacuum-card";
export { VacuumCardEditor } from "./editor";
export { normalizeConfig } from "./config";
export { buildViewModel } from "./state";
export { computeLayoutProfile } from "./layout";
export type * from "./types";
