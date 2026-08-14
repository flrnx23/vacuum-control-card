import type {
  ConfigurationWarning,
  DashboardActionConfig,
  GuardMode,
  NormalizedVacuumCardConfig,
  OverviewItem,
  ProgramConfig,
  ProgramRequirement,
  SemanticEntitiesConfig,
  VacuumCardConfig,
} from "./types";

export const DEFAULT_ACKNOWLEDGEMENT_TIMEOUT_MS = 15_000;

const DEFAULT_CLEAR_STATES = ["0", "none", "ok", "no_error"] as const;
const DEFAULT_SECTION_ORDER = [
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
const COMPACT_DEFAULT_SECTION_ORDER = [
  "activity",
  "controls",
  "programs",
  "alerts",
] as const;
const COMPACT_DOCK_SECTION_ORDER = [
  "alerts",
  "dock",
  "maintenance",
  "diagnostics",
] as const;
const DEFAULT_OVERVIEW_ITEMS = [
  "battery",
  "progress",
  "area",
  "duration",
] as const satisfies readonly OverviewItem[];
const COMPACT_DEFAULT_OVERVIEW_ITEMS = ["battery"] as const satisfies readonly OverviewItem[];

const VACUUM_VIEWS = ["combined", "robot", "dock"] as const;
const DENSITIES = ["auto", "compact", "comfortable", "detailed"] as const;
const APPEARANCES = ["adaptive", "accent"] as const;
const OVERVIEW_ITEMS = ["battery", "progress", "area", "duration"] as const;
const DISPLAY_MODES = ["expanded", "collapsed", "hidden"] as const;
const GUARD_MODES = ["confirm"] as const;
const TASK_KINDS = ["vacuum", "mop", "combo", "unknown"] as const;
const BINARY_ON_MEANINGS = ["ok", "warning", "active", "installed", "missing", "unknown"] as const;
const ANIMATION_INTENSITIES = ["none", "subtle", "expressive"] as const;
const ACTION_TYPES = [
  "more-info",
  "toggle",
  "perform-action",
  "navigate",
  "url",
  "assist",
  "none",
] as const;
const REQUIREMENT_CONDITIONS = [
  "status",
  "battery",
  "charging",
  "cleaning",
  "progress",
  "area",
  "duration",
  "last_start",
  "last_end",
  "map",
  "vacuum_mode",
  "mop_mode",
  "mop_intensity",
  "volume",
  "mop_attached",
  "water_tank_attached",
  "water_shortage",
  "vacuum_error",
] as const satisfies readonly (keyof SemanticEntitiesConfig)[];

const ENTITY_ID_PATTERN = /^[a-z0-9_]+\.[a-z0-9_]+$/;

type PlainRecord = Record<string, unknown>;

/** A configuration error that is safe to show in Home Assistant's card error UI. */
export class VacuumCardConfigError extends Error {
  public constructor(message: string) {
    super(`Vacuum Control Card: ${message}`);
    this.name = "VacuumCardConfigError";
  }
}

function isRecord(value: unknown): value is PlainRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function includesValue<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function assertOptionalRecord(value: unknown, path: string): void {
  if (value !== undefined && !isRecord(value)) {
    throw new VacuumCardConfigError(`"${path}" muss ein Objekt sein.`);
  }
}

function assertOptionalArray(value: unknown, path: string): void {
  if (value !== undefined && !Array.isArray(value)) {
    throw new VacuumCardConfigError(`"${path}" muss eine Liste sein.`);
  }
}

function assertEntityId(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || !ENTITY_ID_PATTERN.test(value)) {
    throw new VacuumCardConfigError(
      `"${path}" muss eine gültige Home-Assistant-Entitäts-ID sein.`,
    );
  }
}

function assertOptionalString(value: unknown, path: string): void {
  if (value !== undefined && typeof value !== "string") {
    throw new VacuumCardConfigError(`"${path}" muss Text sein.`);
  }
}

