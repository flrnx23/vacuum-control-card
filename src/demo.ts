import "./index";
import type { HassEntity, HomeAssistant, VacuumCardConfig } from "./types";
import type { VacuumCard } from "./vacuum-card";

// Home Assistant provides <ha-icon>. The standalone preview supplies a tiny
// text fallback so compact icon-only controls are still understandable on
// localhost without loading any external assets.
if (!customElements.get("ha-icon")) {
  class PreviewHaIcon extends HTMLElement {
    public static get observedAttributes(): string[] {
      return ["icon"];
    }

    public connectedCallback(): void {
      this.renderIcon();
    }

    public attributeChangedCallback(): void {
      this.renderIcon();
    }

    private renderIcon(): void {
      const symbols: Record<string, string> = {
        "mdi:pause": "Ⅱ",
        "mdi:play": "▶",
        "mdi:playlist-play": "☷",
        "mdi:stop": "■",
        "mdi:home-map-marker": "⌂",
        "mdi:crosshairs-gps": "⌖",
        "mdi:robot-vacuum": "◎",
      };
      this.textContent = symbols[this.getAttribute("icon") ?? ""] ?? "●";
    }
  }
  customElements.define("ha-icon", PreviewHaIcon);
}

const vacuumId = "vacuum.preview_robot";
const statusId = "sensor.preview_robot_status";
const cleaningId = "binary_sensor.preview_robot_cleaning";
const chargingId = "binary_sensor.preview_robot_charging";
const progressId = "sensor.preview_robot_progress";
const areaId = "sensor.preview_robot_cleaned_area";
const durationId = "sensor.preview_robot_cleaning_time";
const batteryId = "sensor.preview_robot_battery";
const errorId = "sensor.preview_robot_error";
const dockErrorId = "sensor.preview_robot_dock_error";
const dryingId = "binary_sensor.preview_robot_mop_drying";
const dryingRemainingId = "sensor.preview_robot_drying_remaining";
const waterShortageId = "binary_sensor.preview_robot_water_shortage";
const mopAttachedId = "binary_sensor.preview_robot_mop_attached";
const programIds = [
  "button.preview_robot_clean_everywhere",
  "button.preview_robot_clean_room_1",
  "button.preview_robot_mop_room_2",
] as const;

function demoEntity(
  entityId: string,
  state: string,
  attributes: HassEntity["attributes"] = {},
): HassEntity {
  const now = new Date().toISOString();
  return { entity_id: entityId, state, attributes, last_changed: now, last_updated: now };
}

const states: Record<string, HassEntity> = {
  [vacuumId]: demoEntity(vacuumId, "idle", {
    friendly_name: "Vorschau-Saugroboter",
    supported_features: 4 | 8 | 16 | 512 | 8192,
  }),
  [statusId]: demoEntity(statusId, "idle", { friendly_name: "Status" }),
  [cleaningId]: demoEntity(cleaningId, "off", { friendly_name: "Reinigen" }),
  [chargingId]: demoEntity(chargingId, "off", { friendly_name: "Ladestatus" }),
  [progressId]: demoEntity(progressId, "0", { friendly_name: "Fortschritt", unit_of_measurement: "%" }),
  [areaId]: demoEntity(areaId, "0", { friendly_name: "Reinigungsbereich", unit_of_measurement: "m²" }),
  [durationId]: demoEntity(durationId, "0", { friendly_name: "Reinigungszeit", unit_of_measurement: "min" }),
  [batteryId]: demoEntity(batteryId, "86", { friendly_name: "Batterie", unit_of_measurement: "%" }),
  [errorId]: demoEntity(errorId, "none", { friendly_name: "Staubsauger-Fehler" }),
  [dockErrorId]: demoEntity(dockErrorId, "none", { friendly_name: "Ladestation-Fehler" }),
  [dryingId]: demoEntity(dryingId, "off", { friendly_name: "Mopp-Trocknung" }),
  [dryingRemainingId]: demoEntity(dryingRemainingId, "0", { friendly_name: "Trocknungsrestzeit", unit_of_measurement: "min" }),
  [waterShortageId]: demoEntity(waterShortageId, "off", { friendly_name: "Wasserknappheit" }),
  [mopAttachedId]: demoEntity(mopAttachedId, "on", { friendly_name: "Mopp angebracht" }),
  [programIds[0]]: demoEntity(programIds[0], "unknown", { friendly_name: "Alles reinigen" }),
  [programIds[1]]: demoEntity(programIds[1], "unknown", { friendly_name: "Raum 1 reinigen" }),
  [programIds[2]]: demoEntity(programIds[2], "unknown", { friendly_name: "Raum 2 wischen" }),
};

