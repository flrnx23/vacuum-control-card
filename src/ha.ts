import type {
  DashboardActionConfig,
  HassEntity,
  HomeAssistant,
} from "./types";

export const VacuumFeature = {
  PAUSE: 4,
  STOP: 8,
  RETURN_HOME: 16,
  LOCATE: 512,
  START: 8192,
} as const;

export function supportsFeature(entity: HassEntity | undefined, feature: number): boolean {
  if (!entity) return false;
  const supported = Number(entity.attributes.supported_features ?? 0);
  return Number.isFinite(supported) && (supported & feature) !== 0;
}

export function stateIs(entity: HassEntity | undefined, ...states: string[]): boolean {
  return Boolean(entity && states.includes(entity.state.toLowerCase()));
}

export function entityName(hass: HomeAssistant, entity: HassEntity | undefined): string {
  if (!entity) return "";
  if (hass.formatEntityName) {
    try {
      return hass.formatEntityName(entity, { type: "entity" });
    } catch {
      // Fall through for older Home Assistant frontends.
    }
  }
  return entity.attributes.friendly_name ?? entity.entity_id;
}

export function entityState(hass: HomeAssistant, entity: HassEntity | undefined): string {
  if (!entity) return "";
  if (hass.formatEntityState) {
    try {
      return hass.formatEntityState(entity);
    } catch {
      // Fall through for older Home Assistant frontends.
    }
  }
  const unit = entity.attributes.unit_of_measurement;
  return unit ? `${entity.state} ${unit}` : entity.state;
}

export function fireMoreInfo(host: HTMLElement, entityId: string): void {
  host.dispatchEvent(
    new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }),
  );
}

export function fireHassAction(
  host: HTMLElement,
  action: DashboardActionConfig,
  entity?: string,
): void {
  host.dispatchEvent(
    new CustomEvent("hass-action", {
      bubbles: true,
      composed: true,
      detail: {
        config: {
          ...(entity ? { entity } : {}),
          tap_action: action,
        },
        action: "tap",
      },
    }),
  );
}

export function resolveEntityPicture(hass: HomeAssistant, entity: HassEntity): string | undefined {
  const picture = entity.attributes.entity_picture;
  if (!picture) return undefined;
  if (/^https?:\/\//i.test(picture)) return picture;
  return hass.hassUrl ? hass.hassUrl(picture) : picture;
}

export function booleanState(entity: HassEntity | undefined): boolean | undefined {
  if (!entity || stateIs(entity, "unknown", "unavailable")) return undefined;
  if (stateIs(entity, "on", "true", "yes", "1", "active", "connected", "home")) return true;
  if (stateIs(entity, "off", "false", "no", "0", "inactive", "disconnected", "not_home")) return false;
  return undefined;
}
