export type EntityId = `${string}.${string}`;

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    friendly_name?: string;
    icon?: string;
    unit_of_measurement?: string;
    supported_features?: number;
    battery_level?: number;
    entity_picture?: string;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
  };
  last_changed: string;
  last_updated: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language?: string;
  locale?: {
    language?: string;
    number_format?: string;
    time_format?: string;
  };
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
  ): Promise<unknown>;
  formatEntityState?(entity: HassEntity, state?: string): string;
  formatEntityName?(
    entity: HassEntity,
    name?: string | Record<string, unknown> | Array<Record<string, unknown>>,
    options?: Record<string, unknown>,
  ): string;
  formatEntityAttributeValue?(
    entity: HassEntity,
    attribute: string,
    value?: unknown,
  ): string;
  hassUrl?(path?: string): string;
}

export type VacuumView = "combined" | "robot" | "dock";
export type Density = "auto" | "compact" | "comfortable" | "detailed";
export type Appearance = "adaptive" | "accent";
export type OverviewItem = "battery" | "progress" | "area" | "duration";
export type DisplayMode = "expanded" | "collapsed" | "hidden";
export type TaskKind = "vacuum" | "mop" | "combo" | "unknown";
export type GuardMode = "confirm";
export type Severity = "block" | "warn" | "ignore";
export type BinaryOnMeaning =
  | "ok"
  | "warning"
  | "active"
  | "installed"
  | "missing"
  | "unknown";

export interface EntityRefConfig {
  entity: string;
  name?: string;
  icon?: string;
}

export interface SemanticEntitiesConfig {
  status?: string;
  battery?: string;
  charging?: string;
  cleaning?: string;
  progress?: string;
  area?: string;
  duration?: string;
  last_start?: string;
  last_end?: string;
  map?: string;
  vacuum_mode?: string;
  mop_mode?: string;
  mop_intensity?: string;
  volume?: string;
  mop_attached?: string;
  water_tank_attached?: string;
  water_shortage?: string;
  vacuum_error?: string;
}

export interface BinaryEntityConfig {
  entity: string;
  on_is?: BinaryOnMeaning;
  name?: string;
}

export interface DockEntitiesConfig {
  error?: string;
  mop_drying?: string;
  drying_remaining?: string;
  clean_water_tank?: string | BinaryEntityConfig;
  dirty_water_tank?: string | BinaryEntityConfig;
  cleaning_solution?: string | BinaryEntityConfig;
  emptying_mode?: string;
  child_lock?: string;
}

export interface DockConfig {
  display?: DisplayMode;
  auto_expand_on_activity?: boolean;
  auto_expand_on_warning?: boolean;
  show_activity_in_header?: boolean;
  show_warnings_in_header?: boolean;
  entities?: DockEntitiesConfig;
}

export interface ProgramRequirement {
  condition: keyof SemanticEntitiesConfig;
  expected: boolean | string | number;
  severity?: Severity;
  message?: string;
}

export interface ConfirmationConfig {
  title?: string;
  text?: string;
  confirm_text?: string;
  dismiss_text?: string;
}

export interface DashboardActionConfig {
  action: "more-info" | "toggle" | "perform-action" | "navigate" | "url" | "assist" | "none";
  perform_action?: string;
  target?: Record<string, unknown>;
  data?: Record<string, unknown>;
  navigation_path?: string;
  url_path?: string;
  confirmation?: boolean | ConfirmationConfig;
  [key: string]: unknown;
}

export interface ProgramConfig {
  entity?: string;
  action?: DashboardActionConfig;
  name?: string;
  icon?: string;
  description?: string;
  kind?: TaskKind;
  color?: string;
  hidden?: boolean;
  guard?: GuardMode;
  confirmation?: ConfirmationConfig;
  requires?: ProgramRequirement[];
}

export interface ProgramsConfig {
  guard?: GuardMode;
  acknowledgement_timeout?: string | number;
  items?: ProgramConfig[];
}

export interface MaintenanceItemConfig extends EntityRefConfig {
  kind?: string;
  warning_below?: number;
  critical_below?: number;
}

export interface MaintenanceConfig {
  display?: DisplayMode;
  defaults?: {
    warning_below?: number;
    critical_below?: number;
  };
  items?: MaintenanceItemConfig[];
}

