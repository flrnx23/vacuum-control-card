import type {
  BinaryEntityConfig,
  DockActivity,
  HassEntity,
  HomeAssistant,
  NormalizedVacuumCardConfig,
  RobotActivity,
  StateMapConfig,
  StatusAlert,
  TaskKind,
  VacuumCardConfig,
  VacuumViewModel,
} from "./types";

/**
 * Error values that are commonly used by Home Assistant integrations to mean
 * "no error". A normalized configuration normally supplies the same defaults,
 * but keeping them here also makes the state adapter safe for minimal configs.
 */
export const DEFAULT_ERROR_CLEAR_STATES = [
  "0",
  "none",
  "ok",
  "no_error",
] as const;

const NOT_AVAILABLE_STATES = new Set(["unavailable"]);
const UNKNOWN_STATES = new Set(["unknown", "unavailable"]);
const ON_STATES = new Set(["on", "true", "1"]);
const OFF_STATES = new Set(["off", "false", "0"]);

const ACTIVITY_MAP_ORDER: readonly RobotActivity[] = [
  "unavailable",
  "offline",
  "error",
  "cleaning",
  "paused",
  "returning",
  "charging",
  "docked",
  "idle",
  "unknown",
];

const EXPLICIT_ACTIVITY_PRIORITY: readonly RobotActivity[] = [
  "error",
  "offline",
  "unavailable",
  "cleaning",
  "paused",
  "returning",
  "charging",
  "docked",
  "idle",
  "unknown",
];

const TASK_KIND_MAP_ORDER: readonly TaskKind[] = [
  "combo",
  "mop",
  "vacuum",
  "unknown",
];

const BUILT_IN_ACTIVITY_STATES: Readonly<Record<string, RobotActivity>> = {
  unavailable: "unavailable",
  offline: "offline",
  error: "error",
  cleaning: "cleaning",
  vacuuming: "cleaning",
  mopping: "cleaning",
  sweeping: "cleaning",
  paused: "paused",
  pause: "paused",
  returning: "returning",
  returning_home: "returning",
  "returning home": "returning",
  going_home: "returning",
  charging: "charging",
  docked: "docked",
  at_base: "docked",
  "at base": "docked",
  charging_complete: "docked",
  idle: "idle",
  ready: "idle",
  standby: "idle",
  unknown: "unknown",
};

export interface RobotActivitySources {
  primary: HassEntity | undefined;
  status?: HassEntity | undefined;
  cleaning?: HassEntity | undefined;
  charging?: HassEntity | undefined;
  vacuumError?: HassEntity | undefined;
}

export interface TaskKindSources {
  primary?: HassEntity | undefined;
  status?: HassEntity | undefined;
  vacuumMode?: HassEntity | undefined;
  mopMode?: HassEntity | undefined;
  mopIntensity?: HassEntity | undefined;
}

/** Normalizes a raw HA state for semantic comparison, never for display. */
export function normalizeRawState(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const normalized = String(value).trim().toLocaleLowerCase("en-US");
  return normalized.length > 0 ? normalized : undefined;
}

export function getEntity(
  hass: Pick<HomeAssistant, "states">,
  entityId: string | undefined,
): HassEntity | undefined {
  if (!entityId) {
    return undefined;
  }

  return hass.states[entityId];
}

export function isEntityUnavailable(entity: HassEntity | undefined): boolean {
  if (!entity) {
    return true;
  }

  const state = normalizeRawState(entity.state);
  return state === undefined || NOT_AVAILABLE_STATES.has(state);
}

export function hasKnownEntityState(entity: HassEntity | undefined): boolean {
  const state = normalizeRawState(entity?.state);
  return state !== undefined && !UNKNOWN_STATES.has(state);
}

export function isEntityOn(entity: HassEntity | undefined): boolean {
  const state = normalizeRawState(entity?.state);
  return state !== undefined && ON_STATES.has(state);
}

export function isEntityOff(entity: HassEntity | undefined): boolean {
  const state = normalizeRawState(entity?.state);
  return state !== undefined && OFF_STATES.has(state);
}

/**
 * Parses only complete, finite numeric values. In particular, strings such as
 * `42 %`, empty states and partially numeric values are rejected instead of
 * leaking `NaN` or a misleading number into the view model.
 */