function assertOptionalBoolean(value: unknown, path: string): void {
  if (value !== undefined && typeof value !== "boolean") {
    throw new VacuumCardConfigError(`"${path}" muss true oder false sein.`);
  }
}

function assertOptionalFiniteNumber(value: unknown, path: string): void {
  if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value))) {
    throw new VacuumCardConfigError(`"${path}" muss eine endliche Zahl sein.`);
  }
}

function assertStringArray(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new VacuumCardConfigError(`"${path}" muss eine Liste aus Textwerten sein.`);
  }
}

function assertOptionalEnum<T extends string>(
  value: unknown,
  values: readonly T[],
  path: string,
): asserts value is T | undefined {
  if (value !== undefined && !includesValue(values, value)) {
    throw new VacuumCardConfigError(
      `"${path}" muss einer der Werte ${values.join(", ")} sein.`,
    );
  }
}

/**
 * Asserts both the syntax and domain of an entity id.
 *
 * Home Assistant entity ids are deliberately checked strictly here so that a
 * typo cannot redirect a write action to another domain.
 */
export function assertEntityDomain(
  value: unknown,
  expectedDomain: string,
  path = "entity",
): asserts value is string {
  if (typeof value !== "string" || !ENTITY_ID_PATTERN.test(value)) {
    throw new VacuumCardConfigError(
      `"${path}" muss eine g\u00fcltige ${expectedDomain}-Entit\u00e4ts-ID sein (z. B. "${expectedDomain}.mein_geraet").`,
    );
  }

  const domain = value.slice(0, value.indexOf("."));
  if (domain !== expectedDomain) {
    throw new VacuumCardConfigError(
      `"${path}" muss zur Domain "${expectedDomain}" geh\u00f6ren; erhalten wurde "${domain}".`,
    );
  }
}

export function assertVacuumEntityId(
  value: unknown,
  path = "entity",
): asserts value is string {
  assertEntityDomain(value, "vacuum", path);
}

export function assertButtonEntityId(
  value: unknown,
  path = "programs.items[].entity",
): asserts value is string {
  assertEntityDomain(value, "button", path);
}

export function assertSafeGuard(
  value: unknown,
  path = "programs.guard",
): asserts value is GuardMode {
  if (!includesValue(GUARD_MODES, value)) {
    throw new VacuumCardConfigError(
      `"${path}" darf nicht ungesichert sein. Erlaubt ist nur "confirm".`,
    );
  }
}

function assertConfirmation(value: unknown, path: string): void {
  if (value === undefined || typeof value === "boolean") {
    return;
  }

  if (!isRecord(value)) {
    throw new VacuumCardConfigError(
      `"${path}" muss true, false oder ein Best\u00e4tigungsobjekt sein.`,
    );
  }

  for (const key of ["title", "text", "confirm_text", "dismiss_text"] as const) {
    const field = value[key];
    if (field !== undefined && typeof field !== "string") {
      throw new VacuumCardConfigError(`"${path}.${key}" muss Text sein.`);
    }
  }
}

function assertDashboardAction(
  value: unknown,
  path: string,
): asserts value is DashboardActionConfig {
  if (!isRecord(value)) {
    throw new VacuumCardConfigError(`"${path}" muss eine Dashboard-Aktion sein.`);
  }

  if (!includesValue(ACTION_TYPES, value.action)) {
    throw new VacuumCardConfigError(
      `"${path}.action" enth\u00e4lt keinen unterst\u00fctzten Dashboard-Aktionstyp.`,
    );
  }

  assertConfirmation(value.confirmation, `${path}.confirmation`);
  for (const key of ["perform_action", "navigation_path", "url_path"] as const) {
    assertOptionalString(value[key], `${path}.${key}`);
  }
  assertOptionalRecord(value.target, `${path}.target`);
  assertOptionalRecord(value.data, `${path}.data`);

  if (value.action === "perform-action" && typeof value.perform_action !== "string") {
    throw new VacuumCardConfigError(
      `"${path}.perform_action" ist für eine perform-action-Aktion erforderlich.`,
    );
  }
  if (value.action === "navigate" && typeof value.navigation_path !== "string") {
    throw new VacuumCardConfigError(
      `"${path}.navigation_path" ist für eine navigate-Aktion erforderlich.`,
    );
  }
  if (value.action === "url" && typeof value.url_path !== "string") {
    throw new VacuumCardConfigError(
      `"${path}.url_path" ist für eine url-Aktion erforderlich.`,
    );
  }
}

