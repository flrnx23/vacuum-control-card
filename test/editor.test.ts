import { afterEach, describe, expect, it, vi } from "vitest";

import { VacuumCardEditor } from "../src/editor";
import type { HassEntity, HomeAssistant, VacuumCardConfig } from "../src/types";

const VACUUM = "vacuum.my_robot";
const PROGRAM = "button.my_robot_program_1";

type EntityPicker = HTMLElement & {
  includeDomains: string[];
  label: string;
  value: string;
};

function entity(entityId: string, state: string, friendlyName: string): HassEntity {
  return {
    entity_id: entityId,
    state,
    attributes: { friendly_name: friendlyName },
    last_changed: "2026-08-10T18:00:00.000Z",
    last_updated: "2026-08-10T18:00:00.000Z",
  };
}

function makeHass(): HomeAssistant {
  return {
    language: "de",
    locale: { language: "de-DE" },
    states: {
      [VACUUM]: entity(VACUUM, "idle", "Mein Saugroboter"),
      [PROGRAM]: entity(PROGRAM, "unknown", "Programm 1"),
    },
    callService: vi.fn(async () => undefined),
  };
}

function config(extra: Partial<VacuumCardConfig> = {}): VacuumCardConfig {
  return {
    type: "custom:vacuum-control-card",
    entity: VACUUM,
    ...extra,
  };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

async function renderEditor(editorConfig: VacuumCardConfig) {
  const editor = new VacuumCardEditor();
  editor.hass = makeHass();
  editor.setConfig(editorConfig);
  document.body.append(editor);
  await editor.updateComplete;
  return editor;
}

function pickerFor(editor: VacuumCardEditor, domain: string): EntityPicker {
  const picker = [...(editor.shadowRoot?.querySelectorAll<EntityPicker>("ha-entity-picker") ?? [])]
    .find((candidate) => candidate.includeDomains?.includes(domain));
  if (!picker) throw new Error(`No entity picker found for domain ${domain}`);
  return picker;
}

function pickerWithLabel(editor: VacuumCardEditor, label: string): EntityPicker {
  const picker = [...(editor.shadowRoot?.querySelectorAll<EntityPicker>("ha-entity-picker") ?? [])]
    .find((candidate) => candidate.label === label);
  if (!picker) throw new Error(`No entity picker found with label ${label}`);
  return picker;
}

function checkbox(editor: VacuumCardEditor, id: string): HTMLInputElement {
  const input = editor.shadowRoot?.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) throw new Error(`No checkbox found with id ${id}`);
  return input;
}

async function setCheckbox(
  editor: VacuumCardEditor,
  id: string,
  checked: boolean,
): Promise<void> {
  const input = checkbox(editor, id);
  input.checked = checked;
  input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  await editor.updateComplete;
}

async function chooseEntity(
  editor: VacuumCardEditor,
  domain: string,
  entityId: string,
): Promise<void> {
  pickerFor(editor, domain).dispatchEvent(new CustomEvent("value-changed", {
    detail: { value: entityId },
    bubbles: true,
    composed: true,
  }));
  await editor.updateComplete;
}

