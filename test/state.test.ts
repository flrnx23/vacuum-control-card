import { describe, expect, it } from "vitest";

import {
  buildViewModel,
  deriveRobotActivity,
  hasErrorState,
  mapRobotActivity,
  mapTaskKind,
  parseFiniteNumber,
  parsePercentage,
} from "../src/state";
import type {
  HassEntity,
  HomeAssistant,
  StateMapConfig,
  VacuumCardConfig,
} from "../src/types";

function entity(
  entityId: string,
  state: string,
  attributes: HassEntity["attributes"] = {},
): HassEntity {
  return {
    entity_id: entityId,
    state,
    attributes,
    last_changed: "2026-08-10T12:00:00.000Z",
    last_updated: "2026-08-10T12:00:00.000Z",
  };
}

function hass(...entities: HassEntity[]): HomeAssistant {
  return {
    states: Object.fromEntries(entities.map((item) => [item.entity_id, item])),
    async callService() {
      return undefined;
    },
  };
}

const minimalConfig: VacuumCardConfig = {
  type: "custom:vacuum-control-card",
  entity: "vacuum.robot",
};

describe("numeric state parsing", () => {
  it("accepts complete finite numeric values only", () => {
    expect(parseFiniteNumber(" 42.5 ")).toBe(42.5);
    expect(parseFiniteNumber("-1e2")).toBe(-100);
    expect(parseFiniteNumber(12)).toBe(12);
    expect(parseFiniteNumber("")).toBeUndefined();
    expect(parseFiniteNumber("42 %")).toBeUndefined();
    expect(parseFiniteNumber("12things")).toBeUndefined();
    expect(parseFiniteNumber("NaN")).toBeUndefined();
    expect(parseFiniteNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it("clamps percentages without creating false zero values", () => {
    expect(parsePercentage("-12")).toBe(0);
    expect(parsePercentage("37.5")).toBe(37.5);
    expect(parsePercentage("112")).toBe(100);
    expect(parsePercentage("unknown")).toBeUndefined();
    expect(parsePercentage("unavailable")).toBeUndefined();
  });
});

describe("state maps", () => {
  it("maps raw activity values deterministically and case-insensitively", () => {
    const stateMap: StateMapConfig = {
      activity: {
        cleaning: ["Segment_Cleaning"],
        returning: ["Going to dock"],
      },
    };

    expect(mapRobotActivity("segment_cleaning", stateMap)).toBe("cleaning");
    expect(mapRobotActivity("Going To Dock", stateMap)).toBe("returning");
    expect(mapRobotActivity("idle", stateMap)).toBeUndefined();
  });

  it("derives task kind only from an explicit task mapping", () => {
    const stateMap: StateMapConfig = {
      task_kind: {
        mop: ["deep"],
        combo: ["vacuum_then_mop"],
      },
    };

    expect(mapTaskKind("deep", stateMap)).toBe("mop");
    expect(mapTaskKind("vacuum_then_mop", stateMap)).toBe("combo");
    expect(mapTaskKind("turbo", stateMap)).toBeUndefined();
  });
});

describe("robot activity", () => {
  it("treats a missing or unavailable primary entity as unavailable", () => {
    expect(deriveRobotActivity({ primary: undefined })).toBe("unavailable");
    expect(
      deriveRobotActivity({ primary: entity("vacuum.robot", "unavailable") }),
    ).toBe("unavailable");
  });

  it("uses secondary binary sensors without letting stale cleaning hide returning", () => {
    expect(
      deriveRobotActivity({
        primary: entity("vacuum.robot", "idle"),
        cleaning: entity("binary_sensor.cleaning", "on"),
      }),
    ).toBe("cleaning");

    expect(
      deriveRobotActivity({
        primary: entity("vacuum.robot", "returning"),
        cleaning: entity("binary_sensor.cleaning", "on"),
      }),
    ).toBe("returning");
  });

  it("keeps an explicit vacuum error above other activity signals", () => {
    expect(
      deriveRobotActivity(
        {
          primary: entity("vacuum.robot", "cleaning"),
          cleaning: entity("binary_sensor.cleaning", "on"),
          vacuumError: entity("sensor.vacuum_error", "wheel_blocked"),
        },
        undefined,
        ["0", "ok"],
      ),
    ).toBe("error");
  });
});

describe("error states", () => {
  it("honors configured clear states and ignores unavailable error sensors", () => {
    expect(hasErrorState(entity("sensor.error", " NO_ERROR "), ["no_error"])).toBe(
      false,
    );
    expect(hasErrorState(entity("sensor.error", "brush_blocked"), ["0"])).toBe(
      true,
    );
    expect(hasErrorState(entity("sensor.error", "unavailable"), ["0"])).toBe(
      false,
    );
    expect(hasErrorState(undefined, ["0"])).toBe(false);
  });
});

describe("buildViewModel", () => {
  it("builds a usable model from only the primary vacuum", () => {
    const viewModel = buildViewModel(
      hass(entity("vacuum.robot", "idle", { battery_level: 64 })),
      minimalConfig,
    );

    expect(viewModel.activity).toBe("idle");
    expect(viewModel.battery).toBe(64);
    expect(viewModel.status?.entity_id).toBe("vacuum.robot");
    expect(viewModel.progress).toBeUndefined();
    expect(viewModel.alerts).toEqual([]);
  });

  it("prefers a valid configured battery and safely clamps progress", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      entities: {
        battery: "sensor.battery",
        progress: "sensor.progress",
      },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "cleaning", { battery_level: 80 }),
        entity("sensor.battery", "46.5"),
        entity("sensor.progress", "128"),
      ),
      config,
    );

    expect(viewModel.battery).toBe(46.5);
    expect(viewModel.progress).toBe(100);
  });

  it("falls back to the primary battery attribute when the configured sensor is invalid", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      entities: { battery: "sensor.battery" },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "idle", { battery_level: 73 }),
        entity("sensor.battery", "unavailable"),
      ),
      config,
    );

    expect(viewModel.battery).toBe(73);
  });

  it("does not infer mopping from an attached mop or a selected mop mode", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      entities: {
        cleaning: "binary_sensor.cleaning",
        mop_attached: "binary_sensor.mop_attached",
        mop_mode: "select.mop_mode",
      },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "cleaning"),
        entity("binary_sensor.cleaning", "on"),
        entity("binary_sensor.mop_attached", "on"),
        entity("select.mop_mode", "deep"),
      ),
      config,
    );

    expect(viewModel.activity).toBe("cleaning");
    expect(viewModel.taskKind).toBe("unknown");
  });

  it("uses a mode entity only when state_map explicitly defines its task kind", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      entities: {
        cleaning: "binary_sensor.cleaning",
        mop_mode: "select.mop_mode",
      },
      state_map: {
        task_kind: { mop: ["deep"] },
      },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "cleaning"),
        entity("binary_sensor.cleaning", "on"),
        entity("select.mop_mode", "deep"),
      ),
      config,
    );

    expect(viewModel.taskKind).toBe("mop");
  });

  it("uses a confirmed program kind only for an active cleaning session", () => {
    expect(
      buildViewModel(hass(entity("vacuum.robot", "idle")), minimalConfig, "combo")
        .taskKind,
    ).toBe("unknown");
    expect(
      buildViewModel(
        hass(entity("vacuum.robot", "cleaning")),
        minimalConfig,
        "combo",
      ).taskKind,
    ).toBe("combo");
  });

  it("keeps robot cleaning and dock drying visible at the same time", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      dock: {
        entities: {
          mop_drying: "binary_sensor.mop_drying",
          drying_remaining: "sensor.drying_remaining",
        },
      },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "cleaning"),
        entity("binary_sensor.mop_drying", "on"),
        entity("sensor.drying_remaining", "120"),
      ),
      config,
    );

    expect(viewModel.activity).toBe("cleaning");
    expect(viewModel.taskKind).toBe("unknown");
    expect(viewModel.dockActivities).toContain("mop_drying");
  });

  it("keeps a dock error out of the robot activity axis", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      dock: { entities: { error: "sensor.dock_error" } },
      error_handling: { clear_states: ["0", "ok"] },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "idle"),
        entity("sensor.dock_error", "dirty_water_tank_missing", {
          friendly_name: "Dock error",
        }),
      ),
      config,
    );

    expect(viewModel.activity).toBe("idle");
    expect(viewModel.dockActivities).toContain("error");
    expect(viewModel.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "dock_error",
          severity: "critical",
          rawState: "dirty_water_tank_missing",
        }),
      ]),
    );
  });

  it("does not report configured clear error values", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      entities: { vacuum_error: "sensor.vacuum_error" },
      dock: { entities: { error: "sensor.dock_error" } },
      error_handling: { clear_states: ["0", "none", "OK"] },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "idle"),
        entity("sensor.vacuum_error", "none"),
        entity("sensor.dock_error", "ok"),
      ),
      config,
    );

    expect(viewModel.activity).toBe("idle");
    expect(viewModel.alerts).toEqual([]);
    expect(viewModel.dockActivities).toEqual(["idle"]);
  });

  it("does not infer tank warnings when on_is is unknown", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      dock: {
        entities: {
          clean_water_tank: {
            entity: "binary_sensor.clean_water_tank",
            on_is: "unknown",
          },
        },
      },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "idle"),
        entity("binary_sensor.clean_water_tank", "on"),
      ),
      config,
    );

    expect(viewModel.alerts).toEqual([]);
    expect(viewModel.dockActivities).toEqual([]);
  });

  it("does not expose stale metrics when the primary entity is unavailable", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      entities: {
        battery: "sensor.battery",
        progress: "sensor.progress",
        area: "sensor.area",
      },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "unavailable", { battery_level: 88 }),
        entity("sensor.battery", "88"),
        entity("sensor.progress", "45"),
        entity("sensor.area", "12.4"),
      ),
      config,
    );

    expect(viewModel.activity).toBe("unavailable");
    expect(viewModel.sessionActive).toBe(false);
    expect(viewModel.battery).toBeUndefined();
    expect(viewModel.progress).toBeUndefined();
    expect(viewModel.area).toBeUndefined();
    expect(viewModel.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "robot_unavailable" }),
      ]),
    );
  });

  it("collects independent water and maintenance warnings without changing activity", () => {
    const config: VacuumCardConfig = {
      ...minimalConfig,
      entities: { water_shortage: "binary_sensor.water_shortage" },
      maintenance: {
        items: [
          {
            entity: "sensor.filter_remaining",
            name: "Filter",
            warning_below: 20,
            critical_below: 5,
          },
        ],
      },
    };
    const viewModel = buildViewModel(
      hass(
        entity("vacuum.robot", "returning"),
        entity("binary_sensor.water_shortage", "on"),
        entity("sensor.filter_remaining", "4"),
      ),
      config,
    );

    expect(viewModel.activity).toBe("returning");
    expect(viewModel.alerts.map((alert) => alert.key)).toEqual(
      expect.arrayContaining([
        "water_shortage",
        "maintenance:sensor.filter_remaining",
      ]),
    );
  });
});