export function parseFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu.test(trimmed)
  ) {
    return undefined;
  }

  const result = Number(trimmed);
  return Number.isFinite(result) ? result : undefined;
}

export function parsePercentage(value: unknown): number | undefined {
  const number = parseFiniteNumber(value);
  if (number === undefined) {
    return undefined;
  }

  return Math.min(100, Math.max(0, number));
}

export function parseEntityPercentage(
  entity: HassEntity | undefined,
): number | undefined {
  if (!hasKnownEntityState(entity)) {
    return undefined;
  }

  return parsePercentage(entity?.state);
}

export function isClearErrorState(
  rawState: unknown,
  clearStates: readonly string[] = DEFAULT_ERROR_CLEAR_STATES,
): boolean {
  const state = normalizeRawState(rawState);
  if (state === undefined) {
    return true;
  }

  return clearStates.some((clearState) => {
    const normalizedClearState = normalizeRawState(clearState);
    return normalizedClearState !== undefined && normalizedClearState === state;
  });
}

export function hasErrorState(
  entity: HassEntity | undefined,
  clearStates: readonly string[] = DEFAULT_ERROR_CLEAR_STATES,
): boolean {
  if (!hasKnownEntityState(entity)) {
    return false;
  }

  return !isClearErrorState(entity?.state, clearStates);
}

function valuesMatch(left: unknown, right: unknown): boolean {
  const normalizedLeft = normalizeRawState(left);
  const normalizedRight = normalizeRawState(right);
  return (
    normalizedLeft !== undefined &&
    normalizedRight !== undefined &&
    normalizedLeft === normalizedRight
  );
}

/** Maps one raw value only through the user supplied activity mapping. */
export function mapRobotActivity(
  rawState: unknown,
  stateMap: StateMapConfig | undefined,
): RobotActivity | undefined {
  const activityMap = stateMap?.activity;
  if (!activityMap || normalizeRawState(rawState) === undefined) {
    return undefined;
  }

  for (const activity of ACTIVITY_MAP_ORDER) {
    const mappedStates = activityMap[activity];
    if (
      Array.isArray(mappedStates) &&
      mappedStates.some((mappedState) => valuesMatch(rawState, mappedState))
    ) {
      return activity;
    }
  }

  return undefined;
}

export function mapBuiltInRobotActivity(
  rawState: unknown,
): RobotActivity | undefined {
  const state = normalizeRawState(rawState);
  return state === undefined ? undefined : BUILT_IN_ACTIVITY_STATES[state];
}

function activityForEntity(
  entity: HassEntity | undefined,
  stateMap: StateMapConfig | undefined,
): RobotActivity | undefined {
  if (!entity) {
    return undefined;
  }

  return (
    mapRobotActivity(entity.state, stateMap) ??
    mapBuiltInRobotActivity(entity.state)
  );
}

function pickActivityByPriority(
  activities: readonly (RobotActivity | undefined)[],
): RobotActivity | undefined {
  for (const activity of EXPLICIT_ACTIVITY_PRIORITY) {
    if (activities.includes(activity)) {
      return activity;
    }
  }

  return undefined;
}

/**
 * Resolves only the robot activity axis. Dock activity and warnings are
 * deliberately not accepted as inputs and therefore cannot overwrite it.
 */
export function deriveRobotActivity(
  sources: RobotActivitySources,
  stateMap?: StateMapConfig,
  clearStates: readonly string[] = DEFAULT_ERROR_CLEAR_STATES,
): RobotActivity {
  const { primary, status, cleaning, charging, vacuumError } = sources;

  // A missing/unavailable command entity always wins. Secondary sensors can be
  // stale and must not make an unavailable robot look operable.
  if (isEntityUnavailable(primary)) {
    return "unavailable";
  }

  if (hasErrorState(vacuumError, clearStates)) {
    return "error";
  }

  const primaryActivity = activityForEntity(primary, stateMap);
  const statusActivity = hasKnownEntityState(status)
    ? activityForEntity(status, stateMap)
    : undefined;
  const explicitActivity = pickActivityByPriority([
    primaryActivity,
    statusActivity,
  ]);

  if (
    explicitActivity === "error" ||
    explicitActivity === "offline" ||
    explicitActivity === "unavailable"
  ) {
    return explicitActivity;
  }

  // A detailed paused/returning state is more specific than the generic
  // cleaning binary sensor, which can stay on during intermediate returns.
  if (explicitActivity === "paused" || explicitActivity === "returning") {
    return explicitActivity;
  }

  if (explicitActivity === "cleaning" || isEntityOn(cleaning)) {
    return "cleaning";
  }

  if (explicitActivity === "charging" || isEntityOn(charging)) {
    return "charging";
  }

  return explicitActivity ?? "unknown";
}