function nextConfigChanged(editor: VacuumCardEditor): Promise<CustomEvent<{ config: VacuumCardConfig }>> {
  return new Promise((resolve) => {
    editor.addEventListener("config-changed", (event) => {
      resolve(event as CustomEvent<{ config: VacuumCardConfig }>);
    }, { once: true });
  });
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("VacuumCardEditor", () => {
  it("does not retain or mutate the supplied configuration", async () => {
    const supplied = deepFreeze(config({
      name: "Original",
      entities: { status: "sensor.my_robot_status" },
      programs: {
        guard: "hold_confirm" as never,
        items: [{ entity: PROGRAM, guard: "hold_confirm" as never, kind: "combo" }],
      },
    }));
    const before = JSON.parse(JSON.stringify(supplied));
    const editor = await renderEditor(supplied);

    const changed = nextConfigChanged(editor);
    await chooseEntity(editor, "vacuum", "vacuum.andere_auswahl");

    expect((await changed).detail.config.entity).toBe("vacuum.andere_auswahl");
    expect(supplied).toEqual(before);
  });

  it("writes a vacuum selected through the vacuum entity picker", async () => {
    const editor = await renderEditor(config({ entity: "" }));
    const changed = nextConfigChanged(editor);

    await chooseEntity(editor, "vacuum", VACUUM);

    const event = await changed;
    expect(event.detail.config.entity).toBe(VACUUM);
    expect(pickerFor(editor, "vacuum").value).toBe(VACUUM);
  });

  it("round-trips the appearance without mutating the supplied configuration", async () => {
    const supplied = deepFreeze(config({ appearance: "adaptive" }));
    const before = structuredClone(supplied);
    const editor = await renderEditor(supplied);
    const appearance = editor.shadowRoot?.querySelector<HTMLSelectElement>("#card-appearance");

    if (!appearance) throw new Error("Appearance select not rendered");
    expect(appearance.value).toBe("adaptive");
    expect(appearance.querySelector('option[value="adaptive"]')?.textContent?.trim()).toBe(
      "An Dashboard/Theme angepasst (empfohlen)",
    );

    const changed = nextConfigChanged(editor);
    appearance.value = "accent";
    appearance.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await editor.updateComplete;

    expect((await changed).detail.config.appearance).toBe("accent");
    expect(supplied).toEqual(before);
  });

  it("preserves an unknown appearance until the user selects a known design", async () => {
    const supplied = deepFreeze(config({ appearance: "future-design" as never }));
    const editor = await renderEditor(supplied);
    const appearance = editor.shadowRoot?.querySelector<HTMLSelectElement>("#card-appearance");

    if (!appearance) throw new Error("Appearance select not rendered");
    expect(appearance.value).toBe("future-design");
    expect(appearance.selectedOptions[0]?.textContent).toContain("future-design");

    const changed = nextConfigChanged(editor);
    appearance.value = "adaptive";
    appearance.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await editor.updateComplete;

    expect((await changed).detail.config.appearance).toBe("adaptive");
    expect(supplied.appearance).toBe("future-design");
  });

  it("accepts image and camera entities in the map picker", async () => {
    const editor = await renderEditor(config({ sections: { order: ["map"] } }));
    const mapPicker = pickerWithLabel(editor, "Karte");
    expect(mapPicker.includeDomains).toEqual(expect.arrayContaining(["image", "camera"]));

    for (const entityId of ["image.my_robot_map", "camera.my_robot_map"]) {
      const changed = nextConfigChanged(editor);
      pickerWithLabel(editor, "Karte").dispatchEvent(new CustomEvent("value-changed", {
        detail: { value: entityId },
        bubbles: true,
        composed: true,
      }));
      await editor.updateComplete;
      expect((await changed).detail.config.entities?.map).toBe(entityId);
    }
  });

  it("adds a routine from a button entity", async () => {
    const editor = await renderEditor(config());
    await chooseEntity(editor, "button", PROGRAM);
    const changed = nextConfigChanged(editor);

    const addButton = editor.shadowRoot?.querySelector<HTMLButtonElement>(".add-row > button");
    expect(addButton?.disabled).toBe(false);
    addButton?.click();
    await editor.updateComplete;

    const emitted = (await changed).detail.config;
    expect(emitted.programs).toMatchObject({
      guard: "confirm",
      items: [{
        entity: PROGRAM,
        name: "Programm 1",
        kind: "unknown",
        guard: "confirm",
      }],
    });
  });

  it("always replaces program guards with confirm", async () => {
    const supplied = config({
      programs: {
        guard: "hold_confirm" as never,
        acknowledgement_timeout: "15s",
        items: [
          { entity: PROGRAM, guard: "hold_confirm" as never, kind: "combo" },
          { entity: "button.weiteres_programm", kind: "vacuum" },
        ],
      },
    });
    const editor = await renderEditor(supplied);
    const changed = nextConfigChanged(editor);
    const name = editor.shadowRoot?.querySelector<HTMLInputElement>("#card-name");

    if (!name) throw new Error("Name input not rendered");
    name.value = "Saugroboter";
    name.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await editor.updateComplete;

    const emitted = (await changed).detail.config;
    expect(emitted.programs?.guard).toBe("confirm");
    expect(emitted.programs?.items?.map((program) => program.guard)).toEqual([
      "confirm",
      "confirm",
    ]);
    expect(supplied.programs?.guard).toBe("hold_confirm");
    expect(supplied.programs?.items?.[0]?.guard).toBe("hold_confirm");
    expect(supplied.programs?.items?.[1]?.guard).toBeUndefined();
  });

  it("emits config-changed as a bubbling and composed event", async () => {
    const editor = await renderEditor(config());
    const parentEvent = new Promise<CustomEvent<{ config: VacuumCardConfig }>>((resolve) => {
      document.body.addEventListener("config-changed", (event) => {
        resolve(event as CustomEvent<{ config: VacuumCardConfig }>);
      }, { once: true });
    });

    await chooseEntity(editor, "vacuum", "vacuum.neuer_roboter");

    const event = await parentEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail.config.entity).toBe("vacuum.neuer_roboter");
  });

  it("preserves unknown keys while editing known values", async () => {
    const supplied = {
      ...config({
        entities: { status: "sensor.my_robot_status" },
        programs: {
          guard: "confirm",
          items: [{ entity: PROGRAM, kind: "combo" }],
        },
      }),
      future_top_level: { enabled: true },
      entities: {
        status: "sensor.my_robot_status",
        future_entity: "sensor.future",
      },
      programs: {
        guard: "confirm",
        future_programs_option: 23,
        items: [{
          entity: PROGRAM,
          kind: "combo",
          future_item_option: { mode: "turbo" },
        }],
      },
    } as unknown as VacuumCardConfig;
    const editor = await renderEditor(supplied);
    const changed = nextConfigChanged(editor);
    const name = editor.shadowRoot?.querySelector<HTMLInputElement>("#card-name");

    if (!name) throw new Error("Name input not rendered");
    name.value = "Neu";
    name.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await editor.updateComplete;

    const emitted = (await changed).detail.config as VacuumCardConfig & Record<string, unknown>;
    expect(emitted.future_top_level).toEqual({ enabled: true });
    expect(emitted.entities).toMatchObject({
      status: "sensor.my_robot_status",
      future_entity: "sensor.future",
    });
    expect(emitted.programs).toMatchObject({
      future_programs_option: 23,
      items: [{ future_item_option: { mode: "turbo" } }],
    });
  });

  it("shows density-aware defaults for quick information and visible sections", async () => {
    const compact = await renderEditor(config({ density: "compact" }));

    expect(checkbox(compact, "overview-battery").checked).toBe(true);
    expect(checkbox(compact, "overview-progress").checked).toBe(false);
    expect(checkbox(compact, "overview-area").checked).toBe(false);
    expect(checkbox(compact, "overview-duration").checked).toBe(false);
    expect(checkbox(compact, "section-activity").checked).toBe(true);
    expect(checkbox(compact, "section-controls").checked).toBe(true);
    expect(checkbox(compact, "section-programs").checked).toBe(true);
    expect(checkbox(compact, "section-dock").checked).toBe(false);
    expect(checkbox(compact, "section-details").checked).toBe(false);
    expect(checkbox(compact, "section-maintenance").checked).toBe(false);
    expect(checkbox(compact, "section-map").checked).toBe(false);
    expect(checkbox(compact, "section-diagnostics").checked).toBe(false);

    const comfortable = await renderEditor(config({ density: "comfortable" }));
    expect(checkbox(comfortable, "overview-battery").checked).toBe(true);
    expect(checkbox(comfortable, "overview-progress").checked).toBe(true);
    expect(checkbox(comfortable, "overview-area").checked).toBe(false);
    expect(checkbox(comfortable, "overview-duration").checked).toBe(false);
    for (const section of ["activity", "controls", "programs", "alerts", "dock"]) {
      expect(checkbox(comfortable, `section-${section}`).checked).toBe(true);
    }
    for (const section of ["details", "maintenance", "map", "diagnostics"]) {
      expect(checkbox(comfortable, `section-${section}`).checked).toBe(false);
    }

    const compactDock = await renderEditor(config({ density: "compact", view: "dock" }));
    expect(checkbox(compactDock, "section-dock").checked).toBe(true);
    expect(checkbox(compactDock, "section-maintenance").checked).toBe(true);
    expect(checkbox(compactDock, "section-diagnostics").checked).toBe(true);
    expect(compactDock.shadowRoot?.querySelector("#section-controls")).toBeNull();
    expect(compactDock.shadowRoot?.querySelector("#quick-info-heading")).toBeNull();
    expect(compactDock.shadowRoot?.querySelector("#programs-heading")).toBeNull();
  });

  it("respects explicitly empty quick information and section selections", async () => {
    const editor = await renderEditor(config({
      density: "compact",
      overview: { items: [] },
      sections: { order: [] },
    }));

    for (const item of ["battery", "progress", "area", "duration"]) {
      expect(checkbox(editor, `overview-${item}`).checked).toBe(false);
    }
    for (const section of [
      "activity",
      "controls",
      "programs",
      "alerts",
      "dock",
      "details",
      "maintenance",
      "map",
      "diagnostics",
    ]) {
      expect(checkbox(editor, `section-${section}`).checked).toBe(false);
    }
    expect(editor.shadowRoot?.querySelector("#alerts-optional-note")?.textContent).toContain(
      "optional",
    );
    expect(checkbox(editor, "section-alerts").checked).toBe(false);
  });

  it("allows notices to be hidden and removes their advanced entity fields", async () => {
    const editor = await renderEditor(config());
    expect(checkbox(editor, "section-alerts").checked).toBe(true);
    expect(pickerWithLabel(editor, "Staubsaugerfehler")).toBeDefined();

    const changed = nextConfigChanged(editor);
    await setCheckbox(editor, "section-alerts", false);
    expect((await changed).detail.config.sections?.order).not.toContain("alerts");
    expect([...editor.shadowRoot!.querySelectorAll<EntityPicker>("ha-entity-picker")]
      .some((picker) => picker.label === "Staubsaugerfehler")).toBe(false);
  });

  it("shows only settings relevant to the selected view", async () => {
    const editor = await renderEditor(config({
      view: "robot",
      sections: { order: ["activity", "controls", "details", "map"] },
    }));
    expect(editor.shadowRoot?.querySelector("#dock-heading")).toBeNull();
    expect(editor.shadowRoot?.querySelector("#programs-heading")).toBeNull();
    expect(pickerWithLabel(editor, "Karte")).toBeDefined();

    const view = editor.shadowRoot?.querySelector<HTMLSelectElement>("#card-view");
    if (!view) throw new Error("View select not rendered");
    const changed = nextConfigChanged(editor);
    view.value = "dock";
    view.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await editor.updateComplete;

    expect((await changed).detail.config.sections?.order).toEqual([
      "alerts",
      "dock",
      "maintenance",
      "diagnostics",
    ]);
    expect(editor.shadowRoot?.querySelector("#quick-info-heading")).toBeNull();
    expect(editor.shadowRoot?.querySelector("#programs-heading")).toBeNull();
    expect(editor.shadowRoot?.querySelector("#dock-heading")).not.toBeNull();
    expect(editor.shadowRoot?.querySelector("#section-controls")).toBeNull();
    expect(editor.shadowRoot?.querySelector("#section-map")).toBeNull();
  });

  it("round-trips overview and sections without losing future keys or safety guards", async () => {
    const supplied = deepFreeze({
      ...config({
        density: "detailed",
        programs: {
          guard: "hold_confirm" as never,
          items: [{ entity: PROGRAM, guard: "hold_confirm" as never, kind: "combo" }],
        },
      }),
      overview: {
        items: ["battery", "area", "future_metric"],
        future_overview_option: { emphasis: "high" },
      },
      sections: {
        order: ["activity", "future-panel", "details"],
        future_sections_option: { columns: 2 },
      },
      future_top_level: { enabled: true },
    } as unknown as VacuumCardConfig);
    const before = JSON.parse(JSON.stringify(supplied));
    const editor = await renderEditor(supplied);

    const overviewChanged = nextConfigChanged(editor);
    await setCheckbox(editor, "overview-progress", true);
    const afterOverview = (await overviewChanged).detail.config as VacuumCardConfig &
      Record<string, unknown>;
    expect(afterOverview.overview).toEqual({
      items: ["battery", "progress", "area", "future_metric"],
      future_overview_option: { emphasis: "high" },
    });
    expect(afterOverview.programs?.guard).toBe("confirm");
    expect(afterOverview.programs?.items?.[0]?.guard).toBe("confirm");

    const sectionsChanged = nextConfigChanged(editor);
    await setCheckbox(editor, "section-programs", true);
    const afterSections = (await sectionsChanged).detail.config as VacuumCardConfig &
      Record<string, unknown>;
    expect(afterSections.sections).toEqual({
      order: ["activity", "programs", "details", "future-panel"],
      future_sections_option: { columns: 2 },
    });
    expect(afterSections.overview).toEqual(afterOverview.overview);
    expect(afterSections.future_top_level).toEqual({ enabled: true });
    expect(afterSections.programs?.guard).toBe("confirm");
    expect(afterSections.programs?.items?.[0]?.guard).toBe("confirm");
    expect(supplied).toEqual(before);
  });

  it("writes a binary dock entity and its on-state meaning", async () => {
    const supplied = deepFreeze(config({
      dock: {
        display: "collapsed",
        entities: {
          clean_water_tank: {
            entity: "binary_sensor.alter_frischwassertank",
            on_is: "unknown",
          },
        },
      },
      programs: {
        guard: "hold_confirm" as never,
        items: [{ entity: PROGRAM, guard: "hold_confirm" as never, kind: "combo" }],
      },
    }));
    const editor = await renderEditor(supplied);

    const entityChanged = nextConfigChanged(editor);
    pickerWithLabel(editor, "Frischwassertank").dispatchEvent(new CustomEvent("value-changed", {
      detail: { value: "binary_sensor.my_robot_dock_clean_water_tank" },
      bubbles: true,
      composed: true,
    }));
    await editor.updateComplete;

    const withEntity = (await entityChanged).detail.config;
    expect(withEntity.dock?.entities?.clean_water_tank).toEqual({
      entity: "binary_sensor.my_robot_dock_clean_water_tank",
      on_is: "unknown",
    });
    expect(withEntity.programs?.guard).toBe("confirm");
    expect(withEntity.programs?.items?.[0]?.guard).toBe("confirm");

    const meaningChanged = nextConfigChanged(editor);
    const meaning = editor.shadowRoot?.querySelector<HTMLSelectElement>(
      "#dock-clean_water_tank-on-is",
    );
    if (!meaning) throw new Error("Clean-water on-state select not rendered");
    meaning.value = "warning";
    meaning.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await editor.updateComplete;

    expect((await meaningChanged).detail.config.dock?.entities?.clean_water_tank).toEqual({
      entity: "binary_sensor.my_robot_dock_clean_water_tank",
      on_is: "warning",
    });
    expect(supplied.dock?.entities?.clean_water_tank).toEqual({
      entity: "binary_sensor.alter_frischwassertank",
      on_is: "unknown",
    });
  });

  it("preserves unknown dock, dock-entity, and binary-entity keys", async () => {
    const supplied = {
      ...config(),
      dock: {
        display: "collapsed",
        future_dock_option: { layout: "wide" },
        entities: {
          error: "sensor.my_robot_dock_error",
          future_dock_entity: "sensor.dock_future",
          dirty_water_tank: {
            entity: "binary_sensor.my_robot_dock_dirty_water_tank",
            on_is: "unknown",
            future_binary_option: { invert_after: 5 },
          },
        },
      },
    } as unknown as VacuumCardConfig;
    const editor = await renderEditor(supplied);
    const changed = nextConfigChanged(editor);
    const display = editor.shadowRoot?.querySelector<HTMLSelectElement>("#dock-display");

    if (!display) throw new Error("Dock display select not rendered");
    display.value = "expanded";
    display.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await editor.updateComplete;

    const emittedDock = (await changed).detail.config.dock as
      | (NonNullable<VacuumCardConfig["dock"]> & Record<string, unknown>)
      | undefined;
    expect(emittedDock).toMatchObject({
      display: "expanded",
      future_dock_option: { layout: "wide" },
      entities: {
        error: "sensor.my_robot_dock_error",
        future_dock_entity: "sensor.dock_future",
        dirty_water_tank: {
          entity: "binary_sensor.my_robot_dock_dirty_water_tank",
          on_is: "unknown",
          future_binary_option: { invert_after: 5 },
        },
      },
    });
    expect((supplied.dock as unknown as Record<string, unknown>).future_dock_option).toEqual({
      layout: "wide",
    });
  });
});