function assertRequirement(
  value: unknown,
  path: string,
): asserts value is ProgramRequirement {
  if (!isRecord(value)) {
    throw new VacuumCardConfigError(`"${path}" muss ein Objekt sein.`);
  }

  if (!includesValue(REQUIREMENT_CONDITIONS, value.condition)) {
    throw new VacuumCardConfigError(
      `"${path}.condition" referenziert keine unterst\u00fctzte semantische Entit\u00e4t.`,
    );
  }

  if (
    typeof value.expected !== "boolean" &&
    typeof value.expected !== "string" &&
    typeof value.expected !== "number"
  ) {
    throw new VacuumCardConfigError(
      `"${path}.expected" muss boolean, Text oder eine Zahl sein.`,
    );
  }
  if (typeof value.expected === "number" && !Number.isFinite(value.expected)) {
    throw new VacuumCardConfigError(`"${path}.expected" muss eine endliche Zahl sein.`);
  }

  if (
    value.severity !== undefined &&
    !includesValue(["block", "warn", "ignore"] as const, value.severity)
  ) {
    throw new VacuumCardConfigError(
      `"${path}.severity" muss "block", "warn" oder "ignore" sein.`,
    );
  }

  if (value.message !== undefined && typeof value.message !== "string") {
    throw new VacuumCardConfigError(`"${path}.message" muss Text sein.`);
  }
}

/** Validate a single program, including its mandatory exclusive source. */
export function assertProgramConfig(
  value: unknown,
  index = 0,
): asserts value is ProgramConfig {
  const path = `programs.items[${index}]`;
  if (!isRecord(value)) {
    throw new VacuumCardConfigError(`"${path}" muss ein Objekt sein.`);
  }

  const hasEntity = value.entity !== undefined;
  const hasAction = value.action !== undefined;
  if (hasEntity === hasAction) {
    throw new VacuumCardConfigError(
      `"${path}" muss genau eine Quelle aus "entity" oder "action" besitzen.`,
    );
  }

  if (hasEntity) {
    assertButtonEntityId(value.entity, `${path}.entity`);
  } else {
    assertDashboardAction(value.action, `${path}.action`);
  }

  for (const key of ["name", "icon", "description", "color"] as const) {
    assertOptionalString(value[key], `${path}.${key}`);
  }
  assertOptionalBoolean(value.hidden, `${path}.hidden`);
  if (value.confirmation !== undefined) {
    assertConfirmation(value.confirmation, `${path}.confirmation`);
  }

  if (value.guard !== undefined) {
    assertSafeGuard(value.guard, `${path}.guard`);
  }

  if (value.kind !== undefined && !includesValue(TASK_KINDS, value.kind)) {
    throw new VacuumCardConfigError(
      `"${path}.kind" muss vacuum, mop, combo oder unknown sein.`,
    );
  }

  if (value.requires !== undefined) {
    if (!Array.isArray(value.requires)) {
      throw new VacuumCardConfigError(`"${path}.requires" muss eine Liste sein.`);
    }
    value.requires.forEach((requirement, requirementIndex) => {
      assertRequirement(requirement, `${path}.requires[${requirementIndex}]`);
    });
  }
}

/**
 * Converts a timeout into milliseconds. Numbers and unit-less strings are
 * interpreted as milliseconds; strings additionally support ms, s, m and h.
 */