/** Maps one raw value only through the explicit task-kind mapping. */
export function mapTaskKind(
  rawState: unknown,
  stateMap: StateMapConfig | undefined,
): TaskKind | undefined {
  const taskMap = stateMap?.task_kind;
  if (!taskMap || normalizeRawState(rawState) === undefined) {
    return undefined;
  }

  for (const taskKind of TASK_KIND_MAP_ORDER) {
    const mappedStates = taskMap[taskKind];
    if (
      Array.isArray(mappedStates) &&
      mappedStates.some((mappedState) => valuesMatch(rawState, mappedState))
    ) {
      return taskKind;
    }
  }

  return undefined;
}

function isTaskKind(value: unknown): value is TaskKind {
  return (
    value === "vacuum" ||
    value === "mop" ||
    value === "combo" ||
    value === "unknown"
  );
}

/**
 * Resolves the cleaning kind only for an active session. Attachment sensors
 * and mode settings have no implicit meaning; mode values are considered only
 * when an explicit state_map maps them.
 */
export function deriveTaskKind(
  sources: TaskKindSources,
  sessionActive: boolean,
  stateMap?: StateMapConfig,
  confirmedProgramKind?: TaskKind,
): TaskKind {
  if (!sessionActive) {
    return "unknown";
  }

  const candidates = [
    sources.status,
    sources.primary,
    sources.vacuumMode,
    sources.mopMode,
    sources.mopIntensity,
  ];

  for (const candidate of candidates) {
    if (!hasKnownEntityState(candidate)) {
      continue;
    }

    const mappedKind = mapTaskKind(candidate?.state, stateMap);
    if (mappedKind !== undefined) {
      return mappedKind;
    }
  }

  return isTaskKind(confirmedProgramKind) ? confirmedProgramKind : "unknown";
}

function resolveBinaryConfig(
  config: string | BinaryEntityConfig | undefined,
): BinaryEntityConfig | undefined {
  if (typeof config === "string") {
    return { entity: config, on_is: "unknown" };
  }

  return config;
}

function entityDisplayName(
  entity: HassEntity | undefined,
  fallback: string,
): string {
  const friendlyName = entity?.attributes.friendly_name;
  return typeof friendlyName === "string" && friendlyName.trim().length > 0
    ? friendlyName
    : fallback;
}

function createAlert(
  key: string,
  severity: StatusAlert["severity"],
  label: string,
  entity?: HassEntity,
): StatusAlert {
  const alert: StatusAlert = { key, severity, label };
  if (entity) {
    alert.entityId = entity.entity_id;
    alert.rawState = entity.state;
  }
  return alert;
}

function appendBinaryMeaningAlert(
  alerts: StatusAlert[],
  hass: Pick<HomeAssistant, "states">,
  key: string,
  config: string | BinaryEntityConfig | undefined,
  fallbackLabel: string,
): void {
  const resolved = resolveBinaryConfig(config);
  if (!resolved || resolved.on_is === "unknown" || !resolved.on_is) {
    return;
  }

  const entity = getEntity(hass, resolved.entity);
  if (!hasKnownEntityState(entity)) {
    return;
  }

  const isWarning =
    ((resolved.on_is === "warning" || resolved.on_is === "missing") &&
      isEntityOn(entity)) ||
    ((resolved.on_is === "ok" || resolved.on_is === "installed") &&
      isEntityOff(entity));

  if (isWarning) {
    alerts.push(
      createAlert(
        key,
        "warning",
        resolved.name ?? entityDisplayName(entity, fallbackLabel),
        entity,
      ),
    );
  }
}

