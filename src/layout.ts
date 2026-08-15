import type { NormalizedVacuumCardConfig, OverviewItem } from "./types";

export interface LayoutProfile {
  rows: number;
  columns: number;
  min_rows: number;
  min_columns: number;
}

const ROBOT_VIEW_SECTIONS = new Set([
  "activity",
  "controls",
  "programs",
  "alerts",
  "details",
  "maintenance",
  "map",
  "diagnostics",
]);
const DOCK_VIEW_SECTIONS = new Set([
  "alerts",
  "dock",
  "maintenance",
  "diagnostics",
]);

function hasVisibleSection(
  config: NormalizedVacuumCardConfig,
  section: string,
): boolean {
  if (!config.sections.order.includes(section)) return false;
  if (config.view === "robot") return ROBOT_VIEW_SECTIONS.has(section);
  if (config.view === "dock") return DOCK_VIEW_SECTIONS.has(section);
  return true;
}

function additionalControlRows(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "controls")) return 0;
  const visibleControls = [
    config.controls.start_pause,
    config.controls.stop,
    config.controls.return_home,
    config.controls.locate,
  ].filter((setting) => setting !== false).length;

  const controlsPerRow = config.density === "compact" ? 4 : 2;
  // The baseline already includes the first responsive row.
  return Math.max(0, Math.ceil(visibleControls / controlsPerRow) - 1);
}

function additionalOverviewRows(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "activity")) return 0;
  const configuredItems = config.overview.items.filter(
    (item): item is Exclude<OverviewItem, "battery"> =>
      item !== "battery" && Boolean(config.entities[item]),
  );
  return Math.ceil(new Set(configuredItems).size / 3);
}

function additionalProgramRows(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "programs")) return 0;
  const visiblePrograms = config.programs.items.filter(
    (program) => !program.hidden,
  ).length;
  const programsPerRow = config.density === "compact" ? 3 : 2;
  return Math.ceil(visiblePrograms / programsPerRow);
}

function visibleProgramCount(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "programs")) return 0;
  return config.programs.items.filter((program) => !program.hidden).length;
}

function configuredOverviewCount(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "activity")) return 0;
  return config.overview.items.filter(
    (item) => item !== "battery" && Boolean(config.entities[item]),
  ).length;
}

function expandedContentRows(itemCount: number): number {
  return Math.ceil(itemCount / 3);
}

function configuredDockRows(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "dock")) return 0;
  if (config.dock.display === "hidden" && config.view !== "dock") return 0;
  const entityCount = Object.values(config.dock.entities).filter(Boolean).length;
  if (entityCount === 0) return 0;

  const expanded = config.dock.display === "expanded" || config.view === "dock";
  return 1 + (expanded ? expandedContentRows(entityCount) : 0);
}

function configuredDetailsRows(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "details")) return 0;
  const entityCount = [
    config.entities.last_start,
    config.entities.last_end,
    config.entities.vacuum_mode,
    config.entities.mop_mode,
    config.entities.mop_intensity,
    config.entities.volume,
  ].filter(Boolean).length;
  if (entityCount === 0) return 0;

  return 1 + (config.density === "detailed" ? expandedContentRows(entityCount) : 0);
}

function configuredMaintenanceRows(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "maintenance")) return 0;
  if (config.maintenance.display === "hidden") return 0;
  const items = config.view === "dock"
    ? config.maintenance.items.filter((item) => item.kind?.startsWith("dock"))
    : config.maintenance.items;
  if (items.length === 0) return 0;

  return 1 + (
    config.maintenance.display === "expanded"
      ? expandedContentRows(items.length)
      : 0
  );
}

function configuredMapRows(config: NormalizedVacuumCardConfig): number {
  return hasVisibleSection(config, "map") && Boolean(config.entities.map) ? 1 : 0;
}

function configuredDiagnosticsRows(config: NormalizedVacuumCardConfig): number {
  if (!hasVisibleSection(config, "diagnostics")) return 0;
  if (config.diagnostics.display === "hidden" || config.diagnostics.items.length === 0) {
    return 0;
  }

  return 1 + (
    config.diagnostics.display === "expanded"
      ? expandedContentRows(config.diagnostics.items.length)
      : 0
  );
}

function configuredOptionalSectionRows(config: NormalizedVacuumCardConfig): number {
  return configuredDockRows(config) +
    configuredDetailsRows(config) +
    configuredMaintenanceRows(config) +
    configuredMapRows(config) +
    configuredDiagnosticsRows(config);
}

/**
 * Computes deterministic Home Assistant grid dimensions from configuration
 * alone. Live entity states deliberately cannot make the card resize itself.
 */
export function computeLayoutProfile(
  config: NormalizedVacuumCardConfig,
): LayoutProfile {
  const contentRows = additionalControlRows(config) +
    additionalOverviewRows(config) +
    additionalProgramRows(config) +
    configuredOptionalSectionRows(config);
  const compact = config.density === "compact";
  const rows = (compact ? 2 : 6) + contentRows;
  const minColumns = compact
    ? 6
    : config.density === "detailed"
      ? 12
      : config.density === "comfortable" ||
          visibleProgramCount(config) >= 2 ||
          configuredOverviewCount(config) >= 2 ||
          configuredOptionalSectionRows(config) >= 2
        ? 9
        : 6;

  return {
    rows,
    columns: compact ? 6 : 12,
    min_rows: rows,
    min_columns: minColumns,
  };
}