export function parseAcknowledgementTimeout(
  value: string | number | undefined = DEFAULT_ACKNOWLEDGEMENT_TIMEOUT_MS,
): number {
  let milliseconds: number;

  if (typeof value === "number") {
    milliseconds = value;
  } else if (typeof value === "string") {
    const match = /^([0-9]+(?:\.[0-9]+)?)\s*(ms|s|m|h)?$/i.exec(value.trim());
    if (match === null) {
      throw new VacuumCardConfigError(
        '"programs.acknowledgement_timeout" muss eine positive Dauer wie "15s" oder eine Millisekundenzahl sein.',
      );
    }

    const amount = Number(match[1]);
    const unit = (match[2]?.toLowerCase() ?? "ms") as "ms" | "s" | "m" | "h";
    const factor = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000 }[unit];
    milliseconds = amount * factor;
  } else {
    throw new VacuumCardConfigError(
      '"programs.acknowledgement_timeout" muss Text oder eine Zahl sein.',
    );
  }

  const roundedMilliseconds = Math.round(milliseconds);
  if (!Number.isSafeInteger(roundedMilliseconds) || roundedMilliseconds <= 0) {
    throw new VacuumCardConfigError(
      '"programs.acknowledgement_timeout" muss gr\u00f6\u00dfer als 0 sein.',
    );
  }

  return roundedMilliseconds;
}

function assertSemanticEntities(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "entities");
  if (!isRecord(value)) return;
  for (const key of REQUIREMENT_CONDITIONS) {
    const entityId = value[key];
    if (entityId !== undefined) assertEntityId(entityId, `entities.${key}`);
  }
}

function assertControls(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "controls");
  if (!isRecord(value)) return;
  for (const key of ["start_pause", "stop", "return_home", "locate"] as const) {
    const setting = value[key];
    if (setting !== undefined && setting !== true && setting !== false && setting !== "auto") {
      throw new VacuumCardConfigError(
        `"controls.${key}" muss true, false oder "auto" sein.`,
      );
    }
  }
  assertOptionalBoolean(value.confirm_stop_while_active, "controls.confirm_stop_while_active");
  assertOptionalBoolean(value.confirm_return_while_active, "controls.confirm_return_while_active");
}

function assertOverview(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "overview");
  if (!isRecord(value) || value.items === undefined) return;
  if (!Array.isArray(value.items)) {
    throw new VacuumCardConfigError('"overview.items" muss eine Liste sein.');
  }
  value.items.forEach((item, index) => {
    if (!includesValue(OVERVIEW_ITEMS, item)) {
      throw new VacuumCardConfigError(
        `"overview.items[${index}]" muss einer der Werte ${OVERVIEW_ITEMS.join(", ")} sein.`,
      );
    }
  });
}

function assertBinaryEntityConfig(value: unknown, path: string): void {
  if (typeof value === "string") {
    assertEntityId(value, path);
    return;
  }
  if (!isRecord(value)) {
    throw new VacuumCardConfigError(`"${path}" muss eine Entitäts-ID oder ein Objekt sein.`);
  }
  assertEntityId(value.entity, `${path}.entity`);
  assertOptionalEnum(value.on_is, BINARY_ON_MEANINGS, `${path}.on_is`);
  assertOptionalString(value.name, `${path}.name`);
}

function assertDock(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "dock");
  if (!isRecord(value)) return;
  assertOptionalEnum(value.display, DISPLAY_MODES, "dock.display");
  for (const key of [
    "auto_expand_on_activity",
    "auto_expand_on_warning",
    "show_activity_in_header",
    "show_warnings_in_header",
  ] as const) {
    assertOptionalBoolean(value[key], `dock.${key}`);
  }
  assertOptionalRecord(value.entities, "dock.entities");
  if (!isRecord(value.entities)) return;
  for (const key of ["error", "mop_drying", "drying_remaining", "emptying_mode", "child_lock"] as const) {
    const entityId = value.entities[key];
    if (entityId !== undefined) assertEntityId(entityId, `dock.entities.${key}`);
  }
  for (const key of ["clean_water_tank", "dirty_water_tank", "cleaning_solution"] as const) {
    const binary = value.entities[key];
    if (binary !== undefined) assertBinaryEntityConfig(binary, `dock.entities.${key}`);
  }
}