export interface DiagnosticsItemConfig extends EntityRefConfig {
  confirmation?: "always" | "never";
}

export interface DiagnosticsConfig {
  display?: DisplayMode;
  items?: DiagnosticsItemConfig[];
}

export interface ControlsConfig {
  start_pause?: boolean | "auto";
  stop?: boolean | "auto";
  return_home?: boolean | "auto";
  locate?: boolean | "auto";
  confirm_stop_while_active?: boolean;
  confirm_return_while_active?: boolean;
}

export interface OverviewConfig {
  items?: OverviewItem[];
}

export interface AnimationsConfig {
  enabled?: boolean;
  intensity?: "none" | "subtle" | "expressive";
  respect_reduced_motion?: boolean;
}

export interface ErrorHandlingConfig {
  clear_states?: string[];
  show_raw_unknown_states?: boolean;
}

export interface SectionsConfig {
  order?: string[];
}

export interface StateMapConfig {
  activity?: Partial<Record<RobotActivity, string[]>>;
  task_kind?: Partial<Record<TaskKind, string[]>>;
}

export interface ConfigurationWarning {
  code: "duplicate_program" | "duplicate_section";
  value: string;
}

export interface VacuumCardConfig {
  type: "custom:vacuum-control-card";
  entity: string;
  name?: string;
  icon?: string;
  view?: VacuumView;
  density?: Density;
  appearance?: Appearance;
  overview?: OverviewConfig;
  entities?: SemanticEntitiesConfig;
  controls?: ControlsConfig;
  programs?: ProgramsConfig;
  dock?: DockConfig;
  maintenance?: MaintenanceConfig;
  diagnostics?: DiagnosticsConfig;
  animations?: AnimationsConfig;
  error_handling?: ErrorHandlingConfig;
  sections?: SectionsConfig;
  state_map?: StateMapConfig;
}

export interface NormalizedVacuumCardConfig extends VacuumCardConfig {
  view: VacuumView;
  density: Density;
  appearance: Appearance;
  overview: Required<OverviewConfig>;
  entities: SemanticEntitiesConfig;
  controls: Required<ControlsConfig>;
  programs: Required<Pick<ProgramsConfig, "guard" | "acknowledgement_timeout" | "items">>;
  dock: Required<Omit<DockConfig, "entities">> & { entities: DockEntitiesConfig };
  maintenance: Required<Pick<MaintenanceConfig, "display" | "defaults" | "items">>;
  diagnostics: Required<Pick<DiagnosticsConfig, "display" | "items">>;
  animations: Required<AnimationsConfig>;
  error_handling: Required<ErrorHandlingConfig>;
  sections: Required<SectionsConfig>;
  state_map: StateMapConfig;
  configurationWarnings: ConfigurationWarning[];
}

export type RobotActivity =
  | "unavailable"
  | "offline"
  | "error"
  | "idle"
  | "docked"
  | "charging"
  | "cleaning"
  | "paused"
  | "returning"
  | "unknown";

export type DockActivity =
  | "mop_drying"
  | "mop_washing"
  | "dust_emptying"
  | "water_refilling"
  | "maintenance_required"
  | "error"
  | "idle"
  | "unknown";

export interface StatusAlert {
  key: string;
  severity: "info" | "warning" | "critical";
  entityId?: string;
  label: string;
  rawState?: string;
}

export interface VacuumViewModel {
  primary: HassEntity | undefined;
  activity: RobotActivity;
  taskKind: TaskKind;
  sessionActive: boolean;
  battery: number | undefined;
  charging: boolean;
  progress: number | undefined;
  area: HassEntity | undefined;
  duration: HassEntity | undefined;
  status: HassEntity | undefined;
  dockActivities: DockActivity[];
  alerts: StatusAlert[];
}

export interface WindowWithCustomCards extends Window {
  customCards?: Array<{
    type: string;
    name: string;
    description?: string;
    preview?: boolean;
    documentationURL?: string;
    getEntitySuggestion?: (
      hass: HomeAssistant,
      entityId: string,
    ) => { config: VacuumCardConfig } | null;
  }>;
}