const hass: HomeAssistant = {
  states,
  language: "de",
  locale: { language: "de-DE" },
  formatEntityName: (entity) => entity.attributes.friendly_name ?? entity.entity_id,
  formatEntityState: (entity) => {
    const unit = entity.attributes.unit_of_measurement;
    return unit ? `${entity.state} ${unit}` : entity.state;
  },
  callService: async (domain, service, _data, target) => {
    if (domain === "button" && service === "press" && target?.entity_id) {
      window.setTimeout(() => setDemoState("combo"), 350);
    }
  },
};

const config: VacuumCardConfig = {
  type: "custom:vacuum-control-card",
  entity: vacuumId,
  name: "Vorschau-Saugroboter",
  view: "combined",
  density: "compact",
  appearance: "adaptive",
  sections: { order: ["controls", "alerts"] },
  entities: {
    status: statusId,
    cleaning: cleaningId,
    charging: chargingId,
    progress: progressId,
    area: areaId,
    duration: durationId,
    battery: batteryId,
    water_shortage: waterShortageId,
    mop_attached: mopAttachedId,
    vacuum_error: errorId,
  },
  programs: {
    guard: "confirm",
    acknowledgement_timeout: "15s",
    items: [
      { entity: programIds[0], name: "Alles reinigen", kind: "combo", description: "Alle verfügbaren Räume" },
      { entity: programIds[1], name: "Raum 1 reinigen", kind: "vacuum", description: "Ein einzelner Beispielraum" },
      { entity: programIds[2], name: "Raum 2 wischen", kind: "mop", description: "Wischprogramm für einen Beispielraum" },
    ],
  },
  dock: {
    display: "collapsed",
    entities: {
      error: dockErrorId,
      mop_drying: dryingId,
      drying_remaining: dryingRemainingId,
    },
  },
  state_map: {
    task_kind: {
      vacuum: ["vacuum"],
      mop: ["mop"],
      combo: ["combo"],
    },
  },
};

const card = document.querySelector<VacuumCard>("vacuum-control-card");
if (!card) throw new Error("Preview card is missing");
const previewCard: VacuumCard = card;
previewCard.setConfig(config);
previewCard.hass = hass;

function update(entityId: string, state: string): void {
  const previous = states[entityId];
  states[entityId] = demoEntity(entityId, state, previous?.attributes ?? {});
}

function setDemoState(mode: string): void {
  update(errorId, mode === "error" ? "wheel_blocked" : "none");
  update(dryingId, mode === "drying" ? "on" : "off");
  update(dryingRemainingId, mode === "drying" ? "84" : "0");
  const cleaning = ["vacuum", "mop", "combo"].includes(mode);
  update(vacuumId, mode === "returning" ? "returning" : mode === "error" ? "error" : cleaning ? "cleaning" : "idle");
  update(statusId, cleaning ? mode : mode === "returning" ? "returning" : mode === "error" ? "error" : "idle");
  update(cleaningId, cleaning ? "on" : "off");
  update(progressId, cleaning ? "63" : "0");
  update(areaId, cleaning ? "41" : "0");
  update(durationId, cleaning ? "28" : "0");
  previewCard.hass = { ...hass, states: { ...states } };
}

document.querySelectorAll<HTMLButtonElement>("[data-state]").forEach((button) => {
  button.addEventListener("click", () => setDemoState(button.dataset.state ?? "idle"));
});

document.querySelectorAll<HTMLButtonElement>("button[data-layout]").forEach((button) => {
  button.addEventListener("click", () => {
    const layout = button.dataset.layout ?? "minimal";
    if (layout === "comfortable") {
      config.density = "comfortable";
      delete config.sections;
    } else {
      config.density = "compact";
      config.sections = {
        order: layout === "programs"
          ? ["activity", "controls", "programs", "alerts"]
          : ["controls", "alerts"],
      };
    }
    document.querySelector<HTMLElement>(".card-stage")?.setAttribute(
      "data-density",
      layout === "comfortable" ? "comfortable" : "compact",
    );
    previewCard.setConfig(config);
    previewCard.hass = { ...hass, states: { ...states } };
  });
});

document.querySelectorAll<HTMLButtonElement>("button[data-appearance]").forEach((button) => {
  button.addEventListener("click", () => {
    const appearance = button.dataset.appearance === "accent" ? "accent" : "adaptive";
    config.appearance = appearance;
    document.querySelector<HTMLElement>(".card-stage")?.setAttribute("data-appearance", appearance);
    previewCard.setConfig(config);
    previewCard.hass = { ...hass, states: { ...states } };
  });
});
