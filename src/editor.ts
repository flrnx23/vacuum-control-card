import { LitElement, css, html, nothing, type TemplateResult } from "lit";

import type {
  Appearance,
  BinaryEntityConfig,
  BinaryOnMeaning,
  Density,
  DisplayMode,
  DockEntitiesConfig,
  HomeAssistant,
  OverviewItem,
  ProgramConfig,
  SemanticEntitiesConfig,
  TaskKind,
  VacuumCardConfig,
  VacuumView,
} from "./types";

type Language = "de" | "en";
type SemanticEntityKey = keyof SemanticEntitiesConfig;

interface EntityFieldDefinition {
  key: SemanticEntityKey;
  domains: string[];
}

const VIEWS: VacuumView[] = ["combined", "robot", "dock"];
const DENSITIES: Density[] = ["auto", "compact", "comfortable", "detailed"];
const APPEARANCES: Appearance[] = ["adaptive", "accent"];
const DISPLAY_MODES: DisplayMode[] = ["expanded", "collapsed", "hidden"];
const BINARY_ON_MEANINGS: BinaryOnMeaning[] = [
  "unknown",
  "ok",
  "warning",
  "active",
  "installed",
  "missing",
];
const PROGRAM_KINDS: TaskKind[] = ["vacuum", "mop", "combo", "unknown"];
const OVERVIEW_ITEMS: readonly OverviewItem[] = ["battery", "progress", "area", "duration"];
const SELECTABLE_SECTIONS = [
  "activity",
  "controls",
  "programs",
  "dock",
  "details",
  "maintenance",
  "map",
  "diagnostics",
] as const;
const SECTION_ORDER = [
  "activity",
  "controls",
  "programs",
  "alerts",
  "dock",
  "details",
  "maintenance",
  "map",
  "diagnostics",
] as const;
const COMPACT_SECTION_ORDER = ["activity", "controls", "programs", "alerts"] as const;
const COMPACT_DOCK_SECTION_ORDER = ["alerts", "dock", "maintenance", "diagnostics"] as const;

type SelectableSection = (typeof SELECTABLE_SECTIONS)[number];

type SimpleDockEntityKey =
  | "error"
  | "mop_drying"
  | "drying_remaining"
  | "emptying_mode"
  | "child_lock";
type BinaryDockEntityKey =
  | "clean_water_tank"
  | "dirty_water_tank"
  | "cleaning_solution";

const ENTITY_FIELDS: EntityFieldDefinition[] = [
  { key: "status", domains: ["sensor"] },
  { key: "battery", domains: ["sensor"] },
  { key: "charging", domains: ["binary_sensor"] },
  { key: "cleaning", domains: ["binary_sensor"] },
  { key: "progress", domains: ["sensor"] },
  { key: "area", domains: ["sensor"] },
  { key: "duration", domains: ["sensor"] },
  { key: "last_start", domains: ["sensor"] },
  { key: "last_end", domains: ["sensor"] },
  { key: "map", domains: ["image", "camera"] },
  { key: "vacuum_mode", domains: ["select"] },
  { key: "mop_mode", domains: ["select"] },
  { key: "mop_intensity", domains: ["select"] },
  { key: "volume", domains: ["number"] },
  { key: "mop_attached", domains: ["binary_sensor"] },
  { key: "water_tank_attached", domains: ["binary_sensor"] },
  { key: "water_shortage", domains: ["binary_sensor"] },
  { key: "vacuum_error", domains: ["sensor"] },
];

