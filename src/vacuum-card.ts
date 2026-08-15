import { LitElement, html, nothing, type PropertyValues } from "lit";
import { live } from "lit/directives/live.js";
import { normalizeConfig, parseAcknowledgementTimeout } from "./config";
import {
  booleanState,
  entityName,
  entityState,
  fireHassAction,
  fireMoreInfo,
  resolveEntityPicture,
  supportsFeature,
  VacuumFeature,
} from "./ha";
import { activityLabel, localize, taskLabel } from "./localize";
import { computeLayoutProfile } from "./layout";
import { buildViewModel } from "./state";
import { cardStyles } from "./styles";
import type {
  BinaryEntityConfig,
  DashboardActionConfig,
  HassEntity,
  HomeAssistant,
  MaintenanceItemConfig,
  NormalizedVacuumCardConfig,
  OverviewItem,
  ProgramConfig,
  RobotActivity,
  Severity,
  StatusAlert,
  TaskKind,
  VacuumCardConfig,
  VacuumViewModel,
} from "./types";

interface PreflightIssue {
  severity: Exclude<Severity, "ignore">;
  label: string;
}

interface ProgramConfirmation {
  kind: "program";
  program: ProgramConfig;
  index: number;
  openedActivity: RobotActivity;
  issues: PreflightIssue[];
}

interface ServiceConfirmation {
  kind: "service";
  title: string;
  text: string;
  domain: string;
  service: string;
  entityId: string;
}

type ConfirmationState = ProgramConfirmation | ServiceConfirmation;

interface PendingProgram {
  token: number;
  configRevision: number;
  key: string;
  name: string;
  kind: TaskKind;
}

interface NoticeState {
  kind: "info" | "success" | "error";
  text: string;
}

const ACTIVE_ROBOT_STATES: readonly RobotActivity[] = [
  "cleaning",
  "paused",
  "returning",
];

// A short, deliberately non-zero safety window prevents the pointer-up or a
// repeated Enter key that opened a dialog from confirming it as well.
const CONFIRMATION_ARM_DELAY_MS = 400;

function programSymbol(kind: TaskKind | undefined): string {
  switch (kind) {
    case "vacuum":
      return "◌";
    case "mop":
      return "≈";
    case "combo":
      return "◉";
    default:
      return "▶";
  }
}