function assertMaintenance(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "maintenance");
  if (!isRecord(value)) return;
  assertOptionalEnum(value.display, DISPLAY_MODES, "maintenance.display");
  assertOptionalRecord(value.defaults, "maintenance.defaults");
  if (isRecord(value.defaults)) {
    assertOptionalFiniteNumber(value.defaults.warning_below, "maintenance.defaults.warning_below");
    assertOptionalFiniteNumber(value.defaults.critical_below, "maintenance.defaults.critical_below");
  }
  if (value.items === undefined) return;
  if (!Array.isArray(value.items)) {
    throw new VacuumCardConfigError('"maintenance.items" muss eine Liste sein.');
  }
  value.items.forEach((item, index) => {
    const path = `maintenance.items[${index}]`;
    if (!isRecord(item)) {
      throw new VacuumCardConfigError(`"${path}" muss ein Objekt sein.`);
    }
    assertEntityId(item.entity, `${path}.entity`);
    for (const key of ["name", "icon", "kind"] as const) {
      assertOptionalString(item[key], `${path}.${key}`);
    }
    assertOptionalFiniteNumber(item.warning_below, `${path}.warning_below`);
    assertOptionalFiniteNumber(item.critical_below, `${path}.critical_below`);
  });
}

function assertDiagnostics(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "diagnostics");
  if (!isRecord(value)) return;
  assertOptionalEnum(value.display, DISPLAY_MODES, "diagnostics.display");
  if (value.items === undefined) return;
  if (!Array.isArray(value.items)) {
    throw new VacuumCardConfigError('"diagnostics.items" muss eine Liste sein.');
  }
  value.items.forEach((item, index) => {
    const path = `diagnostics.items[${index}]`;
    if (!isRecord(item)) {
      throw new VacuumCardConfigError(`"${path}" muss ein Objekt sein.`);
    }
    assertEntityId(item.entity, `${path}.entity`);
    assertOptionalString(item.name, `${path}.name`);
    assertOptionalString(item.icon, `${path}.icon`);
    assertOptionalEnum(item.confirmation, ["always", "never"] as const, `${path}.confirmation`);
  });
}

function assertAnimations(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "animations");
  if (!isRecord(value)) return;
  assertOptionalBoolean(value.enabled, "animations.enabled");
  assertOptionalEnum(value.intensity, ANIMATION_INTENSITIES, "animations.intensity");
  assertOptionalBoolean(value.respect_reduced_motion, "animations.respect_reduced_motion");
}

function assertErrorHandling(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "error_handling");
  if (!isRecord(value)) return;
  if (value.clear_states !== undefined) {
    assertStringArray(value.clear_states, "error_handling.clear_states");
  }
  assertOptionalBoolean(value.show_raw_unknown_states, "error_handling.show_raw_unknown_states");
}

function assertSections(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "sections");
  if (!isRecord(value)) return;
  if (value.order !== undefined) assertStringArray(value.order, "sections.order");
}

function assertStateMap(value: unknown): void {
  if (value === undefined) return;
  assertOptionalRecord(value, "state_map");
  if (!isRecord(value)) return;
  for (const group of ["activity", "task_kind"] as const) {
    const mapping = value[group];
    if (mapping === undefined) continue;
    if (!isRecord(mapping)) {
      throw new VacuumCardConfigError(`"state_map.${group}" muss ein Objekt sein.`);
    }
    for (const [key, states] of Object.entries(mapping)) {
      assertStringArray(states, `state_map.${group}.${key}`);
    }
  }
}