const TRANSLATIONS = {
  de: {
    title: "Vacuum Control Card",
    basic: "Basis",
    basicHint: "Roboter, Kartenansicht und Informationsdichte festlegen.",
    robot: "Saugroboter",
    name: "Name (optional)",
    view: "Ansicht",
    density: "Dichte",
    appearance: "Design",
    entities: "Entitäten",
    entitiesHint: "Optionale Quellen für Status, Fortschritt, Wischen und Karte.",
    programs: "Programme",
    programsHint:
      "Reinigungsprogramme und Routinen werden als Button-Entitäten hinzugefügt. Vor jedem Start fragt die Karte immer nach einer Bestätigung.",
    noPrograms: "Noch keine Programme ausgewählt.",
    chooseButton: "Button-Entität auswählen",
    add: "Hinzufügen",
    remove: "Entfernen",
    program: "Programm",
    programName: "Anzeigename (optional)",
    kind: "Reinigungsart",
    confirmation: "Start immer bestätigen",
    duplicateProgram: "Dieses Programm wurde bereits hinzugefügt.",
    missingRobot: "Bitte eine vacuum-Entität auswählen.",
    unknownValue: "Unbekannter Wert",
    viewCombined: "Roboter und Station",
    viewRobot: "Nur Roboter",
    viewDock: "Nur Station",
    densityAuto: "Automatisch",
    densityCompact: "Kompakt",
    densityComfortable: "Komfortabel",
    densityDetailed: "Detailliert",
    appearanceAdaptive: "An Dashboard/Theme angepasst (empfohlen)",
    appearanceAccent: "Akzentreich",
    quickInfo: "Schnellinformationen",
    quickInfoHint:
      "Wähle die kompakten Werte unter dem Status. Name und Status bleiben immer sichtbar.",
    visibleSections: "Sichtbare Bereiche",
    visibleSectionsHint: "Wähle, welche Bereiche die Karte anzeigen soll.",
    alertsSafety:
      "Warnungen bleiben aus Sicherheitsgründen immer sichtbar und können hier nicht ausgeblendet werden.",
    sectionActivity: "Aktivität",
    sectionControls: "Steuerung",
    sectionPrograms: "Programme",
    sectionDock: "Station",
    sectionDetails: "Robotereinstellungen",
    sectionMaintenance: "Wartung",
    sectionMap: "Karte",
    sectionDiagnostics: "Technische Diagnose",
    kindVacuum: "Saugen",
    kindMop: "Wischen",
    kindCombo: "Saugen und Wischen",
    kindUnknown: "Nicht festgelegt",
    status: "Status",
    battery: "Batterie",
    charging: "Ladestatus",
    cleaning: "Reinigt",
    progress: "Reinigungsfortschritt",
    area: "Reinigungsfläche",
    duration: "Reinigungszeit",
    last_start: "Letzter Reinigungsbeginn",
    last_end: "Letztes Reinigungsende",
    map: "Karte",
    vacuum_mode: "Saugmodus",
    mop_mode: "Wischmodus",
    mop_intensity: "Wischintensität",
    volume: "Lautstärke",
    mop_attached: "Mopp angebracht",
    water_tank_attached: "Wassertank angebracht",
    water_shortage: "Wasserknappheit",
    vacuum_error: "Staubsaugerfehler",
    dock: "Station",
    dockHint:
      "Darstellung, Aktivitäten, Füllstände und Einstellungen der Reinigungsstation festlegen.",
    dockDisplay: "Darstellung",
    displayExpanded: "Ausgeklappt",
    displayCollapsed: "Eingeklappt",
    displayHidden: "Ausgeblendet",
    dockError: "Stationsfehler",
    mopDrying: "Mopp-Trocknung",
    dryingRemaining: "Verbleibende Trocknungszeit",
    emptyingMode: "Entleerungsmodus",
    childLock: "Kindersicherung",
    cleanWaterTank: "Frischwassertank",
    dirtyWaterTank: "Schmutzwassertank",
    cleaningSolution: "Reinigungsflüssigkeit",
    onMeaning: "Bedeutung des Zustands „on“",
    onUnknown: "Unbekannt / neutral",
    onOk: "In Ordnung",
    onWarning: "Warnung",
    onActive: "Aktiv",
    onInstalled: "Vorhanden / eingesetzt",
    onMissing: "Fehlt",
  },
  en: {
    title: "Vacuum Control Card",
    basic: "Basics",
    basicHint: "Choose the robot, card view, and information density.",
    robot: "Vacuum robot",
    name: "Name (optional)",
    view: "View",
    density: "Density",
    appearance: "Design",
    entities: "Entities",
    entitiesHint: "Optional sources for status, progress, mopping, and the map.",
    programs: "Programs",
    programsHint:
      "Cleaning programs and routines are added as button entities. The card always asks for confirmation before starting one.",
    noPrograms: "No programs selected yet.",
    chooseButton: "Choose button entity",
    add: "Add",
    remove: "Remove",
    program: "Program",
    programName: "Display name (optional)",
    kind: "Cleaning type",
    confirmation: "Always confirm start",
    duplicateProgram: "This program has already been added.",
    missingRobot: "Please select a vacuum entity.",
    unknownValue: "Unknown value",
    viewCombined: "Robot and dock",
    viewRobot: "Robot only",
    viewDock: "Dock only",
    densityAuto: "Automatic",
    densityCompact: "Compact",
    densityComfortable: "Comfortable",
    densityDetailed: "Detailed",
    appearanceAdaptive: "Match dashboard/theme (recommended)",
    appearanceAccent: "Accent-rich",
    quickInfo: "Quick information",
    quickInfoHint:
      "Choose the compact values shown below the status. Name and status always remain visible.",
    visibleSections: "Visible sections",
    visibleSectionsHint: "Choose which sections the card should display.",
    alertsSafety:
      "Warnings always remain visible for safety and cannot be hidden here.",
    sectionActivity: "Activity",
    sectionControls: "Controls",
    sectionPrograms: "Programs",
    sectionDock: "Dock",
    sectionDetails: "Robot settings",
    sectionMaintenance: "Maintenance",
    sectionMap: "Map",
    sectionDiagnostics: "Technical diagnostics",
    kindVacuum: "Vacuum",
    kindMop: "Mop",
    kindCombo: "Vacuum and mop",
    kindUnknown: "Not specified",
    status: "Status",
    battery: "Battery",
    charging: "Charging state",
    cleaning: "Cleaning",
    progress: "Cleaning progress",
    area: "Cleaned area",
    duration: "Cleaning duration",
    last_start: "Last cleaning start",
    last_end: "Last cleaning end",
    map: "Map",
    vacuum_mode: "Vacuum mode",
    mop_mode: "Mop mode",
    mop_intensity: "Mop intensity",
    volume: "Volume",
    mop_attached: "Mop attached",
    water_tank_attached: "Water tank attached",
    water_shortage: "Water shortage",
    vacuum_error: "Vacuum error",
    dock: "Dock",
    dockHint: "Configure the cleaning dock's display, activities, levels, and settings.",
    dockDisplay: "Display",
    displayExpanded: "Expanded",
    displayCollapsed: "Collapsed",
    displayHidden: "Hidden",
    dockError: "Dock error",
    mopDrying: "Mop drying",
    dryingRemaining: "Drying time remaining",
    emptyingMode: "Emptying mode",
    childLock: "Child lock",
    cleanWaterTank: "Clean-water tank",
    dirtyWaterTank: "Dirty-water tank",
    cleaningSolution: "Cleaning solution",
    onMeaning: "Meaning of the “on” state",
    onUnknown: "Unknown / neutral",
    onOk: "OK",
    onWarning: "Warning",
    onActive: "Active",
    onInstalled: "Present / installed",
    onMissing: "Missing",
  },
} as const;

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }
  if (value !== null && typeof value === "object") {
    const clone: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      clone[key] = cloneValue(entry);
    }
    return clone as T;
  }
  return value;
}

