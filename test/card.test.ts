import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { VacuumCard } from "../src/vacuum-card";
import type { HassEntity, HomeAssistant, VacuumCardConfig } from "../src/types";

const VACUUM = "vacuum.my_robot";
const PROGRAM = "button.my_robot_program_1";
const PROGRAM_2 = "button.my_robot_program_2";
const VACUUM_MODE = "select.my_robot_cleaning_mode";
const VOLUME = "number.my_robot_volume";
const DOCK_DRYING = "binary_sensor.my_robot_dock_mop_drying";
const DOCK_ERROR = "sensor.my_robot_dock_error";
const DOCK_TANK = "binary_sensor.my_robot_dock_clean_water_tank";
const EMPTYING_MODE = "select.my_robot_dock_emptying_mode";
const CHILD_LOCK = "switch.my_robot_child_lock";
const DIAGNOSTIC_SWITCH = "switch.my_robot_diagnostic";
const MAP = "image.my_robot_map";
const BATTERY = "sensor.my_robot_battery";
const PROGRESS = "sensor.my_robot_progress";
const AREA = "sensor.my_robot_area";
const DURATION = "sensor.my_robot_duration";
const VACUUM_ERROR = "sensor.my_robot_error";
const WATER_SHORTAGE = "binary_sensor.my_robot_water_shortage";
const ROBOT_MAINTENANCE = "sensor.my_robot_main_brush";
const DOCK_MAINTENANCE = "sensor.my_robot_dock_brush";
const CONFIRMATION_ARM_DELAY = 400;

function deferred<T = unknown>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function entity(
  entityId: string,
  state: string,
  attributes: HassEntity["attributes"] = {},
): HassEntity {
  return {
    entity_id: entityId,
    state,
    attributes,
    last_changed: "2026-08-10T18:00:00.000Z",
    last_updated: "2026-08-10T18:00:00.000Z",
  };
}

function makeHass(
  overrides: Record<string, HassEntity> = {},
  serviceImplementation: HomeAssistant["callService"] = async () => undefined,
) {
  const callService = vi.fn(serviceImplementation);
  const hass: HomeAssistant = {
    language: "de",
    locale: { language: "de-DE" },
    states: {
      [VACUUM]: entity(VACUUM, "idle", {
        friendly_name: "Mein Saugroboter",
        supported_features: 4 | 8 | 16 | 8192,
      }),
      // A button may legitimately be unknown before its first press.
      [PROGRAM]: entity(PROGRAM, "unknown", { friendly_name: "Programm 1" }),
      ...overrides,
    },
    callService,
    formatEntityState: (stateObject) => stateObject.state,
    formatEntityName: (stateObject) => stateObject.attributes.friendly_name ?? stateObject.entity_id,
  };
  return { hass, callService };
}

function config(extra: Partial<VacuumCardConfig> = {}): VacuumCardConfig {
  return {
    type: "custom:vacuum-control-card",
    entity: VACUUM,
    programs: {
      guard: "confirm",
      acknowledgement_timeout: "10s",
      items: [
        {
          entity: PROGRAM,
          name: "Raum 1 saugen und wischen",
          kind: "combo",
        },
      ],
    },
    ...extra,
  };
}

function writableConfig(): VacuumCardConfig {
  return config({
    sections: {
      order: ["controls", "programs", "dock", "details", "diagnostics"],
    },
    entities: {
      vacuum_mode: VACUUM_MODE,
      volume: VOLUME,
    },
    dock: {
      display: "collapsed",
      entities: {
        mop_drying: DOCK_DRYING,
        emptying_mode: EMPTYING_MODE,
        child_lock: CHILD_LOCK,
      },
    },
    diagnostics: {
      display: "collapsed",
      items: [{ entity: DIAGNOSTIC_SWITCH, name: "Diagnoseschalter" }],
    },
  });
}

function writableStates(): Record<string, HassEntity> {
  return {
    [VACUUM_MODE]: entity(VACUUM_MODE, "balanced", {
      options: ["balanced", "turbo"],
    }),
    [VOLUME]: entity(VOLUME, "50", { min: 0, max: 100, step: 1 }),
    [DOCK_DRYING]: entity(DOCK_DRYING, "off"),
    [EMPTYING_MODE]: entity(EMPTYING_MODE, "standard", {
      options: ["standard", "max"],
    }),
    [CHILD_LOCK]: entity(CHILD_LOCK, "off"),
    [DIAGNOSTIC_SWITCH]: entity(DIAGNOSTIC_SWITCH, "on", {
      friendly_name: "Diagnoseschalter",
    }),
  };
}

async function renderCard(
  cardConfig = config(),
  overrides: Record<string, HassEntity> = {},
  serviceImplementation?: HomeAssistant["callService"],
) {
  const { hass, callService } = makeHass(
    overrides,
    serviceImplementation ?? (async () => undefined),
  );
  const card = document.createElement("vacuum-control-card") as VacuumCard;
  card.setConfig(cardConfig);
  card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return { card, hass, callService };
}

function programButton(card: VacuumCard): HTMLButtonElement {
  const button = card.shadowRoot?.querySelector<HTMLButtonElement>(".program");
  if (!button) throw new Error("Program button not rendered");
  return button;
}