function safeCssColor(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const color = value.trim();
  return /^(#[0-9a-f]{3,8}|[a-z]{3,20})$/iu.test(color) ? color : undefined;
}

function binaryConfig(
  value: string | BinaryEntityConfig | undefined,
): BinaryEntityConfig | undefined {
  if (typeof value === "string") return { entity: value, on_is: "unknown" };
  return value;
}

export class VacuumCard extends LitElement {
  public static override styles = cardStyles;

  public static override properties = {
    hass: { attribute: false },
    _confirmation: { state: true },
    _confirmationArmed: { state: true },
    _pendingProgram: { state: true },
    _programTransport: { state: true },
    _commandBusy: { state: true },
    _notice: { state: true },
    _confirmedProgramKind: { state: true },
    _mapOpen: { state: true },
  };

  public hass?: HomeAssistant;
  private _config: NormalizedVacuumCardConfig | undefined;
  private _confirmation: ConfirmationState | undefined;
  private _confirmationArmed = false;
  private _pendingProgram: PendingProgram | undefined;
  private _programTransport: PendingProgram | undefined;
  private _commandBusy = false;
  private _notice: NoticeState | undefined;
  private _confirmedProgramKind: TaskKind | undefined;
  private _mapOpen = false;
  private _pendingTimer: number | undefined;
  private _confirmationArmTimer: number | undefined;
  private _confirmationSequence = 0;
  private _nextProgramToken = 0;
  private _configRevision = 0;
  private _acknowledgedProgramToken: number | undefined;
  private _dialogReturnFocus: HTMLElement | undefined;
  private _serviceRequestToken = 0;

  public static getConfigElement(): HTMLElement {
    return document.createElement("vacuum-control-card-editor");
  }

  public static getStubConfig(hass?: HomeAssistant): VacuumCardConfig {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("vacuum."));
    return {
      type: "custom:vacuum-control-card",
      entity: entity ?? "vacuum.my_robot",
    };
  }

  public setConfig(config: VacuumCardConfig): void {
    const normalized = normalizeConfig(config);
    this._configRevision += 1;
    this._clearPendingTimer();
    this._pendingProgram = undefined;
    this._confirmedProgramKind = undefined;
    this._acknowledgedProgramToken = undefined;
    this._notice = undefined;
    this._mapOpen = false;
    if (this._confirmation) this._closeConfirmation();
    this._config = normalized;
    this.requestUpdate();
  }

  public getCardSize(): number {
    if (!this._config) return 3;
    const { rows } = computeLayoutProfile(this._config);
    // One Masonry size unit is roughly 50 px, while a Sections row including
    // its gap is slightly taller. Keep both sizing APIs driven by one stable,
    // configuration-only layout profile.
    return Math.max(1, Math.ceil(rows * 1.15));
  }

  public getGridOptions(): {
    rows: number;
    columns: number;
    min_rows: number;
    min_columns: number;
  } {
    if (!this._config) {
      return { rows: 2, columns: 6, min_rows: 2, min_columns: 6 };
    }
    return computeLayoutProfile(this._config);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearPendingTimer();
    this._clearConfirmationArmTimer();
    this._confirmationSequence += 1;
    this._serviceRequestToken += 1;
    this._confirmation = undefined;
    this._confirmationArmed = false;
    this._pendingProgram = undefined;
    this._programTransport = undefined;
    this._commandBusy = false;
    this._confirmedProgramKind = undefined;
    this._acknowledgedProgramToken = undefined;
    this._dialogReturnFocus = undefined;
    this._mapOpen = false;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this._setBackgroundInert(Boolean(this._confirmation));

    if ((changed as Map<PropertyKey, unknown>).has("_confirmation") && this._confirmation) {
      queueMicrotask(() => {
        this.renderRoot.querySelector<HTMLElement>("[data-dialog-cancel]")?.focus();
      });
    }

    if (!this.hass || !this._config) return;

    const model = buildViewModel(this.hass, this._config, this._confirmedProgramKind);

    const activeRequest = this._pendingProgram ?? this._programTransport;
    if (
      activeRequest &&
      activeRequest.configRevision === this._configRevision &&
      this._acknowledgedProgramToken !== activeRequest.token &&
      model.activity === "cleaning"
    ) {
      const pending = activeRequest;
      this._clearPendingTimer();
      if (this._pendingProgram?.token === pending.token) this._pendingProgram = undefined;
      this._acknowledgedProgramToken = pending.token;
      this._confirmedProgramKind = pending.kind;
      this._notice = {
        kind: "success",
        text: localize(this.hass, "program.started", { name: pending.name }),
      };
    }

    if (
      this._confirmedProgramKind &&
      !model.sessionActive &&
      !ACTIVE_ROBOT_STATES.includes(model.activity)
    ) {
      this._confirmedProgramKind = undefined;
    }

    if (changed.has("hass") && this._confirmation?.kind === "program") {
      const confirmation = this._confirmation;
      const issues = this._programPreflight(confirmation.program, model);
      if (
        confirmation.openedActivity !== model.activity ||
        !this._samePreflightIssues(confirmation.issues, issues)
      ) {
        this._openConfirmation(
          { ...confirmation, openedActivity: model.activity, issues },
          this._dialogReturnFocus,
        );
      }
    }
  }

  protected override render() {
    if (!this.hass || !this._config) return nothing;

    const model = buildViewModel(this.hass, this._config, this._confirmedProgramKind);
    const view = this._config.view;
    const visibleSections = this._visibleSections(view);
    const sectionOrder = this._config.sections.order
      .filter((section) => visibleSections.has(section));
    // Alerts are safety information. Even an old YAML configuration that
    // omitted the section still gets either the full alert list or, in compact
    // mode, the header badge.
    if (!sectionOrder.includes("alerts")) sectionOrder.unshift("alerts");

    return html`
      <ha-card data-appearance=${this._config.appearance}>
        <div
          class="shell"
          data-view=${view}
          data-density=${this._config.density}
          data-appearance=${this._config.appearance}
          data-activity=${model.activity}
          data-animation-intensity=${this._config.animations.intensity}
        >
          ${this._renderHeader(model)}
          ${this._config.configurationWarnings.map(
            (warning) => html`<div class="notice" data-kind="warning" role="status">
              ${localize(this.hass, `config.warning.${warning.code}`, { value: warning.value })}
            </div>`,
          )}
          ${this._notice
            ? html`<div
                class="notice"
                data-kind=${this._notice.kind}
                role="status"
                aria-live="polite"
                tabindex="-1"
              >
                ${this._notice.text}
              </div>`
            : nothing}
          ${sectionOrder.map((section) => this._renderSection(section, model))}
          ${this._renderConfirmation()}
        </div>
      </ha-card>
    `;
  }

  private _visibleSections(view: NormalizedVacuumCardConfig["view"]): Set<string> {
    if (view === "dock") return new Set(["alerts", "dock", "maintenance", "diagnostics"]);
    if (view === "robot") {
      return new Set([
        "activity",
        "controls",
        "programs",
        "alerts",
        "details",
        "maintenance",
        "map",
        "diagnostics",
      ]);
    }
    return new Set(this._config?.sections.order ?? []);
  }

  private _renderHeader(model: VacuumViewModel) {
    if (!this.hass || !this._config) return nothing;
    const dockView = this._config.view === "dock";
    const robotName = model.primary ? entityName(this.hass, model.primary) : undefined;
    const name = this._config.name ?? (dockView
      ? robotName
        ? localize(this.hass, "card.dock_name", { name: robotName })
        : localize(this.hass, "card.default_dock_name")
      : robotName ?? localize(this.hass, "card.default_name"));
    const status = dockView
      ? this._dockHeaderStatus(model)
      : model.activity === "charging" && model.battery !== undefined && model.battery >= 99.5
        ? localize(this.hass, "state.charged")
      : model.activity === "cleaning"
        ? taskLabel(this.hass, model.taskKind)
        : activityLabel(this.hass, model.activity);
    const showBattery = !dockView && this._config.overview.items.includes("battery");
    const compactStatus = this._renderCompactStatusBadge(model);
    const animationActive =
      this._config.animations.enabled &&
      this._config.animations.intensity !== "none" &&
      ["cleaning", "returning", "charging"].includes(model.activity);

    return html`
      <header class="header">
        <div class="title-row">
          <div
            class="robot-mark"
            data-kind=${dockView ? "dock" : "robot"}
            data-active=${String(animationActive)}
            aria-hidden="true"
          >
            ${this._config.icon
              ? html`<ha-icon icon=${this._config.icon}></ha-icon>`
              : dockView
                ? "\u2302"
                : "\u25CE"}
          </div>
          <div class="title-copy">
            <h2 tabindex="-1">${name}</h2>
            <div class="status-line">${status}</div>
          </div>
        </div>
        <div class="header-trailing">
          ${showBattery && model.battery !== undefined
            ? html`<div
                class="battery"
                data-charging=${String(model.charging)}
                title=${localize(this.hass, "metric.battery")}
                aria-label=${`${localize(this.hass, "metric.battery")}: ${Math.round(model.battery)} %`}
              >
                <span aria-hidden="true">${model.charging ? "⚡" : "▰"}</span>
                ${Math.round(model.battery)} %
              </div>`
            : nothing}
          ${compactStatus}
        </div>
      </header>
    `;
  }

  private _renderCompactStatusBadge(model: VacuumViewModel) {
    if (!this.hass || !this._config || this._config.density !== "compact") return nothing;
    const alerts = this._config.sections.order.includes("alerts")
      ? this._visibleAlerts(model)
      : [];
    const first = alerts[0];
    if (first) {
      const label = this._alertLabel(first.key, first.label);
      const countLabel = alerts.length > 1
        ? localize(this.hass, "compact.alert_count", { count: alerts.length })
        : label;
      return first.entityId
        ? html`<button
            class="compact-status-badge"
            data-severity=${first.severity}
            title=${countLabel}
            aria-label=${countLabel}
            @click=${() => fireMoreInfo(this, first.entityId!)}
          ><span aria-hidden="true">!</span>${alerts.length > 1 ? alerts.length : nothing}</button>`
        : html`<span
            class="compact-status-badge"
            data-severity=${first.severity}
            role=${first.severity === "critical" ? "alert" : "status"}
            title=${countLabel}
            aria-label=${countLabel}
          ><span aria-hidden="true">!</span>${alerts.length > 1 ? alerts.length : nothing}</span>`;
    }

    const dockActive = model.dockActivities.some(
      (activity) => !["idle", "error", "maintenance_required", "unknown"].includes(activity),
    );
    return dockActive
      ? html`<span
          class="compact-status-badge"
          data-severity="info"
          role="status"
          title=${localize(this.hass, "compact.dock_active")}
          aria-label=${localize(this.hass, "compact.dock_active")}
        ><span aria-hidden="true">⌂</span></span>`
      : nothing;
  }

  private _dockHeaderStatus(model: VacuumViewModel): string {
    if (!this.hass || !this._config) return "";
    const dockStates = this._dockEntityIds().map((entityId) => this.hass!.states[entityId]);
    const hasKnownDockSignal = dockStates.some(
      (entity) => entity && !["unknown", "unavailable"].includes(entity.state.toLowerCase()),
    );
    const hasUnknownDockSignal = dockStates.some(
      (entity) => entity?.state.toLowerCase() === "unknown",
    );
    const warning = this._dockAlerts(model)[0];

    if (warning) return this._alertLabel(warning.key, warning.label);
    if (model.dockActivities.includes("mop_drying")) return localize(this.hass, "dock.drying");
    if (!hasKnownDockSignal) {
      return localize(this.hass, hasUnknownDockSignal ? "dock.unknown" : "dock.unavailable");
    }
    if (model.dockActivities.some((activity) => activity !== "idle")) {
      return localize(this.hass, "section.dock");
    }
    return localize(this.hass, "dock.ready");
  }

  private _renderSection(section: string, model: VacuumViewModel) {
    switch (section) {
      case "activity":
        return this._renderActivity(model);
      case "controls":
        return this._renderControls(model);
      case "programs":
        return this._renderPrograms(model);
      case "alerts":
        return this._renderAlerts(model);
      case "dock":
        return this._renderDock(model);
      case "details":
        return this._renderDetails(model);
      case "maintenance":
        return this._renderMaintenance();
      case "map":
        return this._renderMap();
      case "diagnostics":
        return this._renderDiagnostics();
      default:
        return nothing;
    }
  }

  private _renderActivity(model: VacuumViewModel) {
    if (!this.hass || !this._config) return nothing;
    const selected = new Set(this._config.overview.items);
    const showProgress = model.sessionActive && selected.has("progress") && model.progress !== undefined;
    const hasOverviewMetrics = this._config.overview.items.some((item) =>
      (item === "progress" && model.sessionActive && model.progress !== undefined) ||
      (item === "area" && Boolean(model.area)) ||
      (item === "duration" && Boolean(model.duration)),
    );
    const overviewMetrics = this._config.overview.items.map((item) =>
      this._renderOverviewMetric(item, model, false));
    const activityText =
      model.activity === "cleaning"
        ? taskLabel(this.hass, model.taskKind)
        : activityLabel(this.hass, model.activity);
    const sectionLabel = model.sessionActive
      ? activityText
      : localize(this.hass, "section.last_cleaning");

    if (this._config.density === "compact") {
      if (!hasOverviewMetrics) return nothing;
      return html`
        <section
          class="section compact-overview"
          data-section="activity"
          data-session-active=${String(model.sessionActive)}
          aria-label=${sectionLabel}
        >
          ${showProgress
            ? html`<div class="compact-progress">
                <progress
                  max="100"
                  .value=${model.progress!}
                  aria-label=${localize(this.hass, "metric.progress")}
                ></progress>
                <span>${Math.round(model.progress!)} %</span>
              </div>`
            : nothing}
          <div class="metrics">
            ${overviewMetrics}
          </div>
        </section>
      `;
    }

    if (!model.sessionActive && !hasOverviewMetrics) return nothing;

    const animationActive =
      this._config.animations.enabled &&
      this._config.animations.intensity !== "none" &&
      model.activity === "cleaning";
    const visualIcon = model.sessionActive ? "mdi:robot-vacuum" : "mdi:history";

    return html`
      <section
        class="activity-card"
        data-section="activity"
        data-session-active=${String(model.sessionActive)}
        aria-labelledby="vc-activity-title"
      >
        <div
          class="activity-visual"
          data-active=${String(animationActive)}
          data-kind=${model.taskKind}
          data-activity=${model.activity}
          aria-hidden="true"
        >
          <ha-icon icon=${visualIcon}></ha-icon>
          <span class="activity-trail"></span>
        </div>
        <div class="activity-copy">
          <h3 id="vc-activity-title">
            <span>${sectionLabel}</span>
            ${showProgress
              ? html`<span class="activity-progress-value">${Math.round(model.progress!)} %</span>`
              : nothing}
          </h3>
          ${showProgress
            ? html`<progress
                max="100"
                .value=${model.progress!}
                aria-label=${localize(this.hass, "metric.progress")}
              ></progress>`
            : html`<span class="activity-secondary"></span>`}
        </div>
        <div class="activity-metrics">
          ${overviewMetrics}
        </div>
      </section>
    `;
  }

  private _renderOverviewMetric(
    item: OverviewItem,
    model: VacuumViewModel,
    includeProgress = true,
  ) {
    if (!this.hass || !this._config || item === "battery") return nothing;
    if (item === "progress" && includeProgress && model.progress !== undefined) {
      return this._metric(
        localize(this.hass, "metric.progress"),
        `${Math.round(model.progress)} %`,
        this._config.entities.progress,
      );
    }
    if (item === "area" && model.area) {
      return this._metric(
        localize(this.hass, "metric.area"),
        entityState(this.hass, model.area),
        model.area.entity_id,
      );
    }
    if (item === "duration" && model.duration) {
      return this._metric(
        localize(this.hass, "metric.duration"),
        entityState(this.hass, model.duration),
        model.duration.entity_id,
      );
    }
    return nothing;
  }

  private _metric(label: string, value: string, entityId?: string) {
    const content = html`
      <div class="metric-label-row">
        <div class="metric-label">${label}</div>
      </div>
      <div class="metric-value">${value}</div>
    `;
    return entityId
      ? html`<button
          class="metric metric-button"
          aria-label=${`${label}: ${value}. ${localize(this.hass, "action.more_info")}`}
          @click=${() => fireMoreInfo(this, entityId)}
        >${content}</button>`
      : html`<div class="metric">${content}</div>`;
  }

  private _renderControls(model: VacuumViewModel) {
    if (!this.hass || !this._config || !model.primary) return nothing;
    const controls = this._config.controls;
    const supported = (setting: boolean | "auto", feature: number) =>
      setting === true || (setting === "auto" && supportsFeature(model.primary, feature));
    const active = ACTIVE_ROBOT_STATES.includes(model.activity);
    const disabled = this._commandBusy || this._programBusy() || model.activity === "unavailable";
    const hasPrograms = this._config.programs.items.some((program) => !program.hidden);
    const programsVisible =
      this._config.sections.order.includes("programs") &&
      this._visibleSections(this._config.view).has("programs");
    const offerProgramChooser = hasPrograms && !programsVisible;

    return html`
      <section class="section" data-section="controls" aria-labelledby="vc-controls-title">
        <div class="section-heading"><h3 id="vc-controls-title">${localize(this.hass, "section.controls")}</h3></div>
        <div class="controls">
          ${model.activity === "cleaning" && supported(controls.start_pause, VacuumFeature.PAUSE)
            ? html`<button class="primary" ?disabled=${disabled} @click=${() => this._executeVacuum("pause")}>
                ${this._controlContent("mdi:pause", localize(this.hass, "action.pause"))}
              </button>`
            : model.activity === "paused" && supported(controls.start_pause, VacuumFeature.START)
              ? html`<button class="primary" ?disabled=${disabled} @click=${() => this._executeVacuum("start")}>
                  ${this._controlContent("mdi:play", localize(this.hass, "action.resume"))}
                </button>`
              : offerProgramChooser && this._config.density !== "compact" && ["idle", "docked", "charging"].includes(model.activity)
                ? html`<button class="primary" ?disabled=${disabled} @click=${this._focusPrograms}>
                    ${this._controlContent("mdi:playlist-play", localize(this.hass, "action.programs"))}
                  </button>`
                : supported(controls.start_pause, VacuumFeature.START)
                  ? html`<button class="primary" ?disabled=${disabled} @click=${() => this._executeVacuum("start")}>
                      ${this._controlContent("mdi:play", localize(this.hass, "action.start"))}
                    </button>`
                  : nothing}
          ${supported(controls.stop, VacuumFeature.STOP)
            ? html`<button
                class="danger"
                ?disabled=${disabled || !active}
                @click=${(event: MouseEvent) => this._requestStop(model, event.currentTarget as HTMLElement)}
              >
                ${this._controlContent("mdi:stop", localize(this.hass, "action.stop"))}
              </button>`
            : nothing}
          ${supported(controls.return_home, VacuumFeature.RETURN_HOME)
            ? html`<button
                ?disabled=${disabled || model.activity === "docked"}
                @click=${(event: MouseEvent) => this._requestReturn(model, event.currentTarget as HTMLElement)}
              >
                ${this._controlContent("mdi:home-map-marker", localize(this.hass, "action.return"))}
              </button>`
            : nothing}
          ${supported(controls.locate, VacuumFeature.LOCATE)
            ? html`<button ?disabled=${disabled} @click=${() => this._executeVacuum("locate")}>
                ${this._controlContent("mdi:crosshairs-gps", localize(this.hass, "action.locate"))}
              </button>`
            : nothing}
        </div>
      </section>
    `;
  }

  private _controlContent(icon: string, label: string) {
    return html`<ha-icon class="control-icon" icon=${icon} aria-hidden="true"></ha-icon><span class="control-text">${label}</span>`;
  }

  private _focusPrograms = (): void => {
    const first = this.renderRoot.querySelector<HTMLElement>("#vc-programs button:not(:disabled)");
    first?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    first?.focus();
  };

  private _requestStop(model: VacuumViewModel, returnFocus?: HTMLElement): void {
    if (!this.hass || !this._config) return;
    if (ACTIVE_ROBOT_STATES.includes(model.activity) && this._config.controls.confirm_stop_while_active) {
      this._openConfirmation({
        kind: "service",
        title: localize(this.hass, "confirm.stop_title"),
        text: localize(this.hass, "confirm.stop_text"),
        domain: "vacuum",
        service: "stop",
        entityId: this._config.entity,
      }, returnFocus);
      return;
    }
    void this._executeVacuum("stop");
  }

  private _requestReturn(model: VacuumViewModel, returnFocus?: HTMLElement): void {
    if (!this.hass || !this._config) return;
    if (ACTIVE_ROBOT_STATES.includes(model.activity) && this._config.controls.confirm_return_while_active) {
      this._openConfirmation({
        kind: "service",
        title: localize(this.hass, "confirm.return_title"),
        text: localize(this.hass, "confirm.return_text"),
        domain: "vacuum",
        service: "return_to_base",
        entityId: this._config.entity,
      }, returnFocus);
      return;
    }
    void this._executeVacuum("return_to_base");
  }

  private async _executeVacuum(service: string): Promise<void> {
    if (!this.hass || !this._config || this._commandBusy) return;
    await this._executeService("vacuum", service, this._config.entity);
  }

  private async _executeService(domain: string, service: string, entityId: string): Promise<void> {
    if (!this.hass || this._writeBusy()) return;
    const hass = this.hass;
    const token = ++this._serviceRequestToken;
    this._commandBusy = true;
    try {
      await hass.callService(domain, service, {}, { entity_id: entityId });
      if (token !== this._serviceRequestToken) return;
      this._notice = { kind: "info", text: localize(hass, "command.sent") };
    } catch {
      if (token !== this._serviceRequestToken) return;
      this._notice = { kind: "error", text: localize(hass, "command.failed") };
    } finally {
      if (token === this._serviceRequestToken) this._commandBusy = false;
    }
  }

  private _renderPrograms(model: VacuumViewModel) {
    if (!this.hass || !this._config) return nothing;
    const programs = this._config.programs.items.filter((program) => !program.hidden);
    if (programs.length === 0) return nothing;

    return html`
      <section class="section" data-section="programs" id="vc-programs" aria-labelledby="vc-programs-title">
        <div class="section-heading"><h3 id="vc-programs-title">${localize(this.hass, "section.programs")}</h3></div>
        <div class="program-grid">
          ${programs.map((program, index) => {
            const name = this._programName(program, index);
            const entity = program.entity ? this.hass?.states[program.entity] : undefined;
            // Button entities are stateless and may legitimately report
            // `unknown` before their first press. Only a missing entity or the
            // explicit HA state `unavailable` blocks execution.
            const unavailable = Boolean(program.entity && (!entity || entity.state === "unavailable"));
            const color = safeCssColor(program.color);
            const statusId = `vc-program-status-${index}`;
            return html`<button
              class="program"
              style=${color ? `--program-color:${color}` : ""}
              ?disabled=${this._writeBusy()}
              aria-disabled=${unavailable ? "true" : "false"}
              aria-describedby=${unavailable ? statusId : nothing}
              aria-label=${name}
              title=${unavailable ? localize(this.hass, "program.unavailable") : name}
              @click=${(event: MouseEvent) =>
                this._openProgram(program, index, event.currentTarget as HTMLElement)}
            >
              <span class="program-icon" aria-hidden="true">
                ${program.icon
                  ? html`<ha-icon icon=${program.icon}></ha-icon>`
                  : programSymbol(program.kind)}
              </span>
              <span>
                <span class="program-name">${name}</span>
                ${program.description
                  ? html`<span class="program-description">${program.description}</span>`
                  : nothing}
                ${unavailable
                  ? html`<span class="program-description" id=${statusId}>
                      ${localize(this.hass, "program.unavailable")}
                    </span>`
                  : nothing}
              </span>
            </button>`;
          })}
        </div>
      </section>
    `;
  }

  private _programName(program: ProgramConfig, index: number): string {
    if (program.name) return program.name;
    const state = program.entity && this.hass ? this.hass.states[program.entity] : undefined;
    if (state && this.hass) return entityName(this.hass, state);
    return `${localize(this.hass, "section.programs")} ${index + 1}`;
  }

  private _openProgram(program: ProgramConfig, index: number, returnFocus?: HTMLElement): void {
    if (!this.hass || !this._config || this._writeBusy()) return;
    const model = buildViewModel(this.hass, this._config, this._confirmedProgramKind);
    this._openConfirmation({
      kind: "program",
      program,
      index,
      openedActivity: model.activity,
      issues: this._programPreflight(program, model),
    }, returnFocus);
  }

  private _programPreflight(program: ProgramConfig, model: VacuumViewModel): PreflightIssue[] {
    if (!this.hass || !this._config) return [];
    const issues: PreflightIssue[] = [];

    if (["cleaning", "paused", "returning", "error", "unavailable", "offline", "unknown"].includes(model.activity)) {
      issues.push({ severity: "block", label: localize(this.hass, "program.busy") });
    }

    if (program.entity) {
      const entity = this.hass.states[program.entity];
      if (!entity || entity.state.toLowerCase() === "unavailable") {
        issues.push({ severity: "block", label: localize(this.hass, "program.unavailable") });
      }
    }

    for (const requirement of program.requires ?? []) {
      const severity = requirement.severity ?? "warn";
      if (severity === "ignore") continue;
      const entityId = this._config.entities[requirement.condition];
      const entity = entityId ? this.hass.states[entityId] : undefined;
      const matches = this._requirementMatches(entity, requirement.expected);
      if (!matches) {
        const label =
          requirement.message ??
          localize(this.hass, "program.requirement_failed", {
            name: entity ? entityName(this.hass, entity) : String(requirement.condition),
          });
        issues.push({ severity, label });
      }
    }
    return issues;
  }

  private _requirementMatches(entity: HassEntity | undefined, expected: boolean | string | number): boolean {
    if (!entity || ["unknown", "unavailable"].includes(entity.state.toLowerCase())) return false;
    if (typeof expected === "boolean") return booleanState(entity) === expected;
    if (typeof expected === "number") return Number(entity.state) === expected;
    return entity.state.toLowerCase() === expected.toLowerCase();
  }

  private _samePreflightIssues(left: PreflightIssue[], right: PreflightIssue[]): boolean {
    return left.length === right.length && left.every(
      (issue, index) =>
        issue.severity === right[index]?.severity && issue.label === right[index]?.label,
    );
  }

  private async _performProgram(confirmation: ProgramConfirmation): Promise<void> {
    if (!this.hass || !this._config || this._writeBusy()) return;

    // Never trust the view model captured by the render that opened the
    // dialog. Home Assistant may have delivered a newer state in the
    // meantime, so preflight is repeated against the current hass object
    // immediately before any side effect.
    const hass = this.hass;
    const config = this._config;
    const model = buildViewModel(hass, config, this._confirmedProgramKind);
    const issues = this._programPreflight(confirmation.program, model);
    if (!this._samePreflightIssues(confirmation.issues, issues)) {
      this._openConfirmation(
        { ...confirmation, openedActivity: model.activity, issues },
        this._dialogReturnFocus,
      );
      return;
    }
    if (issues.some((issue) => issue.severity === "block")) {
      this._openConfirmation({ ...confirmation, issues }, this._dialogReturnFocus);
      return;
    }

    const program = confirmation.program;
    const name = this._programName(program, confirmation.index);
    const key = program.entity ?? `${confirmation.index}:${name}`;
    const request: PendingProgram = {
      token: ++this._nextProgramToken,
      configRevision: this._configRevision,
      key,
      name,
      kind: program.kind ?? "unknown",
    };
    this._closeConfirmation();
    this._programTransport = request;
    this._pendingProgram = request;
    this._notice = { kind: "info", text: localize(hass, "program.sent", { name }) };
    this._startPendingTimer(request.token);

    try {
      if (program.entity) {
        await hass.callService("button", "press", {}, { entity_id: program.entity });
      } else if (program.action) {
        const action: DashboardActionConfig = { ...program.action };
        delete action.confirmation;
        fireHassAction(this, action, config.entity);
      }
    } catch {
      // A result only owns state with its own token. This prevents a late
      // rejection from an older request from clearing or relabelling a newer
      // request.
      if (this._programTransport?.token !== request.token) return;
      this._programTransport = undefined;
      if (request.configRevision !== this._configRevision) return;
      if (this._acknowledgedProgramToken === request.token) return;
      if (this._pendingProgram?.token === request.token) {
        this._clearPendingTimer();
        this._pendingProgram = undefined;
      }
      this._notice = { kind: "error", text: localize(hass, "program.failed", { name }) };
      return;
    }

    if (this._programTransport?.token === request.token) {
      this._programTransport = undefined;
    }
  }

  private _startPendingTimer(token: number): void {
    if (!this._config || !this._pendingProgram) return;
    this._clearPendingTimer();
    const timeout = parseAcknowledgementTimeout(this._config.programs.acknowledgement_timeout);
    this._pendingTimer = window.setTimeout(() => {
      if (this._pendingProgram?.token !== token) return;
      const pending = this._pendingProgram;
      this._pendingProgram = undefined;
      this._notice = {
        kind: "info",
        text: localize(this.hass, "program.unconfirmed", { name: pending.name }),
      };
      this._pendingTimer = undefined;
    }, timeout);
  }

  private _clearPendingTimer(): void {
    if (this._pendingTimer !== undefined) {
      window.clearTimeout(this._pendingTimer);
      this._pendingTimer = undefined;
    }
  }

  private _programBusy(): boolean {
    return Boolean(this._pendingProgram || this._programTransport);
  }

  private _writeBusy(): boolean {
    return this._commandBusy || this._programBusy();
  }

  private _renderAlerts(model: VacuumViewModel) {
    if (!this.hass || !this._config) return nothing;
    // Compact cards surface warnings in the fixed header badge so their grid
    // height never jumps when a warning appears.
    if (this._config.density === "compact") return nothing;
    const alerts = this._visibleAlerts(model);
    if (alerts.length === 0) return nothing;
    const maintenanceAlerts = alerts.filter((alert) => alert.key.startsWith("maintenance:"));
    const directAlerts = alerts.filter((alert) => !alert.key.startsWith("maintenance:"));
    return html`
      <section class="section" data-section="alerts" aria-labelledby="vc-alerts-title">
        <div class="section-heading"><h3 id="vc-alerts-title">${localize(this.hass, "section.alerts")}</h3></div>
        <div class="alert-list">
          ${directAlerts.map((alert) => this._renderAlert(alert))}
          ${maintenanceAlerts.length > 0
            ? this._renderMaintenanceAlertSummary(maintenanceAlerts)
            : nothing}
        </div>
      </section>
    `;
  }

  private _renderAlert(alert: StatusAlert) {
    const label = this._alertLabel(alert.key, alert.label);
    const icon = alert.severity === "critical"
      ? "mdi:alert-circle"
      : alert.severity === "warning"
        ? "mdi:alert"
        : "mdi:information-outline";
    return html`<div
      class="alert"
      data-severity=${alert.severity}
      role=${alert.severity === "critical" ? "alert" : "status"}
    >
      <ha-icon class="alert-icon" icon=${icon} aria-hidden="true"></ha-icon>
      <span class="alert-copy">${label}</span>
      ${alert.entityId
        ? html`<button
            class="alert-action"
            aria-label=${`${label}: ${localize(this.hass, "action.more_info")}`}
            @click=${() => fireMoreInfo(this, alert.entityId!)}
          ><ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon></button>`
        : nothing}
    </div>`;
  }

  private _renderMaintenanceAlertSummary(alerts: StatusAlert[]) {
    if (!this.hass) return nothing;
    const rank = { critical: 0, warning: 1, info: 2 } as const;
    const sorted = [...alerts].sort((left, right) => {
      const severity = rank[left.severity] - rank[right.severity];
      if (severity !== 0) return severity;
      const leftValue = Number(left.rawState);
      const rightValue = Number(right.rawState);
      return Number.isFinite(leftValue) && Number.isFinite(rightValue)
        ? leftValue - rightValue
        : 0;
    });
    const mostUrgent = sorted[0]!;
    const entity = mostUrgent.entityId ? this.hass.states[mostUrgent.entityId] : undefined;
    const value = entity ? entityState(this.hass, entity) : mostUrgent.rawState;
    const label = alerts.length === 1
      ? mostUrgent.label
      : localize(this.hass, "maintenance.alert_summary", { count: alerts.length });
    const detail = value
      ? alerts.length === 1
        ? value
        : localize(this.hass, "maintenance.most_urgent", {
            name: mostUrgent.label,
            value,
          })
      : undefined;

    return html`<div
      class="alert maintenance-alert"
      data-severity=${mostUrgent.severity}
      role=${mostUrgent.severity === "critical" ? "alert" : "status"}
    >
      <ha-icon class="alert-icon" icon="mdi:wrench-clock" aria-hidden="true"></ha-icon>
      <span class="alert-copy">
        <span>${label}</span>
        ${detail ? html`<span class="alert-detail">${detail}</span>` : nothing}
      </span>
      ${mostUrgent.entityId
        ? html`<button
            class="alert-action"
            aria-label=${`${mostUrgent.label}: ${localize(this.hass, "action.more_info")}`}
            @click=${() => fireMoreInfo(this, mostUrgent.entityId!)}
          ><ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon></button>`
        : nothing}
    </div>`;
  }

  private _visibleAlerts(model: VacuumViewModel): VacuumViewModel["alerts"] {
    if (!this._config) return [];
    return this._config.view === "dock" ? this._dockAlerts(model) : model.alerts;
  }

  private _alertLabel(key: string, fallback: string): string {
    const translated = localize(this.hass, `alert.${key}`);
    return translated === `alert.${key}` ? fallback : translated;
  }

  private _dockEntityIds(): string[] {
    if (!this._config) return [];
    return Object.values(this._config.dock.entities).flatMap((value) => {
      if (typeof value === "string") return [value];
      return value?.entity ? [value.entity] : [];
    });
  }

  private _dockAlerts(model: VacuumViewModel): VacuumViewModel["alerts"] {
    if (!this._config) return [];
    const dockEntityIds = new Set(this._dockEntityIds());
    const dockMaintenanceIds = new Set(
      this._config.maintenance.items
        .filter((item) => item.kind?.startsWith("dock"))
        .map((item) => item.entity),
    );
    const severityOrder = { critical: 0, warning: 1, info: 2 } as const;
    return model.alerts
      .filter((alert) =>
        alert.key.startsWith("dock_") ||
        Boolean(
          alert.entityId &&
          (dockEntityIds.has(alert.entityId) || dockMaintenanceIds.has(alert.entityId)),
        ),
      )
      .sort((left, right) => severityOrder[left.severity] - severityOrder[right.severity]);
  }

  private _renderDock(model: VacuumViewModel) {
    if (!this.hass || !this._config) return nothing;
    const dock = this._config.dock;
    const entities = dock.entities;
    const configured = Object.values(entities).some(Boolean);
    if (!configured || (dock.display === "hidden" && this._config.view !== "dock")) return nothing;

    const drying = model.dockActivities.includes("mop_drying");
    const activeDock = model.dockActivities.some(
      (activity) => !["idle", "error", "maintenance_required"].includes(activity),
    );
    const dockEntityIds = this._dockEntityIds();
    const dockStates = dockEntityIds.map((entityId) => this.hass!.states[entityId]);
    const hasKnownDockSignal = dockStates.some(
      (entity) => entity && !["unknown", "unavailable"].includes(entity.state.toLowerCase()),
    );
    const hasUnknownDockSignal = dockStates.some(
      (entity) => entity?.state.toLowerCase() === "unknown",
    );
    const dockWarnings = this._dockAlerts(model);
    const headerWarning = dockWarnings[0];
    const hasDockWarning = dockWarnings.length > 0;
    const showHeaderWarning = dock.show_warnings_in_header && Boolean(headerWarning);
    const showHeaderActivity = dock.show_activity_in_header && activeDock;
    const dryingRemaining = entities.drying_remaining
      ? this.hass.states[entities.drying_remaining]
      : undefined;
    const dockLabel = showHeaderWarning && headerWarning
      ? this._alertLabel(headerWarning.key, headerWarning.label)
      : showHeaderActivity && drying
        ? localize(this.hass, "dock.drying")
        : !hasKnownDockSignal
          ? localize(this.hass, hasUnknownDockSignal ? "dock.unknown" : "dock.unavailable")
          : hasDockWarning || activeDock
            ? localize(this.hass, "section.dock")
            : localize(this.hass, "dock.ready");
    const open =
      dock.display === "expanded" ||
      this._config.view === "dock" ||
      (dock.auto_expand_on_activity && activeDock) ||
      (dock.auto_expand_on_warning && hasDockWarning);
    const dockAnimationActive =
      showHeaderActivity &&
      this._config.animations.enabled &&
      this._config.animations.intensity !== "none";
    const dockStatusSymbol = showHeaderWarning
      ? "!"
      : showHeaderActivity
        ? "≈"
        : !hasKnownDockSignal
          ? "?"
          : hasDockWarning || activeDock
            ? "·"
            : "✓";

    return html`
      <section
        class="section dock-section"
        data-section="dock"
        data-view=${this._config.view}
        aria-labelledby="vc-dock-title"
      >
        <div class="section-heading"><h3 id="vc-dock-title">${localize(this.hass, "section.dock")}</h3></div>
        <details class="dock-details" ?open=${open}>
          <summary class="dock-strip">
            <span class="dock-symbol" data-active=${String(dockAnimationActive)} aria-hidden="true">⌂</span>
            <span>
              <strong>${dockLabel}</strong>
              ${showHeaderActivity && drying && dryingRemaining
                ? html`<span class="program-description">${entityState(this.hass, dryingRemaining)}</span>`
                : nothing}
            </span>
            <span class="dock-trailing" aria-hidden="true">
              <span>${dockStatusSymbol}</span>
              <ha-icon class="dock-chevron" icon="mdi:chevron-right"></ha-icon>
            </span>
          </summary>
          <div class="details-content">
            ${this._renderBinaryDockEntity(entities.clean_water_tank)}
            ${this._renderBinaryDockEntity(entities.dirty_water_tank)}
            ${this._renderBinaryDockEntity(entities.cleaning_solution)}
            ${entities.emptying_mode
              ? this._renderSelectSetting(entities.emptying_mode, localize(this.hass, "setting.emptying_mode"), false)
              : nothing}
            ${entities.child_lock ? this._renderChildLock(entities.child_lock) : nothing}
          </div>
        </details>
      </section>
    `;
  }

  private _renderBinaryDockEntity(value: string | BinaryEntityConfig | undefined) {
    if (!this.hass) return nothing;
    const config = binaryConfig(value);
    if (!config) return nothing;
    const entity = this.hass.states[config.entity];
    if (!entity) return nothing;
    const state = booleanState(entity);
    let semantic = entityState(this.hass, entity);
    if (config.on_is && config.on_is !== "unknown" && state !== undefined) {
      switch (config.on_is) {
        case "ok":
          semantic = localize(this.hass, state ? "binary.ok" : "binary.check");
          break;
        case "warning":
          semantic = localize(this.hass, state ? "common.warning" : "binary.ok");
          break;
        case "active":
          semantic = localize(this.hass, state ? "dock.on" : "dock.off");
          break;
        case "installed":
          semantic = localize(this.hass, state ? "binary.installed" : "binary.missing");
          break;
        case "missing":
          semantic = localize(this.hass, state ? "binary.missing" : "binary.installed");
          break;
      }
    }
    return this._entityRow(config.name ?? entityName(this.hass, entity), semantic, entity.entity_id);
  }

  private _renderChildLock(entityId: string) {
    if (!this.hass) return nothing;
    const entity = this.hass.states[entityId];
    if (!entity) return nothing;
    const on = booleanState(entity) === true;
    return html`<div class="setting-row">
      <span>${localize(this.hass, "setting.child_lock")}</span>
      <button
        ?disabled=${this._writeBusy() || ["unknown", "unavailable"].includes(entity.state.toLowerCase())}
        @click=${() => this._requestSwitch(entityId, !on, on)}
      >${on ? localize(this.hass, "dock.on") : localize(this.hass, "dock.off")}</button>
    </div>`;
  }

  private _requestSwitch(entityId: string, turnOn: boolean, requireConfirmation: boolean): void {
    if (!this.hass || this._writeBusy()) return;
    const service = turnOn ? "turn_on" : "turn_off";
    if (requireConfirmation) {
      this._openConfirmation({
        kind: "service",
        title: localize(this.hass, "confirm.switch_title"),
        text: `${entityId}: ${turnOn ? localize(this.hass, "dock.on") : localize(this.hass, "dock.off")}`,
        domain: "switch",
        service,
        entityId,
      });
      return;
    }
    void this._executeService("switch", service, entityId);
  }

  private _renderDetails(model: VacuumViewModel) {
    if (!this.hass || !this._config) return nothing;
    const e = this._config.entities;
    const hasContent = [
      e.last_start,
      e.last_end,
      e.vacuum_mode,
      e.mop_mode,
      e.mop_intensity,
      e.volume,
    ].some(Boolean);
    if (!hasContent) return nothing;
    const lockSettings = ACTIVE_ROBOT_STATES.includes(model.activity);

    return html`
      <section class="section" data-section="details">
        <details ?open=${this._config.density === "detailed"}>
          <summary>${localize(this.hass, "section.details")}</summary>
          <div class="details-content">
            ${e.last_start ? this._configuredEntityRow(e.last_start, localize(this.hass, "metric.last_start")) : nothing}
            ${e.last_end ? this._configuredEntityRow(e.last_end, localize(this.hass, "metric.last_end")) : nothing}
            ${e.vacuum_mode
              ? this._renderSelectSetting(e.vacuum_mode, localize(this.hass, "setting.vacuum_mode"), lockSettings)
              : nothing}
            ${e.mop_mode
              ? this._renderSelectSetting(e.mop_mode, localize(this.hass, "setting.mop_mode"), lockSettings)
              : nothing}
            ${e.mop_intensity
              ? this._renderSelectSetting(e.mop_intensity, localize(this.hass, "setting.mop_intensity"), lockSettings)
              : nothing}
            ${e.volume ? this._renderVolume(e.volume, lockSettings) : nothing}
          </div>
        </details>
      </section>
    `;
  }

  private _configuredEntityRow(entityId: string, label: string) {
    if (!this.hass) return nothing;
    const entity = this.hass.states[entityId];
    if (!entity) return nothing;
    return this._entityRow(label, entityState(this.hass, entity), entityId);
  }

  private _entityRow(label: string, value: string, entityId: string) {
    return html`<div class="entity-row">
      <span>${label}</span>
      <span class="entity-value">
        ${value}
        <button class="icon-action" aria-label=${localize(this.hass, "action.more_info")} @click=${() => fireMoreInfo(this, entityId)}>
          <ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon>
        </button>
      </span>
    </div>`;
  }

  private _renderSelectSetting(entityId: string, label: string, disabled: boolean) {
    if (!this.hass) return nothing;
    const entity = this.hass.states[entityId];
    if (!entity) return nothing;
    const options = Array.isArray(entity.attributes.options) ? entity.attributes.options : [];
    return html`<label class="setting-row">
      <span>${label}</span>
      <select
        .value=${live(entity.state)}
        ?disabled=${disabled || this._writeBusy() || ["unknown", "unavailable"].includes(entity.state)}
        @change=${(event: Event) => {
          const control = event.currentTarget as HTMLSelectElement;
          void this._setSelectOption(entityId, control.value, control);
        }}
      >
        ${options.map((option) => html`<option .value=${option}>${option}</option>`)}
      </select>
    </label>`;
  }

  private async _setSelectOption(
    entityId: string,
    option: string,
    control?: HTMLSelectElement,
  ): Promise<void> {
    const currentState = this.hass?.states[entityId]?.state;
    if (!this.hass || this._writeBusy()) {
      if (control && currentState !== undefined) control.value = currentState;
      return;
    }
    const hass = this.hass;
    const token = ++this._serviceRequestToken;
    this._commandBusy = true;
    try {
      await hass.callService("select", "select_option", { option }, { entity_id: entityId });
    } catch {
      if (token !== this._serviceRequestToken) return;
      const actualState = hass.states[entityId]?.state;
      if (control && actualState !== undefined) control.value = actualState;
      this._notice = { kind: "error", text: localize(hass, "command.failed") };
    } finally {
      if (token === this._serviceRequestToken) this._commandBusy = false;
    }
  }

  private _renderVolume(entityId: string, disabled: boolean) {
    if (!this.hass) return nothing;
    const entity = this.hass.states[entityId];
    if (!entity) return nothing;
    const value = Number(entity.state);
    const min = Number(entity.attributes.min ?? 0);
    const max = Number(entity.attributes.max ?? 100);
    const step = Number(entity.attributes.step ?? 1);
    if (![value, min, max, step].every(Number.isFinite)) return nothing;
    return html`<label class="setting-row">
      <span>${localize(this.hass, "setting.volume")} · ${value}</span>
      <input
        type="range"
        .value=${live(String(value))}
        min=${String(min)}
        max=${String(max)}
        step=${String(step)}
        ?disabled=${disabled || this._writeBusy()}
        @change=${(event: Event) => {
          const control = event.currentTarget as HTMLInputElement;
          void this._setNumberValue(entityId, Number(control.value), control);
        }}
      />
    </label>`;
  }

  private async _setNumberValue(
    entityId: string,
    value: number,
    control?: HTMLInputElement,
  ): Promise<void> {
    const currentValue = Number(this.hass?.states[entityId]?.state);
    if (!this.hass || this._writeBusy() || !Number.isFinite(value)) {
      if (control && Number.isFinite(currentValue)) control.value = String(currentValue);
      return;
    }
    const hass = this.hass;
    const token = ++this._serviceRequestToken;
    this._commandBusy = true;
    try {
      await hass.callService("number", "set_value", { value }, { entity_id: entityId });
    } catch {
      if (token !== this._serviceRequestToken) return;
      const actualValue = Number(hass.states[entityId]?.state);
      if (control && Number.isFinite(actualValue)) control.value = String(actualValue);
      this._notice = { kind: "error", text: localize(hass, "command.failed") };
    } finally {
      if (token === this._serviceRequestToken) this._commandBusy = false;
    }
  }

  private _renderMaintenance() {
    if (!this.hass || !this._config) return nothing;
    const config = this._config.maintenance;
    const items = this._config.view === "dock"
      ? config.items.filter((item) => item.kind?.startsWith("dock"))
      : config.items;
    if (config.display === "hidden" || items.length === 0) return nothing;
    return html`
      <section class="section" data-section="maintenance">
        <details ?open=${config.display === "expanded"}>
          <summary>${localize(this.hass, "section.maintenance")}</summary>
          <div class="details-content">
            ${items.map((item) => this._renderMaintenanceItem(item))}
          </div>
        </details>
      </section>
    `;
  }

  private _renderMaintenanceItem(item: MaintenanceItemConfig) {
    if (!this.hass || !this._config) return nothing;
    const entity = this.hass.states[item.entity];
    if (!entity) return nothing;
    const numeric = Number(entity.state);
    const warning = item.warning_below ?? this._config.maintenance.defaults.warning_below ?? 20;
    const critical = item.critical_below ?? this._config.maintenance.defaults.critical_below ?? 5;
    const color = Number.isFinite(numeric)
      ? numeric <= critical
        ? "var(--vc-error)"
        : numeric <= warning
          ? "var(--vc-warning)"
          : "var(--vc-success)"
      : "var(--secondary-text-color)";
    const percentage = Number.isFinite(numeric) && entity.attributes.unit_of_measurement === "%"
      ? Math.min(100, Math.max(0, numeric))
      : undefined;
    const name = item.name ?? entityName(this.hass, entity);
    return html`<div class="entity-row">
      <span>${name}</span>
      <span class="entity-value maintenance-value">
        ${entityState(this.hass, entity)}
        ${percentage !== undefined
          ? html`<span class="maintenance-bar" aria-hidden="true"><span style=${`--remaining:${percentage}%;--bar-color:${color}`}></span></span>`
          : nothing}
        <button
          aria-label=${`${name}: ${localize(this.hass, "action.more_info")}`}
          @click=${() => fireMoreInfo(this, item.entity)}
        >${"\u2026"}</button>
      </span>
    </div>`;
  }

  private _renderMap() {
    if (!this.hass || !this._config?.entities.map) return nothing;
    const entity = this.hass.states[this._config.entities.map];
    if (!entity) return nothing;
    const picture = resolveEntityPicture(this.hass, entity);
    if (!picture) return nothing;
    return html`
      <section class="section" data-section="map">
        <details ?open=${this._mapOpen} @toggle=${this._handleMapToggle}>
          <summary>${localize(this.hass, "section.map")}</summary>
          ${this._mapOpen
            ? html`<div class="details-content">
                <img class="map-image" src=${picture} loading="lazy" decoding="async" alt=${entityName(this.hass, entity)} />
              </div>`
            : nothing}
        </details>
      </section>
    `;
  }

  private _handleMapToggle(event: Event): void {
    this._mapOpen = (event.currentTarget as HTMLDetailsElement).open;
  }

  private _renderDiagnostics() {
    if (!this.hass || !this._config) return nothing;
    const diagnostics = this._config.diagnostics;
    if (diagnostics.display === "hidden" || diagnostics.items.length === 0) return nothing;
    return html`
      <section class="section" data-section="diagnostics">
        <details ?open=${diagnostics.display === "expanded"}>
          <summary>${localize(this.hass, "section.diagnostics")}</summary>
          <div class="details-content">
            ${diagnostics.items.map((item) => {
              const entity = this.hass?.states[item.entity];
              if (!entity || !this.hass) return nothing;
              const isSwitch = item.entity.startsWith("switch.");
              const name = item.name ?? entityName(this.hass, entity);
              const turnOn = booleanState(entity) !== true;
              return html`<div class="entity-row">
                <span class="diagnostic-copy">
                  <span>${name}</span>
                  <span class="program-description">${item.entity}</span>
                  <span class="program-description">
                    ${localize(this.hass, "diagnostic.raw_state")}: ${entity.state}
                    · ${localize(this.hass, "diagnostic.last_changed")}:
                    <time datetime=${entity.last_changed}>${entity.last_changed}</time>
                  </span>
                </span>
                <span class="entity-value">
                  ${entityState(this.hass, entity)}
                  ${isSwitch
                    ? html`<button
                        ?disabled=${this._writeBusy() || ["unknown", "unavailable"].includes(entity.state.toLowerCase())}
                        aria-label=${localize(this.hass, "diagnostic.switch_aria", {
                          name,
                          action: localize(this.hass, turnOn ? "action.turn_on" : "action.turn_off"),
                        })}
                        @click=${() => this._requestDiagnosticSwitch(item.entity, turnOn, item.confirmation === "always")}
                      >↕</button>`
                    : html`<button class="icon-action" aria-label=${localize(this.hass, "action.more_info")} @click=${() => fireMoreInfo(this, item.entity)}>
                        <ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon>
                      </button>`}
                </span>
              </div>`;
            })}
          </div>
        </details>
      </section>
    `;
  }

  private _requestDiagnosticSwitch(entityId: string, turnOn: boolean, alwaysConfirm: boolean): void {
    if (!this.hass || this._writeBusy()) return;
    const service = turnOn ? "turn_on" : "turn_off";
    if (alwaysConfirm || !turnOn) {
      this._openConfirmation({
        kind: "service",
        title: localize(this.hass, "confirm.switch_title"),
        text: `${entityId}: ${turnOn ? localize(this.hass, "dock.on") : localize(this.hass, "dock.off")}`,
        domain: "switch",
        service,
        entityId,
      });
    } else {
      void this._executeService("switch", service, entityId);
    }
  }

  private _openConfirmation(
    confirmation: ConfirmationState,
    returnFocus?: HTMLElement,
  ): void {
    const activeElement = this.shadowRoot?.activeElement;
    this._dialogReturnFocus =
      returnFocus ??
      this._dialogReturnFocus ??
      (activeElement instanceof HTMLElement ? activeElement : undefined);

    this._clearConfirmationArmTimer();
    const sequence = ++this._confirmationSequence;
    this._confirmationArmed = false;
    this._confirmation = confirmation;
    this._confirmationArmTimer = window.setTimeout(() => {
      if (sequence !== this._confirmationSequence || !this._confirmation) return;
      this._confirmationArmTimer = undefined;
      this._confirmationArmed = true;
    }, CONFIRMATION_ARM_DELAY_MS);
  }

  private _clearConfirmationArmTimer(): void {
    if (this._confirmationArmTimer !== undefined) {
      window.clearTimeout(this._confirmationArmTimer);
      this._confirmationArmTimer = undefined;
    }
  }

  private _setBackgroundInert(inert: boolean): void {
    for (const element of this.renderRoot.querySelectorAll<HTMLElement>(
      ".shell > :not(.dialog-backdrop)",
    )) {
      element.toggleAttribute("inert", inert);
    }
  }

  private _renderConfirmation() {
    if (!this.hass || !this._confirmation) return nothing;
    const confirmation = this._confirmation;
    const isProgram = confirmation.kind === "program";
    const name = isProgram ? this._programName(confirmation.program, confirmation.index) : "";
    const robot = this._config
      ? entityName(this.hass, this.hass.states[this._config.entity]) || this._config.name || this._config.entity
      : "";
    const title = isProgram
      ? confirmation.program.confirmation?.title ?? localize(this.hass, "program.confirm_title")
      : confirmation.title;
    const text = isProgram
      ? confirmation.program.confirmation?.text ?? localize(this.hass, "program.confirm_text", { name, robot })
      : confirmation.text;
    const hasBlock = isProgram && confirmation.issues.some((issue) => issue.severity === "block");
    const confirmText = isProgram
      ? confirmation.program.confirmation?.confirm_text ?? localize(this.hass, "action.confirm")
      : localize(this.hass, "action.confirm");
    const dismissText = isProgram
      ? confirmation.program.confirmation?.dismiss_text ?? localize(this.hass, "action.cancel")
      : localize(this.hass, "action.cancel");

    return html`<div
      class="dialog-backdrop"
      @click=${this._onBackdropClick}
      @keydown=${this._onDialogKeydown}
    >
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vc-dialog-title"
        aria-describedby="vc-dialog-text"
        tabindex="-1"
      >
        <h3 id="vc-dialog-title">${title}</h3>
        <p id="vc-dialog-text">${text}</p>
        ${isProgram && confirmation.issues.length > 0
          ? html`<ul class="dialog-issues">
              ${confirmation.issues.map(
                (issue) => html`<li><strong>${issue.severity === "block" ? "!" : "⚠"}</strong> ${issue.label}</li>`,
              )}
            </ul>`
          : nothing}
        <div class="dialog-actions">
          <button data-dialog-cancel @click=${this._closeConfirmation}>${dismissText}</button>
          <button
            class=${isProgram ? "primary" : confirmation.service === "stop" ? "danger" : "primary"}
            data-dialog-primary
            ?disabled=${
              !this._confirmationArmed ||
              hasBlock ||
              this._commandBusy ||
              this._programBusy()
            }
            @click=${this._confirmCurrent}
          >${confirmText}</button>
        </div>
      </div>
    </div>`;
  }

  private _closeConfirmation = (): void => {
    const returnFocus = this._dialogReturnFocus;
    this._clearConfirmationArmTimer();
    this._confirmationSequence += 1;
    this._confirmationArmed = false;
    this._confirmation = undefined;
    this._dialogReturnFocus = undefined;
    void this.updateComplete.then(() => {
      if (!this.isConnected) return;
      if (
        returnFocus?.isConnected &&
        !(returnFocus instanceof HTMLButtonElement && returnFocus.disabled)
      ) {
        returnFocus.focus();
        return;
      }
      const fallback =
        this.renderRoot.querySelector<HTMLElement>(".notice[tabindex]") ??
        this.renderRoot.querySelector<HTMLElement>(".header h2");
      fallback?.focus();
    });
  };

  private _onBackdropClick = (event: MouseEvent): void => {
    if (event.target === event.currentTarget) this._closeConfirmation();
  };

  private _onDialogKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      this._closeConfirmation();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      this.renderRoot.querySelectorAll<HTMLButtonElement>(".dialog button:not(:disabled)"),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      this.renderRoot.querySelector<HTMLElement>(".dialog")?.focus();
      return;
    }
    if (focusable.length === 1) {
      event.preventDefault();
      focusable[0]?.focus();
      return;
    }
    const current = focusable.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
    const next = event.shiftKey
      ? current <= 0
        ? focusable.length - 1
        : current - 1
      : current >= focusable.length - 1
        ? 0
        : current + 1;
    event.preventDefault();
    focusable[next]?.focus();
  };

  private _confirmCurrent = (): void => {
    const confirmation = this._confirmation;
    if (!confirmation || !this._confirmationArmed) return;
    // Close the synchronous re-entry window before starting any command. A
    // second click dispatched from the same pointer/key sequence is ignored
    // even before Lit has updated the disabled attribute.
    this._confirmationArmed = false;
    this._clearConfirmationArmTimer();
    if (confirmation.kind === "program") {
      void this._performProgram(confirmation);
      return;
    }
    this._closeConfirmation();
    void this._executeService(
      confirmation.domain,
      confirmation.service,
      confirmation.entityId,
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "vacuum-control-card": VacuumCard;
  }
}