/** Keep every program behind an explicit confirmation, including copied items. */
function withConfirmedPrograms(config: VacuumCardConfig): VacuumCardConfig {
  const next = cloneValue(config);
  if (!next.programs) {
    return next;
  }
  const items = (next.programs.items ?? []).map((item) => ({
    ...item,
    guard: "confirm" as const,
  }));
  return {
    ...next,
    programs: { ...next.programs, guard: "confirm", items },
  };
}

function eventValue(event: Event): string {
  if (event instanceof CustomEvent) {
    const detail = event.detail as { value?: unknown } | null;
    if (typeof detail?.value === "string") {
      return detail.value;
    }
  }
  const target = event.currentTarget as HTMLInputElement | HTMLSelectElement | null;
  return typeof target?.value === "string" ? target.value : "";
}

export class VacuumCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _newProgramEntity: { state: true },
    _programMessage: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
      --editor-accent: var(--primary-color, #4f8f83);
    }
    * { box-sizing: border-box; }
    .editor { display: grid; gap: 16px; }
    h2, h3, p { margin: 0; }
    h2 { font-size: 1.2rem; font-weight: 650; letter-spacing: -0.01em; }
    h3 { font-size: 1rem; font-weight: 650; }
    .section {
      display: grid;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.24));
      border-radius: 14px;
      background: var(--card-background-color, var(--ha-card-background, transparent));
    }
    .section-heading { display: grid; gap: 4px; }
    .hint, .empty, .source-note {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
      line-height: 1.4;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
    .field { display: grid; gap: 6px; min-width: 0; }
    .field.full { grid-column: 1 / -1; }
    label {
      color: var(--secondary-text-color);
      font-size: 0.79rem;
      font-weight: 600;
    }
    input:not([type="checkbox"]), select {
      width: 100%;
      min-height: 44px;
      padding: 0 12px;
      border: 1px solid var(--outline-color, var(--divider-color, #9a9a9a));
      border-radius: 10px;
      outline: none;
      background: var(--card-background-color, var(--ha-card-background, transparent));
      color: var(--primary-text-color);
      font: inherit;
    }
    input:not([type="checkbox"]):focus, select:focus {
      border-color: var(--editor-accent);
      box-shadow: 0 0 0 1px var(--editor-accent);
    }
    fieldset {
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    legend {
      margin-bottom: 8px;
      color: var(--primary-text-color);
      font-size: 0.9rem;
      font-weight: 650;
    }
    .choice-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .checkbox-option {
      display: flex;
      min-height: 44px;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.24));
      border-radius: 10px;
      color: var(--primary-text-color);
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
    }
    .checkbox-option:hover {
      background: color-mix(in srgb, var(--secondary-background-color, #f1f1f1) 58%, transparent);
    }
    .checkbox-option:focus-within {
      border-color: var(--editor-accent);
      box-shadow: 0 0 0 1px var(--editor-accent);
    }
    .checkbox-option input {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
      margin: 0;
      accent-color: var(--editor-accent);
      cursor: pointer;
    }
    .safety-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--warning-color, #ad6700) 10%, transparent);
      color: var(--secondary-text-color);
      font-size: 0.84rem;
      line-height: 1.4;
    }
    .safety-note::before {
      content: "⚠";
      color: var(--warning-color, #ad6700);
      font-weight: 700;
    }
    ha-entity-picker { display: block; width: 100%; }
    .program-list { display: grid; gap: 10px; }
    .program {
      display: grid;
      gap: 12px;
      padding: 13px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--secondary-background-color, #f1f1f1) 72%, transparent);
    }
    .program-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .program-title {
      min-width: 0;
      font-size: 0.9rem;
      font-weight: 650;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .safe {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--success-color, #2e7d62);
      font-size: 0.78rem;
      font-weight: 600;
    }
    .safe::before {
      content: "✓";
      display: inline-grid;
      width: 18px;
      height: 18px;
      place-items: center;
      border-radius: 50%;
      background: color-mix(in srgb, currentColor 14%, transparent);
    }
    .add-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      gap: 10px;
    }
    button {
      min-height: 40px;
      padding: 0 14px;
      border: 0;
      border-radius: 10px;
      background: var(--editor-accent);
      color: var(--text-primary-color, white);
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }
    button.secondary {
      min-height: 34px;
      padding: 0 10px;
      background: transparent;
      color: var(--error-color, #c62828);
    }
    button:hover:not(:disabled) { filter: brightness(1.05); }
    button:focus-visible { outline: 2px solid var(--editor-accent); outline-offset: 2px; }
    button:disabled { cursor: default; opacity: 0.45; }
    .warning { color: var(--warning-color, #ad6700); font-size: 0.84rem; }
    @media (max-width: 600px) {
      .add-row, .choice-grid { grid-template-columns: 1fr; }
    }
  `;

  public hass?: HomeAssistant;
  private _config?: VacuumCardConfig;
  private _newProgramEntity = "";
  private _programMessage = "";

  public setConfig(config: VacuumCardConfig): void {
    // Frozen configs are valid input; never retain or mutate the caller's value.
    this._config = withConfirmedPrograms(config);
    this._newProgramEntity = "";
    this._programMessage = "";
  }

  protected render(): TemplateResult {
    const config = this._config;
    if (!config) return html``;
    const t = TRANSLATIONS[this._language];
    const programs = config.programs?.items ?? [];
    const overviewItems = new Set(this._effectiveOverviewItems(config));
    const visibleSections = new Set(this._effectiveSectionOrder(config));
    const sectionLabels: Record<SelectableSection, string> = {
      activity: t.sectionActivity,
      controls: t.sectionControls,
      programs: t.sectionPrograms,
      dock: t.sectionDock,
      details: t.sectionDetails,
      maintenance: t.sectionMaintenance,
      map: t.sectionMap,
      diagnostics: t.sectionDiagnostics,
    };

    return html`
      <div class="editor">
        <h2>${t.title}</h2>
        <section class="section" aria-labelledby="basic-heading">
          <div class="section-heading">
            <h3 id="basic-heading">${t.basic}</h3>
            <p class="hint">${t.basicHint}</p>
          </div>
          <div class="grid">
            <div class="field full">
              ${this._entityPicker(config.entity ?? "", ["vacuum"], t.robot, (value) =>
                this._updateTopLevel("entity", value),
              )}
              ${!config.entity ? html`<span class="warning">${t.missingRobot}</span>` : nothing}
            </div>
            <div class="field full">
              <label for="card-name">${t.name}</label>
              <input id="card-name" type="text" .value=${config.name ?? ""}
                @input=${(event: Event) => this._updateTopLevel("name", eventValue(event))} />
            </div>
            <div class="field">
              <label for="card-view">${t.view}</label>
              <select id="card-view" .value=${config.view ?? "combined"}
                @change=${(event: Event) => this._updateTopLevel("view", eventValue(event))}>
                ${this._unknownOption(config.view, VIEWS)}
                <option value="combined">${t.viewCombined}</option>
                <option value="robot">${t.viewRobot}</option>
                <option value="dock">${t.viewDock}</option>
              </select>
            </div>
            <div class="field">
              <label for="card-density">${t.density}</label>
              <select id="card-density" .value=${config.density ?? "auto"}
                @change=${(event: Event) => this._updateTopLevel("density", eventValue(event))}>
                ${this._unknownOption(config.density, DENSITIES)}
                <option value="auto">${t.densityAuto}</option>
                <option value="compact">${t.densityCompact}</option>
                <option value="comfortable">${t.densityComfortable}</option>
                <option value="detailed">${t.densityDetailed}</option>
              </select>
            </div>
            <div class="field">
              <label for="card-appearance">${t.appearance}</label>
              <select id="card-appearance"
                @change=${(event: Event) => this._updateTopLevel("appearance", eventValue(event))}>
                ${this._unknownOption(config.appearance, APPEARANCES)}
                <option value="adaptive" .selected=${config.appearance === undefined || config.appearance === "adaptive"}>
                  ${t.appearanceAdaptive}
                </option>
                <option value="accent" .selected=${config.appearance === "accent"}>
                  ${t.appearanceAccent}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="section" aria-labelledby="quick-info-heading">
          <div class="section-heading">
            <h3 id="quick-info-heading">${t.quickInfo}</h3>
            <p class="hint" id="quick-info-hint">${t.quickInfoHint}</p>
          </div>
          <fieldset aria-labelledby="quick-info-heading" aria-describedby="quick-info-hint">
            <div class="choice-grid">
              ${OVERVIEW_ITEMS.map((item) => html`
                <label class="checkbox-option" for="overview-${item}">
                  <input
                    id="overview-${item}"
                    type="checkbox"
                    .checked=${overviewItems.has(item)}
                    @change=${(event: Event) =>
                      this._updateOverviewItem(
                        item,
                        (event.currentTarget as HTMLInputElement).checked,
                      )}
                  />
                  <span>${t[item]}</span>
                </label>
              `)}
            </div>
          </fieldset>
        </section>

        <section class="section" aria-labelledby="visible-sections-heading">
          <div class="section-heading">
            <h3 id="visible-sections-heading">${t.visibleSections}</h3>
            <p class="hint" id="visible-sections-hint">${t.visibleSectionsHint}</p>
          </div>
          <fieldset
            aria-labelledby="visible-sections-heading"
            aria-describedby="visible-sections-hint alerts-safety-note"
          >
            <div class="choice-grid">
              ${SELECTABLE_SECTIONS.map((section) => html`
                <label class="checkbox-option" for="section-${section}">
                  <input
                    id="section-${section}"
                    type="checkbox"
                    .checked=${visibleSections.has(section)}
                    @change=${(event: Event) =>
                      this._updateSection(
                        section,
                        (event.currentTarget as HTMLInputElement).checked,
                      )}
                  />
                  <span>${sectionLabels[section]}</span>
                </label>
              `)}
            </div>
          </fieldset>
          <p class="safety-note" id="alerts-safety-note">${t.alertsSafety}</p>
        </section>

        <section class="section" aria-labelledby="entities-heading">
          <div class="section-heading">
            <h3 id="entities-heading">${t.entities}</h3>
            <p class="hint">${t.entitiesHint}</p>
          </div>
          <div class="grid">
            ${ENTITY_FIELDS.map((field) => html`
              <div class="field">
                ${this._entityPicker(
                  config.entities?.[field.key] ?? "",
                  field.domains,
                  t[field.key],
                  (value) => this._updateSemanticEntity(field.key, value),
                )}
              </div>
            `)}
          </div>
        </section>

        <section class="section" aria-labelledby="dock-heading">
          <div class="section-heading">
            <h3 id="dock-heading">${t.dock}</h3>
            <p class="hint">${t.dockHint}</p>
          </div>
          <div class="grid">
            <div class="field full">
              <label for="dock-display">${t.dockDisplay}</label>
              <select id="dock-display" .value=${config.dock?.display ?? "collapsed"}
                @change=${(event: Event) => this._updateDockDisplay(eventValue(event))}>
                ${this._unknownOption(config.dock?.display, DISPLAY_MODES)}
                <option value="expanded">${t.displayExpanded}</option>
                <option value="collapsed">${t.displayCollapsed}</option>
                <option value="hidden">${t.displayHidden}</option>
              </select>
            </div>
            <div class="field">
              ${this._entityPicker(
                config.dock?.entities?.error ?? "",
                ["sensor"],
                t.dockError,
                (value) => this._updateSimpleDockEntity("error", value),
              )}
            </div>
            <div class="field">
              ${this._entityPicker(
                config.dock?.entities?.mop_drying ?? "",
                ["binary_sensor"],
                t.mopDrying,
                (value) => this._updateSimpleDockEntity("mop_drying", value),
              )}
            </div>
            <div class="field">
              ${this._entityPicker(
                config.dock?.entities?.drying_remaining ?? "",
                ["sensor"],
                t.dryingRemaining,
                (value) => this._updateSimpleDockEntity("drying_remaining", value),
              )}
            </div>
            <div class="field">
              ${this._entityPicker(
                config.dock?.entities?.emptying_mode ?? "",
                ["select"],
                t.emptyingMode,
                (value) => this._updateSimpleDockEntity("emptying_mode", value),
              )}
            </div>
            <div class="field">
              ${this._entityPicker(
                config.dock?.entities?.child_lock ?? "",
                ["switch"],
                t.childLock,
                (value) => this._updateSimpleDockEntity("child_lock", value),
              )}
            </div>
            ${this._renderBinaryDockField(
              "clean_water_tank",
              config.dock?.entities?.clean_water_tank,
              t.cleanWaterTank,
            )}
            ${this._renderBinaryDockField(
              "dirty_water_tank",
              config.dock?.entities?.dirty_water_tank,
              t.dirtyWaterTank,
            )}
            ${this._renderBinaryDockField(
              "cleaning_solution",
              config.dock?.entities?.cleaning_solution,
              t.cleaningSolution,
            )}
          </div>
        </section>

        <section class="section" aria-labelledby="programs-heading">
          <div class="section-heading">
            <h3 id="programs-heading">${t.programs}</h3>
            <p class="hint">${t.programsHint}</p>
          </div>
          <div class="safe">${t.confirmation}</div>
          ${programs.length === 0
            ? html`<p class="empty">${t.noPrograms}</p>`
            : html`<div class="program-list">
                ${programs.map((program, index) => this._renderProgram(program, index))}
              </div>`}
          <div class="add-row">
            <div class="field">
              ${this._entityPicker(this._newProgramEntity, ["button"], t.chooseButton, (value) => {
                this._newProgramEntity = value;
                this._programMessage = "";
              })}
            </div>
            <button type="button" ?disabled=${!this._newProgramEntity} @click=${this._addProgram}>
              ${t.add}
            </button>
          </div>
          ${this._programMessage
            ? html`<p class="warning" role="status">${this._programMessage}</p>`
            : nothing}
        </section>
      </div>
    `;
  }

  private get _language(): Language {
    const language =
      this.hass?.locale?.language ?? this.hass?.language ?? globalThis.navigator?.language ?? "en";
    return language.toLowerCase().startsWith("de") ? "de" : "en";
  }

  private _entityPicker(
    value: string,
    domains: string[],
    label: string,
    onChange: (value: string) => void,
  ): TemplateResult {
    return html`<ha-entity-picker
      .hass=${this.hass}
      .value=${value}
      .label=${label}
      .includeDomains=${domains}
      .allowCustomEntity=${true}
      @value-changed=${(event: Event) => onChange(eventValue(event))}
    ></ha-entity-picker>`;
  }

  private _unknownOption<T extends string>(
    value: string | undefined,
    knownValues: readonly T[],
  ): TemplateResult | typeof nothing {
    if (!value || knownValues.includes(value as T)) return nothing;
    return html`<option value=${value} .selected=${true}>
      ${TRANSLATIONS[this._language].unknownValue}: ${value}
    </option>`;
  }

  private _renderProgram(program: ProgramConfig, index: number): TemplateResult {
    const t = TRANSLATIONS[this._language];
    const sourceName =
      program.name ||
      (program.entity ? this.hass?.states[program.entity]?.attributes.friendly_name : undefined) ||
      program.entity ||
      `${t.program} ${index + 1}`;
    const runtimeKind = program.kind as string | undefined;

    return html`<article class="program">
      <div class="program-head">
        <span class="program-title" title=${sourceName}>${sourceName}</span>
        <button class="secondary" type="button" aria-label="${t.remove}: ${sourceName}"
          @click=${() => this._removeProgram(index)}>${t.remove}</button>
      </div>
      <div class="grid">
        <div class="field full">
          ${program.action && !program.entity
            ? html`<span class="source-note">Home Assistant action</span>`
            : this._entityPicker(program.entity ?? "", ["button"], t.chooseButton, (value) =>
                this._updateProgramEntity(index, value),
              )}
        </div>
        <div class="field">
          <label for="program-name-${index}">${t.programName}</label>
          <input id="program-name-${index}" type="text" .value=${program.name ?? ""}
            @input=${(event: Event) => this._updateProgramName(index, eventValue(event))} />
        </div>
        <div class="field">
          <label for="program-kind-${index}">${t.kind}</label>
          <select id="program-kind-${index}" .value=${runtimeKind ?? "unknown"}
            @change=${(event: Event) => this._updateProgram(index, { kind: eventValue(event) as TaskKind })}>
            ${this._unknownOption(runtimeKind, PROGRAM_KINDS)}
            <option value="vacuum">${t.kindVacuum}</option>
            <option value="mop">${t.kindMop}</option>
            <option value="combo">${t.kindCombo}</option>
            <option value="unknown">${t.kindUnknown}</option>
          </select>
        </div>
      </div>
    </article>`;
  }

  private _renderBinaryDockField(
    key: BinaryDockEntityKey,
    config: string | BinaryEntityConfig | undefined,
    label: string,
  ): TemplateResult {
    const t = TRANSLATIONS[this._language];
    const entityId = typeof config === "string" ? config : config?.entity ?? "";
    const runtimeOnMeaning = typeof config === "object"
      ? config.on_is as string | undefined
      : undefined;
    const onMeaning = runtimeOnMeaning ?? "unknown";

    return html`<div class="field">
      ${this._entityPicker(entityId, ["binary_sensor"], label, (value) =>
        this._updateBinaryDockEntity(key, value))}
      <label for="dock-${key}-on-is">${t.onMeaning}</label>
      <select id="dock-${key}-on-is" .value=${onMeaning} ?disabled=${!entityId}
        @change=${(event: Event) =>
          this._updateBinaryDockMeaning(key, eventValue(event) as BinaryOnMeaning)}>
        ${this._unknownOption(runtimeOnMeaning, BINARY_ON_MEANINGS)}
        <option value="unknown">${t.onUnknown}</option>
        <option value="ok">${t.onOk}</option>
        <option value="warning">${t.onWarning}</option>
        <option value="active">${t.onActive}</option>
        <option value="installed">${t.onInstalled}</option>
        <option value="missing">${t.onMissing}</option>
      </select>
    </div>`;
  }

  private _effectiveOverviewItems(config: VacuumCardConfig): readonly OverviewItem[] {
    if (config.overview?.items !== undefined) return config.overview.items;
    return config.density === "compact" ? ["battery"] : OVERVIEW_ITEMS;
  }

  private _effectiveSectionOrder(config: VacuumCardConfig): readonly string[] {
    if (config.sections?.order !== undefined) return config.sections.order;
    if (config.density !== "compact") return SECTION_ORDER;
    return config.view === "dock" ? COMPACT_DOCK_SECTION_ORDER : COMPACT_SECTION_ORDER;
  }

  private _updateOverviewItem(item: OverviewItem, enabled: boolean): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    const current = this._effectiveOverviewItems(config) as readonly string[];
    const selected = new Set(current);
    if (enabled) selected.add(item);
    else selected.delete(item);

    const knownItems = OVERVIEW_ITEMS.filter((candidate) => selected.has(candidate));
    const unknownItems = current.filter(
      (candidate, index) =>
        !OVERVIEW_ITEMS.includes(candidate as OverviewItem) && current.indexOf(candidate) === index,
    );
    next.overview = {
      ...(next.overview ?? {}),
      items: [...knownItems, ...unknownItems] as OverviewItem[],
    };
    this._commit(next);
  }

  private _updateSection(section: SelectableSection, enabled: boolean): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    const current = this._effectiveSectionOrder(config);
    const selected = new Set(current);
    if (enabled) selected.add(section);
    else selected.delete(section);
    selected.add("alerts");

    const knownSections = SECTION_ORDER.filter((candidate) => selected.has(candidate));
    const unknownSections = current.filter(
      (candidate, index) =>
        !SECTION_ORDER.includes(candidate as (typeof SECTION_ORDER)[number]) &&
        current.indexOf(candidate) === index,
    );
    next.sections = {
      ...(next.sections ?? {}),
      order: [...knownSections, ...unknownSections],
    };
    this._commit(next);
  }

  private _updateTopLevel(
    key: "entity" | "name" | "view" | "density" | "appearance",
    value: string,
  ): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    if (key === "name") {
      if (value) next.name = value;
      else delete next.name;
    } else if (key === "entity") {
      next.entity = value;
    } else if (key === "view") {
      next.view = value as VacuumView;
    } else if (key === "density") {
      next.density = value as Density;
    } else {
      next.appearance = value as Appearance;
    }
    this._commit(next);
  }

  private _updateSemanticEntity(key: SemanticEntityKey, value: string): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    const entities = { ...(next.entities ?? {}) } as SemanticEntitiesConfig & Record<string, unknown>;
    if (value) entities[key] = value;
    else delete entities[key];
    if (Object.keys(entities).length > 0) next.entities = entities;
    else delete next.entities;
    this._commit(next);
  }

  private _updateDockDisplay(value: string): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    next.dock = { ...(next.dock ?? {}), display: value as DisplayMode };
    this._commit(next);
  }

  private _updateSimpleDockEntity(key: SimpleDockEntityKey, value: string): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    const dock = { ...(next.dock ?? {}) };
    const entities = {
      ...(dock.entities ?? {}),
    } as DockEntitiesConfig & Record<string, unknown>;
    if (value) entities[key] = value;
    else delete entities[key];
    this._replaceDockEntities(next, dock, entities);
  }

  private _updateBinaryDockEntity(key: BinaryDockEntityKey, value: string): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    const dock = { ...(next.dock ?? {}) };
    const entities = {
      ...(dock.entities ?? {}),
    } as DockEntitiesConfig & Record<string, unknown>;
    const current = entities[key];

    if (value) {
      const currentConfig = typeof current === "object" && current !== null
        ? current as BinaryEntityConfig & Record<string, unknown>
        : undefined;
      entities[key] = {
        ...(currentConfig ?? {}),
        entity: value,
        on_is: currentConfig?.on_is ?? "unknown",
      };
    } else {
      delete entities[key];
    }
    this._replaceDockEntities(next, dock, entities);
  }

  private _updateBinaryDockMeaning(key: BinaryDockEntityKey, onIs: BinaryOnMeaning): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    const dock = { ...(next.dock ?? {}) };
    const entities = {
      ...(dock.entities ?? {}),
    } as DockEntitiesConfig & Record<string, unknown>;
    const current = entities[key];
    const entityId = typeof current === "string"
      ? current
      : typeof current === "object" && current !== null
        ? (current as BinaryEntityConfig).entity
        : undefined;
    if (!entityId) return;
    const currentConfig = typeof current === "object" && current !== null
      ? current as BinaryEntityConfig & Record<string, unknown>
      : {};
    entities[key] = { ...currentConfig, entity: entityId, on_is: onIs };
    this._replaceDockEntities(next, dock, entities);
  }

  private _replaceDockEntities(
    config: VacuumCardConfig,
    dock: NonNullable<VacuumCardConfig["dock"]>,
    entities: DockEntitiesConfig & Record<string, unknown>,
  ): void {
    if (Object.keys(entities).length > 0) dock.entities = entities;
    else delete dock.entities;
    config.dock = dock;
    this._commit(config);
  }

  private _addProgram = (): void => {
    const config = this._config;
    const entity = this._newProgramEntity;
    if (!config || !entity) return;
    const existing = config.programs?.items ?? [];
    if (existing.some((program) => program.entity === entity)) {
      this._programMessage = TRANSLATIONS[this._language].duplicateProgram;
      return;
    }
    const program: ProgramConfig = { entity, guard: "confirm", kind: "unknown" };
    const friendlyName = this.hass?.states[entity]?.attributes.friendly_name;
    if (friendlyName) program.name = friendlyName;
    const next = cloneValue(config);
    next.programs = {
      ...(next.programs ?? {}),
      guard: "confirm",
      items: [...(next.programs?.items ?? []), program],
    };
    this._newProgramEntity = "";
    this._programMessage = "";
    this._commit(next);
  };

  private _removeProgram(index: number): void {
    const config = this._config;
    if (!config?.programs) return;
    const next = cloneValue(config);
    const items = [...(next.programs?.items ?? [])];
    items.splice(index, 1);
    next.programs = { ...next.programs, guard: "confirm", items };
    this._commit(next);
  }

  private _updateProgram(index: number, patch: Partial<ProgramConfig>): void {
    const config = this._config;
    const current = config?.programs?.items?.[index];
    if (!config || !current) return;
    const next = cloneValue(config);
    const items = [...(next.programs?.items ?? [])];
    const updated: ProgramConfig = { ...items[index], ...patch, guard: "confirm" };
    items[index] = updated;
    next.programs = { ...(next.programs ?? {}), guard: "confirm", items };
    this._commit(next);
  }

  private _updateProgramName(index: number, name: string): void {
    const config = this._config;
    const current = config?.programs?.items?.[index];
    if (!config || !current) return;
    const updated = cloneValue(current);
    if (name) updated.name = name;
    else delete updated.name;
    updated.guard = "confirm";
    this._replaceProgram(index, updated);
  }

  private _updateProgramEntity(index: number, entity: string): void {
    const config = this._config;
    const current = config?.programs?.items?.[index];
    if (!config || !current) return;
    const updated = cloneValue(current);
    if (entity) {
      updated.entity = entity;
      delete updated.action;
    } else delete updated.entity;
    updated.guard = "confirm";
    this._replaceProgram(index, updated);
  }

  private _replaceProgram(index: number, program: ProgramConfig): void {
    const config = this._config;
    if (!config) return;
    const next = cloneValue(config);
    const items = [...(next.programs?.items ?? [])];
    items[index] = program;
    next.programs = { ...(next.programs ?? {}), guard: "confirm", items };
    this._commit(next);
  }

  private _commit(config: VacuumCardConfig): void {
    const safeConfig = withConfirmedPrograms(config);
    this._config = safeConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: cloneValue(safeConfig) },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get("vacuum-control-card-editor")) {
  customElements.define("vacuum-control-card-editor", VacuumCardEditor);
}

declare global {
  interface HTMLElementTagNameMap {
    "vacuum-control-card-editor": VacuumCardEditor;
  }
}
