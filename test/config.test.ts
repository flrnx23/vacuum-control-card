import { describe, expect, it } from "vitest";

import {
  DEFAULT_ACKNOWLEDGEMENT_TIMEOUT_MS,
  VacuumCardConfigError,
  assertButtonEntityId,
  assertConfig,
  assertProgramConfig,
  assertSafeGuard,
  assertVacuumEntityId,
  normalizeConfig,
  parseAcknowledgementTimeout,
} from "../src/config";
import type { VacuumCardConfig } from "../src/types";

const minimalConfig = (): VacuumCardConfig => ({
  type: "custom:vacuum-control-card",
  entity: "vacuum.test_robot",
});

describe("normalizeConfig", () => {
  it("normalizes a minimal configuration with safe defaults", () => {
    const normalized = normalizeConfig(minimalConfig());

    expect(normalized).toMatchObject({
      type: "custom:vacuum-control-card",
      entity: "vacuum.test_robot",
      view: "combined",
      density: "auto",
      appearance: "adaptive",
      overview: {
        items: ["battery", "progress"],
      },
      entities: {},
      controls: {
        start_pause: "auto",
        stop: "auto",
        return_home: "auto",
        locate: "auto",
        confirm_stop_while_active: true,
        confirm_return_while_active: true,
      },
      programs: {
        guard: "confirm",
        acknowledgement_timeout: DEFAULT_ACKNOWLEDGEMENT_TIMEOUT_MS,
        items: [],
      },
      dock: {
        display: "collapsed",
        auto_expand_on_activity: false,
        auto_expand_on_warning: false,
        show_activity_in_header: true,
        show_warnings_in_header: true,
        entities: {},
      },
      maintenance: {
        display: "collapsed",
        defaults: { warning_below: 20, critical_below: 5 },
        items: [],
      },
      diagnostics: { display: "hidden", items: [] },
      animations: {
        enabled: true,
        intensity: "subtle",
        respect_reduced_motion: true,
      },
      error_handling: {
        clear_states: ["0", "none", "ok", "no_error"],
        show_raw_unknown_states: true,
      },
      sections: {
        order: [
          "activity",
          "controls",
          "programs",
          "alerts",
          "dock",
        ],
      },
      state_map: {},
    });
  });

  it("preserves explicit false values and parses the timeout", () => {
    const normalized = normalizeConfig({
      ...minimalConfig(),
      view: "robot",
      density: "compact",
      controls: {
        start_pause: false,
        stop: false,
        return_home: false,
        locate: false,
        confirm_stop_while_active: false,
        confirm_return_while_active: false,
      },
      programs: {
        guard: "confirm",
        acknowledgement_timeout: "1.5s",
      },
      dock: {
        auto_expand_on_activity: true,
        auto_expand_on_warning: true,
        show_activity_in_header: false,
        show_warnings_in_header: false,
      },
      animations: {
        enabled: false,
        intensity: "none",
        respect_reduced_motion: false,
      },
      error_handling: {
        clear_states: [],
        show_raw_unknown_states: false,
      },
      sections: { order: [] },
    });

    expect(normalized.controls).toEqual({
      start_pause: false,
      stop: false,
      return_home: false,
      locate: false,
      confirm_stop_while_active: false,
      confirm_return_while_active: false,
    });
    expect(normalized.overview.items).toEqual(["battery"]);
    expect(normalized.programs).toMatchObject({
      guard: "confirm",
      acknowledgement_timeout: 1_500,
    });
    expect(normalized.dock).toMatchObject({
      auto_expand_on_activity: true,
      auto_expand_on_warning: true,
      show_activity_in_header: false,
      show_warnings_in_header: false,
    });
    expect(normalized.animations.enabled).toBe(false);
    expect(normalized.error_handling).toEqual({
      clear_states: [],
      show_raw_unknown_states: false,
    });
    expect(normalized.sections.order).toEqual([]);
  });

  it("normalizes and preserves an explicit accent appearance", () => {
    const input = Object.freeze({
      ...minimalConfig(),
      appearance: "accent" as const,
    });

    const normalized = normalizeConfig(input);

    expect(normalized.appearance).toBe("accent");
    expect(input.appearance).toBe("accent");
  });

  it("uses dock-relevant default sections for a compact dock-only card", () => {
    const normalized = normalizeConfig({
      ...minimalConfig(),
      density: "compact",
      view: "dock",
    });

    expect(normalized.sections.order).toEqual([
      "alerts",
      "dock",
      "maintenance",
      "diagnostics",
    ]);
  });

  it("uses simple robot defaults and richer dock-only defaults", () => {
    const robot = normalizeConfig({ ...minimalConfig(), view: "robot" });
    const dock = normalizeConfig({ ...minimalConfig(), view: "dock" });

    expect(robot.sections.order).toEqual(["activity", "controls", "programs", "alerts"]);
    expect(dock.sections.order).toEqual(["alerts", "dock", "maintenance", "diagnostics"]);
    expect(robot.sections.order).not.toContain("details");
    expect(robot.sections.order).not.toContain("map");
  });

  it("does not mutate or retain nested input arrays and objects", () => {
    const input: VacuumCardConfig = {
      ...minimalConfig(),
      entities: { status: "sensor.robot_status" },
      programs: {
        items: [
          {
            name: "Alles",
            action: {
              action: "perform-action",
              perform_action: "script.turn_on",
              target: {
                entity_id: ["script.clean_all"],
                nested: { room: "all" },
              },
              data: { variables: { mode: "combo" } },
            },
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
      dock: {
        entities: {
          clean_water_tank: {
            entity: "binary_sensor.clean_water",
            on_is: "unknown",
          },
        },
      },
      maintenance: {
        items: [{ entity: "sensor.filter", kind: "filter" }],
      },
      diagnostics: {
        items: [{ entity: "sensor.connection" }],
      },
      state_map: {
        activity: { cleaning: ["running"] },
        task_kind: { combo: ["vacuum_and_mop"] },
      },
    };

    const before = structuredClone(input);
    const normalized = normalizeConfig(input);

    expect(input).toEqual(before);
    expect(normalized.programs.items).not.toBe(input.programs?.items);
    expect(normalized.programs.items[0]).not.toBe(input.programs?.items?.[0]);
    expect(normalized.programs.items[0]?.action?.target).not.toBe(
      input.programs?.items?.[0]?.action?.target,
    );
    expect(normalized.programs.items[0]?.action?.confirmation).toBe(true);

    const normalizedTarget = normalized.programs.items[0]?.action?.target as {
      entity_id: string[];
      nested: { room: string };
    };
    normalizedTarget.entity_id.push("script.clean_more");
    normalizedTarget.nested.room = "kitchen";
    normalized.state_map.activity?.cleaning?.push("active");
    normalized.maintenance.items[0]!.kind = "changed";

    expect(input).toEqual(before);

    input.entities!.status = "sensor.changed_after_normalization";
    input.state_map!.activity!.cleaning!.push("changed_input");
    expect(normalized.entities.status).toBe("sensor.robot_status");
    expect(normalized.state_map.activity?.cleaning).toEqual([
      "running",
      "active",
    ]);
  });

  it("returns independent default containers on every call", () => {
    const first = normalizeConfig(minimalConfig());
    const second = normalizeConfig(minimalConfig());

    first.sections.order.push("custom");
    first.overview.items.push("battery");
    first.error_handling.clear_states.push("clear");
    first.programs.items.push({ entity: "button.first" });
    first.maintenance.defaults.warning_below = 99;

    expect(second.sections.order).not.toContain("custom");
    expect(second.overview.items).toEqual(["battery", "progress"]);
    expect(second.error_handling.clear_states).not.toContain("clear");
    expect(second.programs.items).toEqual([]);
    expect(second.maintenance.defaults.warning_below).toBe(20);
  });

  it("normalizes button programs and secure generic actions", () => {
    const normalized = normalizeConfig({
      ...minimalConfig(),
      programs: {
        items: [
          {
            entity: "button.my_robot_program_1",
            name: "Raum 1",
          },
          {
            name: "Alles",
            action: {
              action: "perform-action",
              perform_action: "script.turn_on",
              confirmation: false,
            },
          },
        ],
      },
    });

    expect(normalized.programs.items[0]?.entity).toBe(
      "button.my_robot_program_1",
    );
    expect(normalized.programs.items[1]?.action?.confirmation).toBe(true);
  });

  it("deduplicates repeated program sources and sections with visible warning metadata", () => {
    const normalized = normalizeConfig({
      ...minimalConfig(),
      programs: {
        items: [
          { entity: "button.same", name: "Erster Name" },
          { entity: "button.same", name: "Doppelter Name" },
        ],
      },
      sections: { order: ["activity", "programs", "programs"] },
    });

    expect(normalized.programs.items).toHaveLength(1);
    expect(normalized.sections.order).toEqual(["activity", "programs"]);
    expect(normalized.configurationWarnings).toEqual([
      { code: "duplicate_program", value: "Doppelter Name" },
      { code: "duplicate_section", value: "programs" },
    ]);
  });

  it("uses compact overview and section defaults only when their lists are omitted", () => {
    const normalized = normalizeConfig({
      ...minimalConfig(),
      density: "compact",
    });

    expect(normalized.overview.items).toEqual(["battery"]);
    expect(normalized.sections.order).toEqual([
      "activity",
      "controls",
      "programs",
      "alerts",
    ]);
  });

  it("preserves an explicitly empty overview and section order", () => {
    const normalized = normalizeConfig({
      ...minimalConfig(),
      density: "compact",
      overview: { items: [] },
      sections: { order: [] },
    });

    expect(normalized.overview.items).toEqual([]);
    expect(normalized.sections.order).toEqual([]);
  });

  it("deduplicates overview items deterministically without retaining the input array", () => {
    const items: Array<"battery" | "progress" | "area" | "duration"> = [
      "duration",
      "battery",
      "duration",
      "progress",
      "battery",
    ];
    const normalized = normalizeConfig({
      ...minimalConfig(),
      overview: { items },
    });

    expect(normalized.overview.items).toEqual(["duration", "battery", "progress"]);
    expect(normalized.overview.items).not.toBe(items);

    items.push("area");
    expect(normalized.overview.items).toEqual(["duration", "battery", "progress"]);
  });
});

describe("configuration assertions", () => {
  it.each([
    undefined,
    "",
    "sensor.robot",
    "vacuum.",
    "vacuum.ROBOT",
    "vacuum.robot.extra",
  ])("rejects an invalid primary entity: %s", (entity) => {
    expect(() =>
      normalizeConfig({ type: "custom:vacuum-control-card", entity }),
    ).toThrow(/vacuum/i);
  });

  it("requires the exact custom card type", () => {
    expect(() =>
      normalizeConfig({ type: "custom:other-card", entity: "vacuum.robot" }),
    ).toThrow(/custom:vacuum-control-card/);
  });

  it("allows unavailable optional entity references at configuration time", () => {
    expect(() =>
      normalizeConfig({
        ...minimalConfig(),
        entities: {
          status: "sensor.not_currently_present",
          battery: "sensor.also_missing",
        },
      }),
    ).not.toThrow();
  });

  it.each([
    {},
    {
      entity: "button.program",
      action: { action: "perform-action", perform_action: "script.turn_on" },
    },
  ])("rejects a program without exactly one source", (program) => {
    expect(() =>
      normalizeConfig({
        ...minimalConfig(),
        programs: { items: [program] },
      }),
    ).toThrow(/genau eine Quelle/i);
  });

  it.each(["vacuum.robot", "script.program", "switch.program", "button."])(
    "rejects a non-button program entity: %s",
    (entity) => {
      expect(() =>
        normalizeConfig({
          ...minimalConfig(),
          programs: { items: [{ entity }] },
        }),
      ).toThrow(/button/i);
    },
  );

  it.each(["none", "hold", "hold_confirm", "", false])(
    "rejects an unsafe global program guard: %s",
    (guard) => {
      expect(() =>
        normalizeConfig({
          ...minimalConfig(),
          programs: { guard, items: [] },
        }),
      ).toThrow(/nicht ungesichert|confirm/i);
    },
  );

  it("rejects an unsafe per-program guard", () => {
    expect(() =>
      normalizeConfig({
        ...minimalConfig(),
        programs: {
          items: [{ entity: "button.program", guard: "none" }],
        },
      }),
    ).toThrow(/items\[0\]\.guard/);
  });

  it.each<[string, Record<string, unknown>, RegExp]>([
    ["program color", { programs: { items: [{ entity: "button.program", color: 42 }] } }, /color/],
    ["maintenance item", { maintenance: { items: [null] } }, /maintenance\.items\[0\]/],
    ["diagnostics item", { diagnostics: { items: [null] } }, /diagnostics\.items\[0\]/],
    ["clear states", { error_handling: { clear_states: "ok" } }, /clear_states/],
    ["dock binary entity", { dock: { entities: { clean_water_tank: null } } }, /clean_water_tank/],
    ["overview object", { overview: [] }, /overview/],
    ["overview items", { overview: { items: "battery" } }, /overview\.items/],
    ["overview enum", { overview: { items: ["status"] } }, /overview\.items\[0\]/],
    ["appearance enum", { appearance: "glass" }, /appearance/],
  ])("rejects malformed runtime configuration: %s", (_label, malformed, message) => {
    expect(() => normalizeConfig({ ...minimalConfig(), ...malformed })).toThrow(message);
  });

  it("exports focused assertion helpers", () => {
    expect(() => assertVacuumEntityId("vacuum.robot")).not.toThrow();
    expect(() => assertButtonEntityId("button.program")).not.toThrow();
    expect(() => assertSafeGuard("confirm")).not.toThrow();
    expect(() => assertProgramConfig({ entity: "button.program" })).not.toThrow();
    expect(() => assertConfig(minimalConfig())).not.toThrow();
    expect(() => assertButtonEntityId("script.program")).toThrow(
      VacuumCardConfigError,
    );
  });
});

describe("parseAcknowledgementTimeout", () => {
  it.each([
    [undefined, 15_000],
    [250, 250],
    ["250", 250],
    ["250ms", 250],
    ["15s", 15_000],
    ["1.5m", 90_000],
    ["1h", 3_600_000],
  ] as const)("parses %s as %i ms", (input, expected) => {
    expect(parseAcknowledgementTimeout(input)).toBe(expected);
  });

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    "",
    "0.1ms",
    "later",
    "-1s",
  ])(
    "rejects invalid timeout %s",
    (input) => {
      expect(() => parseAcknowledgementTimeout(input)).toThrow(
        VacuumCardConfigError,
      );
    },
  );
});