function confirmButton(card: VacuumCard): HTMLButtonElement {
  const button = card.shadowRoot?.querySelector<HTMLButtonElement>("[data-dialog-primary]");
  if (!button) throw new Error("Confirmation button not rendered");
  return button;
}

function cancelButton(card: VacuumCard): HTMLButtonElement {
  const button = card.shadowRoot?.querySelector<HTMLButtonElement>("[data-dialog-cancel]");
  if (!button) throw new Error("Cancel button not rendered");
  return button;
}

async function openProgram(card: VacuumCard): Promise<HTMLButtonElement> {
  const opener = programButton(card);
  opener.focus();
  opener.click();
  await card.updateComplete;
  await Promise.resolve();
  return opener;
}

async function armConfirmation(card: VacuumCard): Promise<void> {
  await vi.advanceTimersByTimeAsync(CONFIRMATION_ARM_DELAY);
  await card.updateComplete;
}

beforeAll(() => {
  if (!customElements.get("vacuum-control-card")) {
    customElements.define("vacuum-control-card", VacuumCard);
  }
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("presentation polish", () => {
  it("separates the last cleaning from live progress and recognizes a full charge", async () => {
    const { card } = await renderCard(config({
      entities: { progress: PROGRESS, area: AREA, duration: DURATION },
      overview: { items: ["battery", "progress", "area", "duration"] },
      programs: { guard: "confirm", items: [] },
    }), {
      [VACUUM]: entity(VACUUM, "charging", {
        friendly_name: "Mein Saugroboter",
        supported_features: 4 | 8 | 16 | 8192,
        battery_level: 100,
      }),
      [PROGRESS]: entity(PROGRESS, "0", { unit_of_measurement: "%" }),
      [AREA]: entity(AREA, "27.7", { unit_of_measurement: "m²" }),
      [DURATION]: entity(DURATION, "29", { unit_of_measurement: "min" }),
    });

    expect(card.shadowRoot?.querySelector(".status-line")?.textContent).toContain("Voll geladen");
    const activity = card.shadowRoot?.querySelector('[data-section="activity"]');
    expect(activity?.classList.contains("activity-card")).toBe(true);
    expect(activity?.getAttribute("data-session-active")).toBe("false");
    expect(activity?.textContent).toContain("Letzte Reinigung");
    expect(activity?.textContent).toContain("27.7");
    expect(activity?.textContent).toContain("29");
    expect(activity?.textContent).not.toContain("Fortschritt");
    expect(activity?.querySelector('.activity-visual ha-icon')?.getAttribute("icon"))
      .toBe("mdi:history");
  });

  it("keeps current progress in the slim animated activity row while cleaning", async () => {
    const { card } = await renderCard(config({
      entities: { progress: PROGRESS, area: AREA },
      overview: { items: ["progress", "area"] },
      programs: { guard: "confirm", items: [] },
    }), {
      [VACUUM]: entity(VACUUM, "cleaning", {
        friendly_name: "Mein Saugroboter",
        supported_features: 4 | 8 | 16 | 8192,
      }),
      [PROGRESS]: entity(PROGRESS, "42"),
      [AREA]: entity(AREA, "12.5"),
    });

    const activity = card.shadowRoot?.querySelector('[data-section="activity"]');
    expect(activity?.classList.contains("activity-card")).toBe(true);
    expect(activity?.querySelector(".activity-visual")?.getAttribute("data-active")).toBe("true");
    expect(activity?.querySelector('.activity-visual ha-icon')?.getAttribute("icon"))
      .toBe("mdi:robot-vacuum");
    expect(activity?.textContent).toContain("42 %");
  });

  it("stops the activity animation when animations are disabled", async () => {
    const { card } = await renderCard(config({
      overview: { items: ["progress"] },
      entities: { progress: PROGRESS },
      programs: { guard: "confirm", items: [] },
      animations: { enabled: false, intensity: "subtle", respect_reduced_motion: true },
    }), {
      [VACUUM]: entity(VACUUM, "cleaning", {
        friendly_name: "Mein Saugroboter",
        supported_features: 4 | 8 | 16 | 8192,
      }),
      [PROGRESS]: entity(PROGRESS, "18"),
    });

    expect(card.shadowRoot?.querySelector(".activity-visual")?.getAttribute("data-active"))
      .toBe("false");
  });

  it("opens more-info from the complete metric instead of a tiny ellipsis", async () => {
    const { card } = await renderCard(config({
      entities: { area: AREA },
      overview: { items: ["area"] },
      programs: { guard: "confirm", items: [] },
    }), {
      [AREA]: entity(AREA, "27.7"),
    });
    const moreInfo = vi.fn();
    card.addEventListener("hass-more-info", moreInfo);

    const metric = card.shadowRoot?.querySelector<HTMLButtonElement>(".metric-button");
    expect(metric?.textContent).toContain("Fläche");
    expect(card.shadowRoot?.querySelector(".metric-more-info")).toBeNull();
    metric?.click();
    expect(moreInfo).toHaveBeenCalledOnce();
    expect((moreInfo.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ entityId: AREA });
  });

  it("uses the normal start action when the program section is already visible", async () => {
    const { card } = await renderCard();
    const label = card.shadowRoot?.querySelector(".controls .primary .control-text")?.textContent;
    expect(label).toBe("Starten");
  });

  it("groups maintenance alerts and shows the most urgent remaining value", async () => {
    const { card } = await renderCard(config({
      maintenance: {
        items: [
          { entity: ROBOT_MAINTENANCE, name: "Hauptbürste", warning_below: 20 },
          { entity: DOCK_MAINTENANCE, name: "Sensoren", warning_below: 20 },
        ],
      },
    }), {
      [ROBOT_MAINTENANCE]: entity(ROBOT_MAINTENANCE, "9"),
      [DOCK_MAINTENANCE]: entity(DOCK_MAINTENANCE, "4"),
    });

    const alerts = card.shadowRoot?.querySelectorAll('[data-section="alerts"] .maintenance-alert');
    expect(alerts).toHaveLength(1);
    expect(alerts?.[0]?.textContent).toContain("2 Wartungshinweise");
    expect(alerts?.[0]?.textContent).toContain("Am dringendsten: Sensoren · 4");
    expect(alerts?.[0]?.querySelector(".alert-action ha-icon")).not.toBeNull();
    expect(alerts?.[0]?.textContent).not.toContain("···");
  });

  it("uses unambiguous names for dock, settings, and diagnostics", async () => {
    const { card } = await renderCard(config({
      entities: { vacuum_mode: VACUUM_MODE },
      dock: { display: "collapsed", entities: { mop_drying: DOCK_DRYING } },
      diagnostics: {
        display: "collapsed",
        items: [{ entity: DIAGNOSTIC_SWITCH }],
      },
      sections: { order: ["dock", "details", "diagnostics"] },
    }), {
      [VACUUM_MODE]: entity(VACUUM_MODE, "balanced", { options: ["balanced"] }),
      [DOCK_DRYING]: entity(DOCK_DRYING, "off"),
      [DIAGNOSTIC_SWITCH]: entity(DIAGNOSTIC_SWITCH, "off"),
    });

    expect(card.shadowRoot?.querySelector('[data-section="dock"] summary')?.textContent)
      .toContain("Station bereit");
    expect(card.shadowRoot?.querySelector('[data-section="details"] summary')?.textContent)
      .toContain("Robotereinstellungen");
    expect(card.shadowRoot?.querySelector('[data-section="diagnostics"] summary')?.textContent)
      .toContain("Technische Diagnose");
  });

  it("renders configured card and program icons through ha-icon", async () => {
    const { card } = await renderCard(config({
      icon: "mdi:robot-vacuum",
      programs: {
        guard: "confirm",
        items: [{
          entity: PROGRAM,
          name: "Raum 1",
          kind: "combo",
          icon: "mdi:floor-plan",
        }],
      },
    }));

    expect(card.shadowRoot?.querySelector('.robot-mark ha-icon')?.getAttribute("icon"))
      .toBe("mdi:robot-vacuum");
    expect(card.shadowRoot?.querySelector('.program-icon ha-icon')?.getAttribute("icon"))
      .toBe("mdi:floor-plan");
  });

  it("does not create the map image until map details are opened and resets on config change", async () => {
    const mapConfig = config({
      view: "robot",
      entities: { map: MAP },
      sections: { order: ["map"] },
    });
    const { card } = await renderCard(mapConfig, {
      [MAP]: entity(MAP, "2026-08-10T18:00:00Z", {
        friendly_name: "Karte 1",
        entity_picture: "/api/image_proxy/map",
      }),
    });

    const details = card.shadowRoot?.querySelector<HTMLDetailsElement>('[data-section="map"] details');
    expect(details).not.toBeNull();
    expect(card.shadowRoot?.querySelector('[data-section="map"] img')).toBeNull();

    details!.open = true;
    details!.dispatchEvent(new Event("toggle"));
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector<HTMLImageElement>('[data-section="map"] img')?.src)
      .toContain("/api/image_proxy/map");

    card.setConfig(mapConfig);
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector('[data-section="map"] img')).toBeNull();
  });

  it("uses a dock-only header and filters robot alerts and maintenance", async () => {
    const { card } = await renderCard(config({
      view: "dock",
      entities: { battery: BATTERY, water_shortage: WATER_SHORTAGE },
      dock: { display: "expanded", entities: { mop_drying: DOCK_DRYING } },
      maintenance: {
        display: "expanded",
        items: [
          { entity: ROBOT_MAINTENANCE, name: "Hauptbürste", kind: "main_brush" },
          { entity: DOCK_MAINTENANCE, name: "Dockbürste", kind: "dock_brush" },
        ],
      },
    }), {
      [BATTERY]: entity(BATTERY, "82", { unit_of_measurement: "%" }),
      [WATER_SHORTAGE]: entity(WATER_SHORTAGE, "on", { friendly_name: "Wasserknappheit" }),
      [DOCK_DRYING]: entity(DOCK_DRYING, "on"),
      [ROBOT_MAINTENANCE]: entity(ROBOT_MAINTENANCE, "2", { unit_of_measurement: "%" }),
      [DOCK_MAINTENANCE]: entity(DOCK_MAINTENANCE, "2", { unit_of_measurement: "%" }),
    });

    const header = card.shadowRoot?.querySelector("header");
    expect(header?.querySelector("h2")?.textContent).toContain("Mein Saugroboter");
    expect(header?.querySelector("h2")?.textContent).toContain("Station");
    expect(header?.querySelector(".battery")).toBeNull();

    const alerts = card.shadowRoot?.querySelector('[data-section="alerts"]')?.textContent ?? "";
    expect(alerts).toContain("Dockbürste");
    expect(alerts).not.toContain("Wasserknappheit");
    expect(alerts).not.toContain("Hauptbürste");

    const maintenance = card.shadowRoot?.querySelector('[data-section="maintenance"]')?.textContent ?? "";
    expect(maintenance).toContain("Dockbürste");
    expect(maintenance).not.toContain("Hauptbürste");
  });

  it("shows diagnostic entity id, raw state, and last-changed timestamp", async () => {
    const { card } = await renderCard(config({
      diagnostics: {
        display: "expanded",
        items: [{ entity: DIAGNOSTIC_SWITCH, name: "Diagnoseschalter" }],
      },
      sections: { order: ["diagnostics"] },
    }), {
      [DIAGNOSTIC_SWITCH]: entity(DIAGNOSTIC_SWITCH, "on"),
    });

    const diagnostic = card.shadowRoot?.querySelector('[data-section="diagnostics"]');
    expect(diagnostic?.textContent).toContain(DIAGNOSTIC_SWITCH);
    expect(diagnostic?.textContent).toContain("Rohzustand: on");
    expect(diagnostic?.querySelector("time")?.getAttribute("datetime"))
      .toBe("2026-08-10T18:00:00.000Z");
  });
});