function maintenanceAlerts(
  hass: Pick<HomeAssistant, "states">,
  config: VacuumCardConfig | NormalizedVacuumCardConfig,
): StatusAlert[] {
  const items = config.maintenance?.items ?? [];
  const defaultWarning =
    config.maintenance?.defaults?.warning_below ?? 20;
  const defaultCritical =
    config.maintenance?.defaults?.critical_below ?? 5;
  const alerts: StatusAlert[] = [];

  for (const item of items) {
    const entity = getEntity(hass, item.entity);
    if (!hasKnownEntityState(entity)) {
      continue;
    }

    const remaining = parseFiniteNumber(entity?.state);
    if (remaining === undefined) {
      continue;
    }

    const warningBelow = item.warning_below ?? defaultWarning;
    const criticalBelow = item.critical_below ?? defaultCritical;
    const severity =
      remaining <= criticalBelow
        ? "critical"
        : remaining <= warningBelow
          ? "warning"
          : undefined;

    if (severity) {
      alerts.push(
        createAlert(
          `maintenance:${item.entity}`,
          severity,
          item.name ?? entityDisplayName(entity, "Maintenance required"),
          entity,
        ),
      );
    }
  }

  return alerts;
}

export function buildAlerts(
  hass: Pick<HomeAssistant, "states">,
  config: VacuumCardConfig | NormalizedVacuumCardConfig,
  activity: RobotActivity,
): StatusAlert[] {
  const clearStates =
    config.error_handling?.clear_states ?? DEFAULT_ERROR_CLEAR_STATES;
  const alerts: StatusAlert[] = [];
  const primary = getEntity(hass, config.entity);
  const vacuumError = getEntity(hass, config.entities?.vacuum_error);
  const dockError = getEntity(hass, config.dock?.entities?.error);

  if (activity === "unavailable") {
    alerts.push(
      createAlert(
        "robot_unavailable",
        "critical",
        "Vacuum unavailable",
        primary,
      ),
    );
  } else if (activity === "offline") {
    alerts.push(
      createAlert("robot_offline", "critical", "Vacuum offline", primary),
    );
  }

  if (hasErrorState(vacuumError, clearStates)) {
    alerts.push(
      createAlert(
        "vacuum_error",
        "critical",
        entityDisplayName(vacuumError, "Vacuum error"),
        vacuumError,
      ),
    );
  } else if (activity === "error") {
    const status = getEntity(hass, config.entities?.status);
    const source =
      mapBuiltInRobotActivity(primary?.state) === "error" ? primary : status;
    alerts.push(
      createAlert(
        "vacuum_error",
        "critical",
        entityDisplayName(source, "Vacuum error"),
        source,
      ),
    );
  }

  if (hasErrorState(dockError, clearStates)) {
    alerts.push(
      createAlert(
        "dock_error",
        "critical",
        entityDisplayName(dockError, "Dock error"),
        dockError,
      ),
    );
  }

  const waterShortage = getEntity(hass, config.entities?.water_shortage);
  if (isEntityOn(waterShortage)) {
    alerts.push(
      createAlert(
        "water_shortage",
        "warning",
        entityDisplayName(waterShortage, "Water shortage"),
        waterShortage,
      ),
    );
  }

  const dockEntities = config.dock?.entities;
  appendBinaryMeaningAlert(
    alerts,
    hass,
    "dock_clean_water_tank",
    dockEntities?.clean_water_tank,
    "Clean-water tank",
  );
  appendBinaryMeaningAlert(
    alerts,
    hass,
    "dock_dirty_water_tank",
    dockEntities?.dirty_water_tank,
    "Dirty-water tank",
  );
  appendBinaryMeaningAlert(
    alerts,
    hass,
    "dock_cleaning_solution",
    dockEntities?.cleaning_solution,
    "Cleaning solution",
  );

  alerts.push(...maintenanceAlerts(hass, config));
  return alerts;
}

function hasConfiguredDock(config: VacuumCardConfig | NormalizedVacuumCardConfig): boolean {
  return Object.values(config.dock?.entities ?? {}).some(Boolean);
}

