import { describe, expect, it } from "vitest";

import { normalizeConfig } from "../src/config";
import { computeLayoutProfile } from "../src/layout";
import type { ProgramConfig, VacuumCardConfig } from "../src/types";

function compactConfig(
  overrides: Partial<VacuumCardConfig> = {},
) {
  return normalizeConfig({
    type: "custom:vacuum-control-card",
    entity: "vacuum.test_robot",
    density: "compact",
    ...overrides,
  });
}

function programs(count: number, hidden: number[] = []): ProgramConfig[] {
  return Array.from({ length: count }, (_, index) => ({
    entity: `button.program_${index + 1}`,
    hidden: hidden.includes(index),
  }));
}

describe("computeLayoutProfile", () => {
  it("uses the compact 6x2 baseline for a minimal card", () => {
    expect(computeLayoutProfile(compactConfig())).toEqual({
      rows: 2,
      columns: 6,
      min_rows: 2,
      min_columns: 6,
    });
  });

  it("includes the first row of up to four visible controls in the compact baseline", () => {
    const allControls = computeLayoutProfile(compactConfig());
    const noControls = computeLayoutProfile(compactConfig({
      controls: {
        start_pause: false,
        stop: false,
        return_home: false,
        locate: false,
      },
    }));

    expect(allControls.rows).toBe(2);
    expect(noControls.rows).toBe(2);
  });

  it("allocates at most three visible programs per additional row", () => {
    const three = computeLayoutProfile(compactConfig({ programs: { items: programs(3) } }));
    const four = computeLayoutProfile(compactConfig({ programs: { items: programs(4) } }));
    const oneHidden = computeLayoutProfile(compactConfig({
      programs: { items: programs(4, [3]) },
    }));

    expect(three.rows).toBe(3);
    expect(four.rows).toBe(4);
    expect(oneHidden.rows).toBe(3);
  });

  it("counts only selected, configured non-battery overview metrics", () => {
    const entities = {
      progress: "sensor.robot_progress",
      area: "sensor.robot_area",
      duration: "sensor.robot_duration",
    };

    expect(computeLayoutProfile(compactConfig({ entities })).rows).toBe(2);
    expect(computeLayoutProfile(compactConfig({
      entities,
      overview: { items: ["battery", "progress", "area", "duration"] },
    })).rows).toBe(3);
    expect(computeLayoutProfile(compactConfig({
      entities: { progress: entities.progress },
      overview: { items: ["progress"] },
    })).rows).toBe(3);
    expect(computeLayoutProfile(compactConfig({
      entities,
      overview: { items: ["battery"] },
    })).rows).toBe(2);
  });

  it("does not reserve overview space when the activity section is absent", () => {
    const profile = computeLayoutProfile(compactConfig({
      entities: { progress: "sensor.robot_progress" },
      overview: { items: ["progress"] },
      sections: { order: ["controls", "alerts"] },
    }));

    expect(profile.rows).toBe(2);
  });

  it("does not add a row for alerts because compact alerts use a badge", () => {
    const profile = computeLayoutProfile(compactConfig({
      entities: {
        vacuum_error: "sensor.robot_error",
        water_shortage: "binary_sensor.robot_water_shortage",
      },
      sections: { order: ["alerts"] },
    }));

    expect(profile.rows).toBe(2);
  });

  it("adds stable space for configured and visible optional sections", () => {
    const config = compactConfig({
      sections: {
        order: [
          "activity",
          "controls",
          "alerts",
          "dock",
          "details",
          "maintenance",
          "map",
          "diagnostics",
        ],
      },
      entities: {
        last_start: "sensor.robot_last_start",
        map: "image.robot_map",
      },
      dock: {
        entities: { mop_drying: "binary_sensor.dock_drying" },
      },
      maintenance: {
        items: [{ entity: "sensor.robot_filter" }],
      },
      diagnostics: {
        display: "collapsed",
        items: [{ entity: "sensor.robot_connection" }],
      },
    });

    expect(computeLayoutProfile(config)).toEqual({
      rows: 7,
      columns: 6,
      min_rows: 7,
      min_columns: 6,
    });
  });

  it("uses the selected view to exclude inapplicable optional sections", () => {
    const shared: Partial<VacuumCardConfig> = {
      sections: { order: ["dock", "details", "map"] },
      entities: {
        last_start: "sensor.robot_last_start",
        map: "image.robot_map",
      },
      dock: { entities: { mop_drying: "binary_sensor.dock_drying" } },
    };

    expect(computeLayoutProfile(compactConfig({ ...shared, view: "combined" })).rows).toBe(5);
    expect(computeLayoutProfile(compactConfig({ ...shared, view: "robot" })).rows).toBe(4);
    // Dock details are expanded by design in the dedicated dock view.
    expect(computeLayoutProfile(compactConfig({ ...shared, view: "dock" })).rows).toBe(4);
  });

  it("accounts for explicitly expanded optional content", () => {
    const collapsed = computeLayoutProfile(compactConfig({
      sections: { order: ["maintenance"] },
      maintenance: {
        display: "collapsed",
        items: Array.from({ length: 4 }, (_, index) => ({
          entity: `sensor.maintenance_${index + 1}`,
        })),
      },
    }));
    const expanded = computeLayoutProfile(compactConfig({
      sections: { order: ["maintenance"] },
      maintenance: {
        display: "expanded",
        items: Array.from({ length: 4 }, (_, index) => ({
          entity: `sensor.maintenance_${index + 1}`,
        })),
      },
    }));

    expect(collapsed.rows).toBe(3);
    expect(expanded.rows).toBe(5);
    expect(expanded.min_rows).toBeGreaterThanOrEqual(collapsed.min_rows);
  });

  it("keeps non-compact layouts at twelve columns with a six-column minimum", () => {
    const base = normalizeConfig({
      type: "custom:vacuum-control-card",
      entity: "vacuum.test_robot",
      density: "comfortable",
    });
    const withPrograms = normalizeConfig({
      type: "custom:vacuum-control-card",
      entity: "vacuum.test_robot",
      density: "comfortable",
      programs: { items: programs(3) },
    });

    expect(computeLayoutProfile(base)).toEqual({
      rows: 6,
      columns: 12,
      min_rows: 6,
      min_columns: 6,
    });
    expect(computeLayoutProfile(withPrograms)).toEqual({
      rows: 7,
      columns: 12,
      min_rows: 7,
      min_columns: 6,
    });
  });

  it("increases both recommended and minimum rows monotonically as content grows", () => {
    const profiles = [0, 1, 3, 4, 7].map((count) =>
      computeLayoutProfile(compactConfig({ programs: { items: programs(count) } })),
    );

    for (let index = 1; index < profiles.length; index += 1) {
      expect(profiles[index]!.rows).toBeGreaterThanOrEqual(profiles[index - 1]!.rows);
      expect(profiles[index]!.min_rows).toBeGreaterThanOrEqual(
        profiles[index - 1]!.min_rows,
      );
    }
  });
});