describe("compact presentation", () => {
  it("uses the adaptive dashboard style by default and keeps accent opt-in", async () => {
    const { card: adaptiveCard } = await renderCard(config({
      density: "compact",
      programs: { guard: "confirm", items: [] },
    }));
    const adaptiveGrid = adaptiveCard.getGridOptions();

    expect(adaptiveCard.shadowRoot?.querySelector("ha-card")?.getAttribute("data-appearance"))
      .toBe("adaptive");
    expect(adaptiveCard.shadowRoot?.querySelector(".shell")?.getAttribute("data-appearance"))
      .toBe("adaptive");

    const { card: accentCard } = await renderCard(config({
      density: "compact",
      appearance: "accent",
      programs: { guard: "confirm", items: [] },
    }));

    expect(accentCard.shadowRoot?.querySelector("ha-card")?.getAttribute("data-appearance"))
      .toBe("accent");
    expect(accentCard.shadowRoot?.querySelector(".shell")?.getAttribute("data-appearance"))
      .toBe("accent");
    expect(accentCard.getGridOptions()).toEqual(adaptiveGrid);
  });

  it("renders the minimal compact card as a stable 6 by 2 tile", async () => {
    const { card } = await renderCard(config({
      density: "compact",
      programs: { guard: "confirm", items: [] },
    }), {
      [VACUUM]: entity(VACUUM, "idle", {
        friendly_name: "Mein Saugroboter",
        supported_features: 4 | 8 | 16 | 8192,
        battery_level: 81,
      }),
    });

    expect(card.shadowRoot?.querySelector(".shell")?.getAttribute("data-density")).toBe("compact");
    expect(card.shadowRoot?.querySelector(".robot-visual")).toBeNull();
    expect(card.shadowRoot?.querySelector(".battery")?.textContent).toContain("81 %");
    expect(card.shadowRoot?.querySelector(".status-line")?.textContent).toContain("Bereit");
    expect(card.shadowRoot?.querySelectorAll(".controls .control-icon").length).toBeGreaterThan(0);
    expect(card.getGridOptions()).toEqual({
      columns: 6,
      rows: 2,
      min_columns: 6,
      min_rows: 2,
    });
  });

  it("shows only selected overview information, including hiding battery fallback", async () => {
    const { card } = await renderCard(config({
      density: "compact",
      overview: { items: ["area", "progress"] },
      entities: { progress: PROGRESS, area: AREA, duration: DURATION },
      programs: { guard: "confirm", items: [] },
    }), {
      [VACUUM]: entity(VACUUM, "cleaning", {
        friendly_name: "Mein Saugroboter",
        supported_features: 4 | 8 | 16 | 8192,
        battery_level: 73,
      }),
      [PROGRESS]: entity(PROGRESS, "48", { unit_of_measurement: "%" }),
      [AREA]: entity(AREA, "31", { unit_of_measurement: "m²" }),
      [DURATION]: entity(DURATION, "22", { unit_of_measurement: "min" }),
    });

    const overview = card.shadowRoot?.querySelector('[data-section="activity"]');
    expect(card.shadowRoot?.querySelector(".battery")).toBeNull();
    expect(card.shadowRoot?.querySelector(".robot-visual")).toBeNull();
    expect(overview?.textContent).toContain("48 %");
    expect(overview?.textContent).toContain("31");
    expect(overview?.textContent).not.toContain("22");
    expect(Array.from(overview?.querySelectorAll(".metric-label") ?? []).map((item) => item.textContent))
      .toEqual(["Fläche"]);
    expect(card.getGridOptions().min_rows).toBeGreaterThan(2);
  });

  it("keeps a critical error in the main status while optional notices stay hidden", async () => {
    const { card } = await renderCard(config({
      density: "compact",
      overview: { items: [] },
      entities: { vacuum_error: VACUUM_ERROR },
      sections: { order: ["controls"] },
      programs: { guard: "confirm", items: [] },
    }), {
      [VACUUM_ERROR]: entity(VACUUM_ERROR, "wheel_blocked", { friendly_name: "Roboterfehler" }),
    });

    expect(card.shadowRoot?.querySelector(".status-line")?.textContent).toContain("Fehler");
    expect(card.shadowRoot?.querySelector(".compact-status-badge")).toBeNull();
    expect(card.shadowRoot?.querySelector('[data-section="alerts"]')).toBeNull();
  });

  it("keeps every configured program reachable and grows its minimum height", async () => {
    const programs = [1, 2, 3, 4].map((number) => ({
      entity: `button.my_robot_program_${number}`,
      name: `Programm ${number}`,
      kind: "vacuum" as const,
    }));
    const programStates = Object.fromEntries(programs.map((program) => [
      program.entity,
      entity(program.entity, "unknown", { friendly_name: program.name }),
    ]));
    const { card } = await renderCard(config({
      density: "compact",
      programs: { guard: "confirm", items: programs },
    }), programStates);

    expect(card.shadowRoot?.querySelectorAll(".program")).toHaveLength(4);
    expect(card.getGridOptions().min_rows).toBeGreaterThanOrEqual(4);
  });
});