/** Runtime assertion used by both YAML configuration and the visual editor. */
export function assertConfig(
  value: unknown,
): asserts value is VacuumCardConfig {
  if (!isRecord(value)) {
    throw new VacuumCardConfigError("Die Kartenkonfiguration muss ein Objekt sein.");
  }

  if (value.type !== "custom:vacuum-control-card") {
    throw new VacuumCardConfigError(
      '"type" muss exakt "custom:vacuum-control-card" sein.',
    );
  }
  assertVacuumEntityId(value.entity);
  assertOptionalString(value.name, "name");
  assertOptionalString(value.icon, "icon");

  assertOptionalEnum(value.view, VACUUM_VIEWS, "view");
  assertOptionalEnum(value.density, DENSITIES, "density");
  assertOptionalEnum(value.appearance, APPEARANCES, "appearance");

  assertOverview(value.overview);
  assertSemanticEntities(value.entities);
  assertControls(value.controls);
  assertOptionalRecord(value.programs, "programs");

  if (isRecord(value.programs)) {
    if (value.programs.guard !== undefined) {
      assertSafeGuard(value.programs.guard);
    }
    parseAcknowledgementTimeout(
      value.programs.acknowledgement_timeout as string | number | undefined,
    );
    assertOptionalArray(value.programs.items, "programs.items");
    if (Array.isArray(value.programs.items)) {
      value.programs.items.forEach((program, index) => {
        assertProgramConfig(program, index);
      });
    }
  }

  assertDock(value.dock);
  assertMaintenance(value.maintenance);
  assertDiagnostics(value.diagnostics);
  assertAnimations(value.animations);
  assertErrorHandling(value.error_handling);
  assertSections(value.sections);
  assertStateMap(value.state_map);
}

/** Alias with an explicit name for consumers that prefer the complete type name. */
export const assertVacuumCardConfig = assertConfig;

function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (Array.isArray(value)) {
    const existing = seen.get(value);
    if (existing !== undefined) {
      return existing as T;
    }
    const clone: unknown[] = [];
    seen.set(value, clone);
    for (const item of value) {
      clone.push(deepClone(item, seen));
    }
    return clone as T;
  }

  if (isRecord(value)) {
    const existing = seen.get(value);
    if (existing !== undefined) {
      return existing as T;
    }
    const entries: Array<[string, unknown]> = [];
    const clone = Object.fromEntries(entries) as PlainRecord;
    seen.set(value, clone);
    for (const [key, item] of Object.entries(value)) {
      clone[key] = deepClone(item, seen);
    }
    return clone as T;
  }

  return value;
}

function normalizeProgram(program: ProgramConfig): ProgramConfig {
  const normalized = deepClone(program);
  if (normalized.action !== undefined) {
    // A program is always protected by the card guard. Enforcing confirmation
    // on a delegated dashboard action also keeps it safe if a future renderer
    // hands it directly to Home Assistant's action handler.
    if (
      normalized.action.confirmation === undefined ||
      normalized.action.confirmation === false
    ) {
      normalized.action.confirmation = true;
    }
  }
  return normalized;
}

function programSourceKey(program: ProgramConfig, index: number): string {
  if (program.entity) return `entity:${program.entity}`;
  try {
    return `action:${JSON.stringify(program.action)}`;
  } catch {
    // Cyclic JavaScript input cannot originate from YAML. Keep it unique here;
    // the independent deep clone still protects the caller-owned object.
    return `action:${index}`;
  }
}

function normalizePrograms(
  items: readonly ProgramConfig[],
  warnings: ConfigurationWarning[],
): ProgramConfig[] {
  const seen = new Set<string>();
  const normalized: ProgramConfig[] = [];
  items.forEach((program, index) => {
    const key = programSourceKey(program, index);
    if (seen.has(key)) {
      warnings.push({
        code: "duplicate_program",
        value: program.name ?? program.entity ?? `#${index + 1}`,
      });
      return;
    }
    seen.add(key);
    normalized.push(normalizeProgram(program));
  });
  return normalized;
}

function normalizeSectionOrder(
  sections: readonly string[],
  warnings: ConfigurationWarning[],
): string[] {
  const seen = new Set<string>();
  return sections.filter((section) => {
    if (seen.has(section)) {
      warnings.push({ code: "duplicate_section", value: section });
      return false;
    }
    seen.add(section);
    return true;
  });
}