export function deriveDockActivities(
  hass: Pick<HomeAssistant, "states">,
  config: VacuumCardConfig | NormalizedVacuumCardConfig,
  alerts: readonly StatusAlert[] = [],
): DockActivity[] {
  const dockEntities = config.dock?.entities;
  if (!dockEntities || !hasConfiguredDock(config)) {
    return [];
  }

  const activities: DockActivity[] = [];
  const mopDrying = getEntity(hass, dockEntities.mop_drying);
  const dockError = getEntity(hass, dockEntities.error);
  const clearStates =
    config.error_handling?.clear_states ?? DEFAULT_ERROR_CLEAR_STATES;

  if (hasErrorState(dockError, clearStates)) {
    activities.push("error");
  }

  if (isEntityOn(mopDrying)) {
    activities.push("mop_drying");
  }

  const dockMaintenanceWarning = alerts.some(
    (alert) =>
      alert.key.startsWith("maintenance:") &&
      config.maintenance?.items?.some(
        (item) =>
          item.entity === alert.entityId && item.kind?.startsWith("dock") === true,
      ),
  );
  if (dockMaintenanceWarning) {
    activities.push("maintenance_required");
  }

  if (activities.length > 0) {
    return activities;
  }

  // "idle" requires at least one usable activity/error signal. A configured
  // but unavailable sensor must not be presented as proof that the dock is OK.
  if (hasKnownEntityState(mopDrying) || hasKnownEntityState(dockError)) {
    return ["idle"];
  }

  return [];
}

function usableDetailEntity(
  entity: HassEntity | undefined,
): HassEntity | undefined {
  return hasKnownEntityState(entity) ? entity : undefined;
}

function deriveBattery(
  primary: HassEntity | undefined,
  configuredBattery: HassEntity | undefined,
): number | undefined {
  const configuredValue = parseEntityPercentage(configuredBattery);
  if (configuredValue !== undefined) {
    return configuredValue;
  }

  return parsePercentage(primary?.attributes.battery_level);
}

/**
 * Builds the complete DOM-independent view model from the latest HA snapshot.
 * The optional program kind is deliberately ephemeral: callers must only pass
 * it for a backend-confirmed cleaning session.
 */
export function buildViewModel(
  hass: HomeAssistant,
  config: VacuumCardConfig | NormalizedVacuumCardConfig,
  confirmedProgramKind?: TaskKind,
): VacuumViewModel {
  const primary = getEntity(hass, config.entity);
  const entities = config.entities ?? {};
  const statusEntity = getEntity(hass, entities.status);
  const cleaningEntity = getEntity(hass, entities.cleaning);
  const chargingEntity = getEntity(hass, entities.charging);
  const vacuumError = getEntity(hass, entities.vacuum_error);
  const clearStates =
    config.error_handling?.clear_states ?? DEFAULT_ERROR_CLEAR_STATES;

  const activity = deriveRobotActivity(
    {
      primary,
      status: statusEntity,
      cleaning: cleaningEntity,
      charging: chargingEntity,
      vacuumError,
    },
    config.state_map,
    clearStates,
  );

  const robotReachable =
    primary !== undefined &&
    activity !== "unavailable" &&
    activity !== "offline";
  const cleaningSignal = robotReachable && isEntityOn(cleaningEntity);
  const sessionActive =
    robotReachable &&
    activity !== "error" &&
    (cleaningSignal || activity === "cleaning" || activity === "paused");
  const charging =
    robotReachable &&
    (activity === "charging" || isEntityOn(chargingEntity));

  const taskKind = deriveTaskKind(
    {
      primary,
      status: statusEntity,
      vacuumMode: getEntity(hass, entities.vacuum_mode),
      mopMode: getEntity(hass, entities.mop_mode),
      mopIntensity: getEntity(hass, entities.mop_intensity),
    },
    sessionActive,
    config.state_map,
    confirmedProgramKind,
  );

  const alerts = buildAlerts(hass, config, activity);
  const detailsUsable = robotReachable;

  return {
    primary,
    activity,
    taskKind,
    sessionActive,
    battery: detailsUsable
      ? deriveBattery(primary, getEntity(hass, entities.battery))
      : undefined,
    charging,
    progress: detailsUsable
      ? parseEntityPercentage(getEntity(hass, entities.progress))
      : undefined,
    area: detailsUsable
      ? usableDetailEntity(getEntity(hass, entities.area))
      : undefined,
    duration: detailsUsable
      ? usableDetailEntity(getEntity(hass, entities.duration))
      : undefined,
    status: detailsUsable
      ? usableDetailEntity(statusEntity) ?? usableDetailEntity(primary)
      : undefined,
    dockActivities: deriveDockActivities(hass, config, alerts),
    alerts,
  };
}