describe("safe program execution", () => {
  it("does not press the button on the first program tap", async () => {
    const { card, callService } = await renderCard();

    await openProgram(card);

    expect(callService).not.toHaveBeenCalled();
    expect(card.shadowRoot?.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it("presses the configured button exactly once after confirmation", async () => {
    const { card, callService } = await renderCard();
    await openProgram(card);
    await armConfirmation(card);

    confirmButton(card).click();
    confirmButton(card).click();
    await card.updateComplete;

    expect(callService).toHaveBeenCalledTimes(1);
    expect(callService).toHaveBeenCalledWith(
      "button",
      "press",
      {},
      { entity_id: PROGRAM },
    );
  });

  it("sends nothing when confirmation is cancelled", async () => {
    const { card, callService } = await renderCard();
    await openProgram(card);

    cancelButton(card).click();
    await card.updateComplete;

    expect(callService).not.toHaveBeenCalled();
    expect(card.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
  });

  it("keeps an unavailable button focusable and blocks execution", async () => {
    const { card, callService } = await renderCard(config(), {
      [PROGRAM]: entity(PROGRAM, "unavailable"),
    });

    expect(programButton(card).disabled).toBe(false);
    expect(programButton(card).getAttribute("aria-disabled")).toBe("true");
    expect(programButton(card).textContent).toContain("nicht verfügbar");
    programButton(card).focus();
    expect(card.shadowRoot?.activeElement).toBe(programButton(card));
    programButton(card).click();
    await card.updateComplete;
    await armConfirmation(card);

    expect(card.shadowRoot?.querySelector('[role="dialog"]')).not.toBeNull();
    expect(confirmButton(card).disabled).toBe(true);
    confirmButton(card).click();
    expect(callService).not.toHaveBeenCalled();
  });

  it("allows a normal stateless button in unknown state", async () => {
    const { card } = await renderCard();
    expect(programButton(card).disabled).toBe(false);
  });

  it("blocks a program whose hard precondition fails", async () => {
    const waterShortage = "binary_sensor.my_robot_water_shortage_guard";
    const guardedConfig = config({
      entities: { water_shortage: waterShortage },
      programs: {
        guard: "confirm",
        items: [
          {
            entity: PROGRAM,
            name: "Wischen",
            kind: "mop",
            requires: [
              {
                condition: "water_shortage",
                expected: false,
                severity: "block",
              },
            ],
          },
        ],
      },
    });
    const { card, callService } = await renderCard(guardedConfig, {
      [waterShortage]: entity(waterShortage, "on", { friendly_name: "Wasserknappheit" }),
    });

    await openProgram(card);
    await armConfirmation(card);
    expect(card.shadowRoot?.activeElement).toBe(cancelButton(card));
    expect(confirmButton(card).disabled).toBe(true);

    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    expect(cancelButton(card).dispatchEvent(tab)).toBe(false);
    expect(card.shadowRoot?.activeElement).toBe(cancelButton(card));

    confirmButton(card).click();
    expect(callService).not.toHaveBeenCalled();
  });

  it("acknowledges a sent program only after cleaning is observed", async () => {
    const { card, hass, callService } = await renderCard();
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;

    expect(callService).toHaveBeenCalledTimes(1);
    expect(card.shadowRoot?.textContent).toContain("Anfrage");

    card.hass = {
      ...hass,
      states: {
        ...hass.states,
        [VACUUM]: entity(VACUUM, "paused", hass.states[VACUUM]!.attributes),
      },
    };
    await card.updateComplete;

    expect(card.shadowRoot?.textContent).not.toContain("wurde gestartet");
    expect(programButton(card).disabled).toBe(true);

    card.hass = {
      ...hass,
      states: {
        ...hass.states,
        [VACUUM]: entity(VACUUM, "cleaning", hass.states[VACUUM]!.attributes),
      },
    };
    await card.updateComplete;
    await card.updateComplete;

    expect(card.shadowRoot?.textContent).toContain("wurde gestartet");
    expect(callService).toHaveBeenCalledTimes(1);
  });

  it("focuses cancel, keeps the background inert, and rejects rapid confirmation", async () => {
    const { card, callService } = await renderCard();
    const opener = programButton(card);
    opener.focus();

    // A second activation in the same pointer/key sequence may reopen the
    // dialog, but must never execute the program.
    opener.click();
    opener.click();
    await card.updateComplete;
    await Promise.resolve();

    expect(card.shadowRoot?.activeElement).toBe(cancelButton(card));
    expect(confirmButton(card).disabled).toBe(true);
    expect(card.shadowRoot?.querySelector(".shell > header")?.hasAttribute("inert")).toBe(true);
    confirmButton(card).click();
    expect(callService).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(CONFIRMATION_ARM_DELAY - 1);
    await card.updateComplete;
    expect(confirmButton(card).disabled).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    await card.updateComplete;
    expect(confirmButton(card).disabled).toBe(false);

    cancelButton(card).click();
    await card.updateComplete;
    await Promise.resolve();
    expect(card.shadowRoot?.activeElement).toBe(opener);
    expect(card.shadowRoot?.querySelector(".shell > header")?.hasAttribute("inert")).toBe(false);
    expect(callService).not.toHaveBeenCalled();
  });

  it("rechecks the current robot activity immediately before the call", async () => {
    const { card, hass, callService } = await renderCard();
    await openProgram(card);
    await armConfirmation(card);

    // Mutate without assigning hass again, so no render can refresh a captured
    // view model before the click. Execution must still see this state.
    hass.states[VACUUM] = entity(
      VACUUM,
      "cleaning",
      hass.states[VACUUM]!.attributes,
    );
    confirmButton(card).click();
    await card.updateComplete;

    expect(callService).not.toHaveBeenCalled();
    expect(card.shadowRoot?.querySelector(".dialog-issues li")).not.toBeNull();
    expect(confirmButton(card).disabled).toBe(true);
  });

  it("refreshes changed warnings and requires a new deliberate confirmation", async () => {
    const mopAttached = "binary_sensor.my_robot_mop_attached";
    const guardedConfig = config({
      entities: { mop_attached: mopAttached },
      programs: {
        guard: "confirm",
        items: [{
          entity: PROGRAM,
          name: "Wischen",
          kind: "mop",
          requires: [{
            condition: "mop_attached",
            expected: true,
            severity: "warn",
          }],
        }],
      },
    });
    const { card, hass, callService } = await renderCard(guardedConfig, {
      [mopAttached]: entity(mopAttached, "on", { friendly_name: "Mopp angebracht" }),
    });
    await openProgram(card);
    await armConfirmation(card);

    hass.states[mopAttached] = entity(mopAttached, "off", {
      friendly_name: "Mopp angebracht",
    });
    confirmButton(card).click();
    await card.updateComplete;

    expect(callService).not.toHaveBeenCalled();
    expect(card.shadowRoot?.querySelector(".dialog-issues li")).not.toBeNull();
    expect(confirmButton(card).disabled).toBe(true);

    await armConfirmation(card);
    expect(confirmButton(card).disabled).toBe(false);
    confirmButton(card).click();
    await card.updateComplete;
    expect(callService).toHaveBeenCalledTimes(1);
  });

  it("keeps transport in flight locked after the acknowledgement timeout", async () => {
    const request = deferred();
    const { card, callService } = await renderCard(
      config(),
      {},
      () => request.promise,
    );
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;

    expect(callService).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10_000);
    await card.updateComplete;

    expect(programButton(card).disabled).toBe(true);
    programButton(card).click();
    expect(callService).toHaveBeenCalledTimes(1);

    request.resolve(undefined);
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;
    expect(programButton(card).disabled).toBe(false);
  });

  it("ignores a late rejection from an invalidated request while a newer request is active", async () => {
    const first = deferred();
    const second = deferred();
    const responses = [first.promise, second.promise];
    const { card, hass, callService } = await renderCard(
      config(),
      {},
      () => responses.shift() ?? Promise.resolve(),
    );
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;

    card.hass = {
      ...hass,
      states: {
        ...hass.states,
        [VACUUM]: entity(VACUUM, "cleaning", hass.states[VACUUM]!.attributes),
      },
    };
    await card.updateComplete;

    const internal = card as unknown as {
      _confirmation?: unknown;
      _pendingProgram?: unknown;
      _programTransport?: unknown;
      _confirmedProgramKind?: unknown;
      _commandBusy: boolean;
    };
    expect(internal._confirmedProgramKind).toBe("combo");

    card.remove();
    expect(internal._confirmation).toBeUndefined();
    expect(internal._pendingProgram).toBeUndefined();
    expect(internal._programTransport).toBeUndefined();
    expect(internal._confirmedProgramKind).toBeUndefined();
    expect(internal._commandBusy).toBe(false);

    card.hass = {
      ...hass,
      states: {
        ...hass.states,
        [VACUUM]: entity(VACUUM, "idle", hass.states[VACUUM]!.attributes),
      },
    };
    document.body.append(card);
    await card.updateComplete;
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;
    expect(callService).toHaveBeenCalledTimes(2);

    first.reject(new Error("late transport failure"));
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;

    expect(programButton(card).disabled).toBe(true);
    expect(card.shadowRoot?.textContent).not.toContain("konnte nicht gestartet werden");
    second.resolve(undefined);
  });

  it("invalidates an open old-config dialog and rerenders the normalized replacement", async () => {
    const { card, callService } = await renderCard(config({ name: "Alte Karte" }), {
      [PROGRAM_2]: entity(PROGRAM_2, "unknown", { friendly_name: "Raum 2" }),
    });
    await openProgram(card);
    await armConfirmation(card);
    const detachedOldConfirm = confirmButton(card);

    card.setConfig(config({
      name: "Neue Karte",
      programs: {
        guard: "confirm",
        acknowledgement_timeout: "10s",
        items: [{ entity: PROGRAM_2, name: "Raum 2", kind: "vacuum" }],
      },
    }));
    await card.updateComplete;

    expect(card.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
    expect(card.shadowRoot?.querySelector("h2")?.textContent).toBe("Neue Karte");
    detachedOldConfirm.click();
    expect(callService).not.toHaveBeenCalled();

    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;
    expect(callService).toHaveBeenCalledWith(
      "button",
      "press",
      {},
      { entity_id: PROGRAM_2 },
    );
  });

  it("clears acknowledgement-pending state when configuration changes", async () => {
    const { card, callService } = await renderCard(config(), {
      [PROGRAM_2]: entity(PROGRAM_2, "unknown", { friendly_name: "Raum 2" }),
    });
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;
    expect(programButton(card).disabled).toBe(true);

    card.setConfig(config({
      programs: {
        guard: "confirm",
        acknowledgement_timeout: "10s",
        items: [{ entity: PROGRAM_2, name: "Raum 2", kind: "vacuum" }],
      },
    }));
    await card.updateComplete;

    expect(programButton(card).disabled).toBe(false);
    await vi.advanceTimersByTimeAsync(10_000);
    await card.updateComplete;
    expect(card.shadowRoot?.textContent).not.toContain("nicht bestätigt");
    expect(callService).toHaveBeenCalledTimes(1);
  });
});

describe("write locking and state-bound controls", () => {
  function writeControls(card: VacuumCard) {
    const selects = Array.from(card.shadowRoot?.querySelectorAll<HTMLSelectElement>("select") ?? []);
    const mode = selects.find((select) => Array.from(select.options).some((option) => option.value === "turbo"));
    const volume = card.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
    const childLock = card.shadowRoot?.querySelector<HTMLButtonElement>('[data-section="dock"] .setting-row button');
    const diagnostic = card.shadowRoot?.querySelector<HTMLButtonElement>('[data-section="diagnostics"] .entity-row button');
    if (!mode || !volume || !childLock || !diagnostic) throw new Error("Writable controls not rendered");
    return { selects, mode, volume, childLock, diagnostic };
  }

  function expectWriteControlsDisabled(card: VacuumCard): void {
    const { selects, volume, childLock, diagnostic } = writeControls(card);
    expect(selects.every((select) => select.disabled)).toBe(true);
    expect(volume.disabled).toBe(true);
    expect(childLock.disabled).toBe(true);
    expect(diagnostic.disabled).toBe(true);
  }

  it("locks every writer while a program awaits backend acknowledgement", async () => {
    const { card } = await renderCard(writableConfig(), writableStates());
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;

    const internal = card as unknown as { _pendingProgram?: unknown; _programTransport?: unknown };
    expect(internal._pendingProgram).toBeDefined();
    expect(internal._programTransport).toBeUndefined();
    expectWriteControlsDisabled(card);
  });

  it("keeps every writer locked when acknowledgement arrives before transport settles", async () => {
    const transport = deferred();
    const { card, hass } = await renderCard(writableConfig(), writableStates(), () => transport.promise);
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;

    card.hass = {
      ...hass,
      states: {
        ...hass.states,
        [VACUUM]: entity(VACUUM, "cleaning", hass.states[VACUUM]!.attributes),
      },
    };
    await card.updateComplete;
    await card.updateComplete;

    const internal = card as unknown as { _pendingProgram?: unknown; _programTransport?: unknown };
    expect(internal._pendingProgram).toBeUndefined();
    expect(internal._programTransport).toBeDefined();
    expectWriteControlsDisabled(card);
    transport.resolve(undefined);
  });

  it("locks other writers and rolls ignored controls back to current HA state", async () => {
    const request = deferred();
    const { card, callService } = await renderCard(writableConfig(), writableStates(), () => request.promise);
    const { mode, volume, diagnostic } = writeControls(card);
    expect(diagnostic.getAttribute("aria-label")).toContain("Diagnoseschalter");
    expect(diagnostic.getAttribute("aria-label")).toContain("ausschalten");

    mode.value = "turbo";
    mode.dispatchEvent(new Event("change", { bubbles: true }));
    await card.updateComplete;

    expect(callService).toHaveBeenCalledWith(
      "select",
      "select_option",
      { option: "turbo" },
      { entity_id: VACUUM_MODE },
    );
    expect(mode.value).toBe("balanced");
    expectWriteControlsDisabled(card);

    volume.value = "80";
    volume.dispatchEvent(new Event("change", { bubbles: true }));
    expect(volume.value).toBe("50");
    expect(callService).toHaveBeenCalledTimes(1);

    request.reject(new Error("service rejected"));
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;
    expect(mode.value).toBe("balanced");
  });

  it("rolls a rejected range change back to the HA number state", async () => {
    const request = deferred();
    const { card, callService } = await renderCard(writableConfig(), writableStates(), () => request.promise);
    const { volume } = writeControls(card);

    volume.value = "80";
    volume.dispatchEvent(new Event("change", { bubbles: true }));
    await card.updateComplete;
    expect(volume.value).toBe("50");
    expect(callService).toHaveBeenCalledWith(
      "number",
      "set_value",
      { value: 80 },
      { entity_id: VOLUME },
    );

    request.reject(new Error("service rejected"));
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;
    expect(volume.value).toBe("50");
  });
});

describe("dock presentation", () => {
  it("auto-expands for activity while header activity and animation remain configurable", async () => {
    const baseDock = {
      display: "collapsed" as const,
      auto_expand_on_activity: true,
      show_activity_in_header: false,
      entities: { mop_drying: DOCK_DRYING },
    };
    const { card } = await renderCard(config({ dock: baseDock }), {
      [DOCK_DRYING]: entity(DOCK_DRYING, "on"),
    });

    expect(card.shadowRoot?.querySelector<HTMLDetailsElement>('[data-section="dock"] details')?.open).toBe(true);
    expect(card.shadowRoot?.querySelector('[data-section="dock"] .dock-strip')?.textContent).not.toContain("getrocknet");
    expect(card.shadowRoot?.querySelector('.dock-symbol')?.getAttribute("data-active")).toBe("false");

    card.setConfig(config({
      dock: { ...baseDock, show_activity_in_header: true },
      animations: { enabled: true, intensity: "none", respect_reduced_motion: true },
    }));
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector('[data-section="dock"] .dock-strip')?.textContent).toContain("getrocknet");
    expect(card.shadowRoot?.querySelector('.dock-symbol')?.getAttribute("data-active")).toBe("false");
  });

  it("auto-expands for dock warnings without hiding a critical global alert", async () => {
    const { card } = await renderCard(config({
      dock: {
        display: "collapsed",
        auto_expand_on_warning: true,
        show_warnings_in_header: false,
        entities: { error: DOCK_ERROR },
      },
    }), {
      [DOCK_ERROR]: entity(DOCK_ERROR, "blocked"),
    });

    expect(card.shadowRoot?.querySelector<HTMLDetailsElement>('[data-section="dock"] details')?.open).toBe(true);
    expect(card.shadowRoot?.querySelector('[data-section="dock"] .dock-strip')?.textContent).not.toContain("Stationsfehler");
    const globalAlert = card.shadowRoot?.querySelector<HTMLElement>('[data-section="alerts"] .alert');
    expect(globalAlert?.textContent).toContain("Stationsfehler");
    expect(globalAlert?.getAttribute("data-severity")).toBe("critical");
  });

  it("shows and auto-expands for a configured tank warning", async () => {
    const { card } = await renderCard(config({
      dock: {
        display: "collapsed",
        auto_expand_on_warning: true,
        show_warnings_in_header: true,
        entities: {
          clean_water_tank: { entity: DOCK_TANK, on_is: "warning" },
        },
      },
    }), {
      [DOCK_TANK]: entity(DOCK_TANK, "on"),
    });

    expect(card.shadowRoot?.querySelector<HTMLDetailsElement>('[data-section="dock"] details')?.open).toBe(true);
    expect(card.shadowRoot?.querySelector('[data-section="dock"] .dock-strip')?.textContent).toContain("Frischwassertank");
  });

  it("renders only missing and unavailable dock signals as neutral unavailable", async () => {
    const { card } = await renderCard(config({
      dock: {
        display: "collapsed",
        entities: { error: DOCK_ERROR, mop_drying: DOCK_DRYING },
      },
    }), {
      [DOCK_ERROR]: entity(DOCK_ERROR, "unavailable"),
    });

    const strip = card.shadowRoot?.querySelector('[data-section="dock"] .dock-strip');
    expect(strip?.textContent).toContain("nicht verfügbar");
    expect(strip?.textContent).not.toContain("bereit");
    expect(strip?.lastElementChild?.textContent?.trim()).toBe("?");
  });
});

describe("dialog and configuration accessibility", () => {
  it("names both the program and target robot in the default dialog", async () => {
    const { card } = await renderCard();
    await openProgram(card);
    const text = card.shadowRoot?.querySelector('#vc-dialog-text')?.textContent ?? "";
    expect(text).toContain("Raum 1 saugen und wischen");
    expect(text).toContain("Mein Saugroboter");
  });

  it("moves focus to the pending notice when the program opener becomes locked", async () => {
    const request = deferred();
    const { card } = await renderCard(config(), {}, () => request.promise);
    await openProgram(card);
    await armConfirmation(card);
    confirmButton(card).click();
    await card.updateComplete;
    await Promise.resolve();

    expect(programButton(card).disabled).toBe(true);
    expect(card.shadowRoot?.activeElement).toBe(card.shadowRoot?.querySelector('.notice[tabindex]'));
    request.resolve(undefined);
  });

  it("renders localized warnings for normalized duplicate configuration", async () => {
    const { card } = await renderCard(config({
      programs: {
        guard: "confirm",
        items: [
          { entity: PROGRAM, name: "Original" },
          { entity: PROGRAM, name: "Doppeltes Programm" },
        ],
      },
      sections: { order: ["programs", "programs"] },
    }));

    const warnings = Array.from(card.shadowRoot?.querySelectorAll<HTMLElement>('.notice[data-kind="warning"]') ?? []);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]?.textContent).toContain("Doppeltes Programm");
    expect(warnings[1]?.textContent).toContain("programs");
  });
});