function normalizeOverviewItems(items: readonly OverviewItem[]): OverviewItem[] {
  const seen = new Set<OverviewItem>();
  const normalized: OverviewItem[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    normalized.push(item);
  }
  return normalized;
}

/**
 * Validates and normalizes YAML/editor input without mutating or retaining any
 * caller-owned object or array. Every invocation returns an independent tree.
 */
export function normalizeConfig(value: unknown): NormalizedVacuumCardConfig {
  assertConfig(value);
  const config = value;

  const programs = config.programs;
  const maintenance = config.maintenance;
  const configurationWarnings: ConfigurationWarning[] = [];
  const density = config.density ?? "auto";
  const defaultOverviewItems = density === "compact"
    ? COMPACT_DEFAULT_OVERVIEW_ITEMS
    : DEFAULT_OVERVIEW_ITEMS;
  const defaultSectionOrder = density === "compact"
    ? config.view === "dock"
      ? COMPACT_DOCK_SECTION_ORDER
      : COMPACT_DEFAULT_SECTION_ORDER
    : DEFAULT_SECTION_ORDER;

  const normalized: NormalizedVacuumCardConfig = {
    type: "custom:vacuum-control-card",
    entity: config.entity,
    view: config.view ?? "combined",
    density,
    appearance: config.appearance ?? "adaptive",
    overview: {
      items: normalizeOverviewItems(
        deepClone(config.overview?.items ?? [...defaultOverviewItems]),
      ),
    },
    entities: deepClone(config.entities ?? {}),
    controls: {
      start_pause: config.controls?.start_pause ?? "auto",
      stop: config.controls?.stop ?? "auto",
      return_home: config.controls?.return_home ?? "auto",
      locate: config.controls?.locate ?? "auto",
      confirm_stop_while_active:
        config.controls?.confirm_stop_while_active ?? true,
      confirm_return_while_active:
        config.controls?.confirm_return_while_active ?? true,
    },
    programs: {
      guard: programs?.guard ?? "confirm",
      acknowledgement_timeout: parseAcknowledgementTimeout(
        programs?.acknowledgement_timeout,
      ),
      items: normalizePrograms(programs?.items ?? [], configurationWarnings),
    },
    dock: {
      display: config.dock?.display ?? "collapsed",
      auto_expand_on_activity: config.dock?.auto_expand_on_activity ?? false,
      auto_expand_on_warning: config.dock?.auto_expand_on_warning ?? false,
      show_activity_in_header: config.dock?.show_activity_in_header ?? true,
      show_warnings_in_header: config.dock?.show_warnings_in_header ?? true,
      entities: deepClone(config.dock?.entities ?? {}),
    },
    maintenance: {
      display: maintenance?.display ?? "collapsed",
      defaults: {
        warning_below: maintenance?.defaults?.warning_below ?? 20,
        critical_below: maintenance?.defaults?.critical_below ?? 5,
      },
      items: deepClone(maintenance?.items ?? []),
    },
    diagnostics: {
      display: config.diagnostics?.display ?? "hidden",
      items: deepClone(config.diagnostics?.items ?? []),
    },
    animations: {
      enabled: config.animations?.enabled ?? true,
      intensity: config.animations?.intensity ?? "subtle",
      respect_reduced_motion:
        config.animations?.respect_reduced_motion ?? true,
    },
    error_handling: {
      clear_states: deepClone(
        config.error_handling?.clear_states ?? [...DEFAULT_CLEAR_STATES],
      ),
      show_raw_unknown_states:
        config.error_handling?.show_raw_unknown_states ?? true,
    },
    sections: {
      order: normalizeSectionOrder(
        deepClone(config.sections?.order ?? [...defaultSectionOrder]),
        configurationWarnings,
      ),
    },
    state_map: deepClone(config.state_map ?? {}),
    configurationWarnings,
  };

  if (config.name !== undefined) {
    normalized.name = config.name;
  }
  if (config.icon !== undefined) {
    normalized.icon = config.icon;
  }

  return normalized;
}
