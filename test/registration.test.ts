import { describe, expect, it } from "vitest";

import "../src/index";
import { VacuumCard } from "../src/vacuum-card";
import { VacuumCardEditor } from "../src/editor";
import type { WindowWithCustomCards } from "../src/types";

describe("public card registration", () => {
  it("registers only the Vacuum Control Card custom elements", () => {
    expect(customElements.get("vacuum-control-card")).toBe(VacuumCard);
    expect(customElements.get("vacuum-control-card-editor")).toBe(VacuumCardEditor);
    expect(customElements.get("vacuum-card")).toBeUndefined();
    expect(customElements.get("vacuum-card-editor")).toBeUndefined();
  });

  it("publishes the new Home Assistant card metadata and configuration type", () => {
    const registry = (window as unknown as WindowWithCustomCards).customCards ?? [];
    const entry = registry.find((card) => card.type === "vacuum-control-card");

    expect(entry).toMatchObject({
      type: "vacuum-control-card",
      name: "Vacuum Control Card",
      preview: true,
    });
    expect(registry.some((card) => card.type === "vacuum-card")).toBe(false);
    expect(entry?.getEntitySuggestion?.({ states: {}, callService: async () => undefined }, "vacuum.my_robot"))
      .toEqual({
        config: {
          type: "custom:vacuum-control-card",
          entity: "vacuum.my_robot",
        },
      });
  });

  it("returns the new editor element and stub configuration", () => {
    expect(VacuumCard.getConfigElement().tagName.toLowerCase()).toBe(
      "vacuum-control-card-editor",
    );
    expect(VacuumCard.getStubConfig()).toEqual({
      type: "custom:vacuum-control-card",
      entity: "vacuum.my_robot",
    });
  });
});
