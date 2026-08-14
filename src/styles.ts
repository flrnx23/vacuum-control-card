import { css } from "lit";

export const cardStyles = css`
  :host {
    display: block;
    container-type: inline-size;
    color: var(--primary-text-color, #1f2937);
    --vc-accent: var(--vacuum-control-card-accent-color, var(--primary-color, #3f8cff));
    --vc-success: var(--vacuum-control-card-success-color, var(--success-color, #3ba272));
    --vc-warning: var(--vacuum-control-card-warning-color, var(--warning-color, #e6a23c));
    --vc-error: var(--vacuum-control-card-error-color, var(--error-color, #db4455));
    --vc-water: var(--vacuum-control-card-water-color, var(--info-color, var(--primary-color, #27a9e1)));
    --vc-icon: var(--state-icon-color, var(--secondary-text-color, #687386));
    --vc-icon-active: var(--state-icon-active-color, var(--primary-color, #3f8cff));
    --vc-on-accent: var(--text-primary-color, #fff);
    --vc-surface: var(
      --vacuum-control-card-surface-color,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    --vc-control: var(--vacuum-control-card-control-background, color-mix(in srgb, var(--vc-accent) 10%, transparent));
    --vc-radius: var(--vacuum-control-card-border-radius, var(--ha-card-border-radius, 18px));
    --vc-gap: var(--vacuum-control-card-spacing, 14px);
    --vc-speed: var(--vacuum-control-card-animation-speed, 2.4s);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  ha-card,
  .card {
    display: block;
    overflow: hidden;
    border-radius: var(--vc-radius);
    background: var(--vc-surface);
  }

  .shell {
    padding: 18px;
    display: grid;
    gap: var(--vc-gap);
  }

  .shell[data-animation-intensity="subtle"] {
    --vc-speed: var(--vacuum-control-card-animation-speed, 2.8s);
  }

  .shell[data-animation-intensity="expressive"] {
    --vc-speed: var(--vacuum-control-card-animation-speed, 1.55s);
  }

  .header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: start;
  }

  .header-trailing {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;
  }

  .title-row {
    min-width: 0;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .title-copy {
    min-width: 0;
  }

  h2,
  h3,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.18rem;
    line-height: 1.25;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  h3 {
    font-size: 0.92rem;
    line-height: 1.25;
  }

  .status-line {
    margin-block-start: 3px;
    color: var(--secondary-text-color, #687386);
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .robot-mark {
    inline-size: 46px;
    block-size: 46px;
    flex: 0 0 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--vc-on-accent);
    font-weight: 800;
    background: linear-gradient(145deg, color-mix(in srgb, var(--vc-accent) 76%, white), var(--vc-accent));
    box-shadow: 0 8px 24px color-mix(in srgb, var(--vc-accent) 28%, transparent);
  }

  .robot-mark ha-icon {
    display: block;
    inline-size: 25px;
    block-size: 25px;
    --mdc-icon-size: 25px;
  }

  .battery {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-block-size: 34px;
    padding-inline: 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 6%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 650;
    white-space: nowrap;
  }

  .battery[data-charging="true"] {
    color: var(--vc-success);
  }

  .hero {
    min-block-size: 154px;
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    align-items: center;
    gap: 20px;
    padding: 16px;
    border-radius: calc(var(--vc-radius) - 4px);
    background:
      radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--vc-accent) 18%, transparent), transparent 42%),
      color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  .robot-visual {
    position: relative;
    inline-size: 112px;
    block-size: 112px;
    margin: auto;
    display: grid;
    place-items: center;
  }

  .robot-body {
    z-index: 2;
    inline-size: 84px;
    block-size: 84px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--vc-accent);
    background: var(--vc-surface);
    border: 3px solid color-mix(in srgb, var(--vc-accent) 65%, transparent);
    box-shadow: 0 10px 25px color-mix(in srgb, var(--primary-text-color, #000) 15%, transparent);
    font-size: 1.7rem;
  }

  .robot-visual::before,
  .robot-visual::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .robot-visual::before {
    inset: 2px;
    border: 2px dashed color-mix(in srgb, var(--vc-accent) 45%, transparent);
    opacity: 0;
  }

  .robot-visual[data-active="true"]::before {
    opacity: 1;
    animation: vc-spin var(--vc-speed) linear infinite;
  }

  .robot-visual[data-kind="mop"]::after,
  .robot-visual[data-kind="combo"]::after {
    inset-inline: 10px;
    inset-block-end: 2px;
    block-size: 18px;
    border: 3px solid color-mix(in srgb, var(--vc-water) 55%, transparent);
    border-block-start-color: transparent;
  }

  .robot-visual[data-active="true"][data-kind="mop"]::after,
  .robot-visual[data-active="true"][data-kind="combo"]::after {
    animation: vc-wave calc(var(--vc-speed) * 0.8) ease-in-out infinite alternate;
  }

  .robot-visual[data-active="true"][data-activity="returning"] {
    animation: vc-return var(--vc-speed) ease-in-out infinite;
  }

  .robot-visual[data-active="true"][data-activity="charging"] .robot-body {
    animation: vc-pulse var(--vc-speed) ease-in-out infinite;
  }

  .hero-copy {
    min-width: 0;
    display: grid;
    gap: 12px;
  }

  .hero-state {
    font-size: clamp(1.1rem, 5cqi, 1.45rem);
    font-weight: 720;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .metric {
    min-width: 0;
  }

  .metric-label-row {
    min-block-size: 44px;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .metric-more-info {
    min-inline-size: 44px;
    margin-inline-start: auto;
    padding: 7px;
    background: transparent;
  }

  .metric-label {
    color: var(--secondary-text-color, #687386);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.035em;
  }

  .metric-value {
    margin-block-start: 3px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  progress {
    inline-size: 100%;
    block-size: 8px;
    border: 0;
    border-radius: 99px;
    overflow: hidden;
    accent-color: var(--vc-accent);
  }

  progress::-webkit-progress-bar {
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 10%, transparent);
  }

  progress::-webkit-progress-value {
    background: var(--vc-accent);
    border-radius: 99px;
  }

  .section {
    display: grid;
    gap: 10px;
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 8px;
  }

  .controls button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .control-icon {
    display: block;
    flex: 0 0 auto;
    inline-size: 20px;
    block-size: 20px;
    --mdc-icon-size: 20px;
  }

  button,
  select,
  input {
    font: inherit;
  }

  button {
    min-block-size: 44px;
    border: 0;
    border-radius: 13px;
    padding: 9px 12px;
    color: var(--primary-text-color, #1f2937);
    background: var(--vc-control);
    cursor: pointer;
    transition: transform 120ms ease, background-color 120ms ease, opacity 120ms ease;
  }

  button:hover:not(:disabled):not([aria-disabled="true"]) {
    background: color-mix(in srgb, var(--vc-accent) 17%, transparent);
  }

  button:active:not(:disabled):not([aria-disabled="true"]) {
    transform: translateY(1px);
  }

  button:focus-visible,
  select:focus-visible,
  input:focus-visible,
  summary:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--vc-accent) 70%, var(--vc-surface));
    outline-offset: 2px;
  }

  button:disabled,
  button[aria-disabled="true"],
  select:disabled,
  input:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .primary {
    color: var(--vc-on-accent);
    background: var(--vc-accent);
    font-weight: 700;
  }

  .primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--vc-accent) 84%, var(--primary-text-color, #1f2937));
  }

  .danger {
    color: var(--vc-error);
    background: color-mix(in srgb, var(--vc-error) 10%, transparent);
  }

  .program-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
    gap: 9px;
  }

  .program {
    min-block-size: 76px;
    text-align: start;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--program-color, var(--vc-accent)) 13%, transparent), transparent),
      color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent);
  }

  .program-icon {
    inline-size: 34px;
    block-size: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: var(--program-color, var(--vc-accent));
    background: color-mix(in srgb, var(--program-color, var(--vc-accent)) 13%, transparent);
  }

  .program-icon ha-icon {
    display: block;
    inline-size: 21px;
    block-size: 21px;
    --mdc-icon-size: 21px;
  }

  .program-name {
    display: block;
    font-weight: 680;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .program-description {
    display: block;
    margin-block-start: 4px;
    color: var(--secondary-text-color, #687386);
    font-size: 0.78rem;
    line-height: 1.3;
  }

  .alert-list {
    display: grid;
    gap: 7px;
  }

  .alert {
    min-block-size: 44px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 11px;
    border-radius: 12px;
    border-inline-start: 4px solid var(--alert-color, var(--vc-warning));
    background: color-mix(in srgb, var(--alert-color, var(--vc-warning)) 9%, transparent);
  }

  .alert[data-severity="critical"] {
    --alert-color: var(--vc-error);
  }

  .alert[data-severity="info"] {
    --alert-color: var(--vc-accent);
  }

  .alert button {
    margin-inline-start: auto;
    min-block-size: 44px;
    min-inline-size: 44px;
    padding: 7px 10px;
  }

  .dock-strip {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 11px 12px;
    border-radius: 13px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent);
  }

  .dock-symbol[data-active="true"] {
    color: var(--vc-accent);
    animation: vc-wave var(--vc-speed) ease-in-out infinite alternate;
  }

  details {
    border-radius: 13px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  summary {
    min-block-size: 44px;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    font-weight: 650;
  }

  .details-content {
    padding: 2px 12px 12px;
    display: grid;
    gap: 10px;
  }

  .entity-row,
  .setting-row {
    min-block-size: 44px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(100px, auto);
    gap: 10px;
    align-items: center;
    border-block-start: 1px solid color-mix(in srgb, var(--primary-text-color, #1f2937) 9%, transparent);
  }

  .entity-row:first-child,
  .setting-row:first-child {
    border-block-start: 0;
  }

  .entity-value {
    text-align: end;
    color: var(--secondary-text-color, #687386);
    overflow-wrap: anywhere;
  }

  select,
  input[type="range"] {
    inline-size: min(100%, 220px);
    min-block-size: 44px;
  }

  .maintenance-bar {
    display: inline-block;
    inline-size: 110px;
    block-size: 7px;
    margin-inline-start: auto;
    overflow: hidden;
    border-radius: 99px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 10%, transparent);
  }

  .maintenance-value {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;
  }

  .diagnostic-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .maintenance-bar > span {
    display: block;
    block-size: 100%;
    inline-size: var(--remaining, 0%);
    background: var(--bar-color, var(--vc-success));
  }

  .map-image {
    inline-size: 100%;
    max-block-size: 480px;
    object-fit: contain;
    border-radius: 12px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent);
  }

  .notice {
    min-block-size: 42px;
    display: flex;
    align-items: center;
    padding: 9px 12px;
    border-radius: 11px;
    color: var(--primary-text-color, #1f2937);
    background: color-mix(in srgb, var(--vc-accent) 10%, transparent);
  }

  .notice[data-kind="error"] {
    background: color-mix(in srgb, var(--vc-error) 12%, transparent);
  }

  .dialog-backdrop {
    position: fixed;
    z-index: 999;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgb(0 0 0 / 48%);
  }

  .dialog {
    inline-size: min(440px, 100%);
    max-block-size: min(620px, calc(100dvh - 36px));
    overflow: auto;
    padding: 20px;
    border-radius: 18px;
    color: var(--primary-text-color, #1f2937);
    background: var(--vc-surface);
    box-shadow: 0 24px 80px rgb(0 0 0 / 34%);
  }

  .dialog h3 {
    font-size: 1.2rem;
  }

  .dialog p {
    margin-block-start: 10px;
    color: var(--secondary-text-color, #687386);
    line-height: 1.5;
  }

  .dialog-issues {
    margin-block: 14px 0;
    padding-inline-start: 20px;
  }

  .dialog-actions {
    margin-block-start: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .empty {
    color: var(--secondary-text-color, #687386);
    font-size: 0.88rem;
  }

  @container (max-width: 420px) {
    .shell {
      padding: 14px;
    }

    .hero {
      grid-template-columns: 88px minmax(0, 1fr);
      padding: 12px;
      gap: 10px;
    }

    .robot-visual {
      inline-size: 78px;
      block-size: 78px;
    }

    .robot-body {
      inline-size: 62px;
      block-size: 62px;
      font-size: 1.25rem;
    }

    .metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .program-grid {
      grid-template-columns: 1fr;
    }
  }

  @container (min-width: 760px) {
    .shell[data-view="combined"] {
      grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
      align-items: start;
    }

    .shell[data-view="combined"] .header,
    .shell[data-view="combined"] .notice,
    .shell[data-view="combined"] .dialog-backdrop {
      grid-column: 1 / -1;
    }

    .shell[data-view="combined"] .section[data-section="dock"],
    .shell[data-view="combined"] .section[data-section="maintenance"],
    .shell[data-view="combined"] .section[data-section="diagnostics"] {
      grid-column: 2;
    }

    .shell[data-view="combined"] .section[data-section="activity"],
    .shell[data-view="combined"] .section[data-section="controls"],
    .shell[data-view="combined"] .section[data-section="programs"],
    .shell[data-view="combined"] .section[data-section="alerts"],
    .shell[data-view="combined"] .section[data-section="details"],
    .shell[data-view="combined"] .section[data-section="map"] {
      grid-column: 1;
    }
  }

  /*
   * Compact is a real HA tile-sized presentation, not a scaled-down version
   * of the large card. Text and touch targets keep readable sizes while
   * decorative and secondary content is reduced.
   */
  .shell[data-density="compact"] {
    --vc-gap: 7px;
    padding: 10px 12px;
    grid-template-columns: minmax(0, 1fr);
  }

  .shell[data-density="compact"] .header {
    align-items: center;
    gap: 6px;
  }

  .shell[data-density="compact"] .title-row {
    gap: 8px;
  }

  .shell[data-density="compact"] .robot-mark {
    inline-size: 36px;
    block-size: 36px;
    flex-basis: 36px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--vc-accent) 22%, transparent);
  }

  .shell[data-density="compact"] .robot-mark[data-active="true"] {
    animation: vc-pulse var(--vc-speed) ease-in-out infinite;
  }

  .shell[data-density="compact"] .robot-mark ha-icon {
    inline-size: 20px;
    block-size: 20px;
    --mdc-icon-size: 20px;
  }

  .shell[data-density="compact"] h2 {
    font-size: 0.94rem;
    line-height: 1.16;
    -webkit-line-clamp: 1;
  }

  .shell[data-density="compact"] .status-line {
    margin-block-start: 1px;
    font-size: 0.76rem;
  }

  .shell[data-density="compact"] .battery {
    min-block-size: 28px;
    gap: 4px;
    padding-inline: 7px;
    font-size: 0.76rem;
  }

  .compact-status-badge {
    min-inline-size: 32px;
    min-block-size: 32px;
    padding: 4px 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: 999px;
    color: var(--vc-warning);
    background: color-mix(in srgb, var(--vc-warning) 14%, transparent);
    font-size: 0.75rem;
    font-weight: 750;
  }

  .compact-status-badge[data-severity="critical"] {
    color: var(--vc-error);
    background: color-mix(in srgb, var(--vc-error) 14%, transparent);
  }

  .compact-status-badge[data-severity="info"] {
    color: var(--vc-accent);
    background: color-mix(in srgb, var(--vc-accent) 12%, transparent);
  }

  button.compact-status-badge {
    min-inline-size: 44px;
    min-block-size: 44px;
  }

  .shell[data-density="compact"] .section {
    gap: 6px;
  }

  .shell[data-density="compact"] .section-heading {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .shell[data-density="compact"] .compact-overview {
    padding-block: 2px;
  }

  .shell[data-density="compact"] .compact-overview .metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .shell[data-density="compact"] .metric {
    position: relative;
    min-block-size: 44px;
    padding: 5px 7px;
    display: grid;
    align-content: center;
    border-radius: 9px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  .shell[data-density="compact"] .metric-label-row {
    min-block-size: 0;
  }

  .shell[data-density="compact"] .metric-label {
    font-size: 0.62rem;
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .shell[data-density="compact"] .metric-value {
    margin-block-start: 1px;
    font-size: 0.82rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .shell[data-density="compact"] .metric-more-info {
    position: absolute;
    inset: 0;
    z-index: 1;
    inline-size: 100%;
    block-size: 100%;
    min-inline-size: 44px;
    opacity: 0;
  }

  .shell[data-density="compact"] progress {
    block-size: 5px;
  }

  .shell[data-density="compact"] .controls {
    grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
    gap: 6px;
  }

  .shell[data-density="compact"] .controls button {
    min-inline-size: 44px;
    min-block-size: 44px;
    padding: 7px;
    border-radius: 11px;
  }

  .shell[data-density="compact"] .control-text {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .shell[data-density="compact"] .program-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .shell[data-density="compact"] .program {
    min-block-size: 58px;
    padding: 5px 3px;
    grid-template-columns: minmax(0, 1fr);
    place-items: center;
    align-content: center;
    gap: 3px;
    text-align: center;
    border-radius: 10px;
  }

  .shell[data-density="compact"] .program-icon {
    inline-size: 25px;
    block-size: 25px;
    border-radius: 8px;
  }

  .shell[data-density="compact"] .program-icon ha-icon {
    inline-size: 17px;
    block-size: 17px;
    --mdc-icon-size: 17px;
  }

  .shell[data-density="compact"] .program-name {
    min-width: 0;
    max-width: 100%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    font-size: 0.68rem;
    line-height: 1.08;
  }

  .shell[data-density="compact"] .program-description {
    display: none;
  }

  .shell[data-density="compact"] .dock-strip,
  .shell[data-density="compact"] summary,
  .shell[data-density="compact"] .notice {
    min-block-size: 44px;
    padding: 7px 9px;
    font-size: 0.8rem;
  }

  @container (max-width: 420px) {
    .shell[data-density="auto"] {
      --vc-gap: 8px;
      padding: 12px;
    }

    .shell[data-density="auto"] .robot-mark {
      inline-size: 38px;
      block-size: 38px;
      flex-basis: 38px;
    }

    .shell[data-density="auto"] .hero {
      min-block-size: 0;
      grid-template-columns: minmax(0, 1fr);
      padding: 10px;
    }

    .shell[data-density="auto"] .robot-visual {
      display: none;
    }

    .shell[data-density="auto"] .controls {
      grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
    }

    .shell[data-density="auto"] .program-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .shell[data-density="auto"] .program-description {
      display: none;
    }
  }

  /*
   * Adaptive keeps the component modern while borrowing the quiet visual
   * language of Home Assistant's native Tile cards. Every color comes from
   * the active HA theme; accent is reserved for live state and warnings.
   */
  ha-card[data-appearance="adaptive"] {
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, var(--divider-color, rgb(127 127 127 / 24%)));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  .shell[data-appearance="adaptive"] {
    --vc-radius: var(--ha-card-border-radius, 12px);
    --vc-control: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 6%, transparent)
    );
  }

  .shell[data-appearance="adaptive"] .robot-mark {
    color: var(--vc-icon);
    background: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 7%, transparent)
    );
    border: 1px solid transparent;
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] .robot-mark[data-active="true"] {
    color: var(--vc-icon-active);
    background: color-mix(in srgb, var(--vc-accent) 11%, var(--vc-surface));
    border-color: color-mix(in srgb, var(--vc-accent) 24%, transparent);
  }

  .shell[data-appearance="adaptive"][data-density="compact"] .robot-mark[data-active="true"] {
    animation-name: vc-adaptive-pulse;
  }

  .shell[data-appearance="adaptive"] .hero {
    background: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent)
    );
    border: 1px solid var(--divider-color, rgb(127 127 127 / 16%));
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] .robot-body {
    color: var(--secondary-text-color, #687386);
    border-color: color-mix(in srgb, var(--secondary-text-color, #687386) 34%, transparent);
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] button {
    border-radius: 10px;
  }

  .shell[data-appearance="adaptive"] .primary {
    color: var(--primary-text-color, #1f2937);
    background: var(--vc-control);
    font-weight: 650;
  }

  .shell[data-appearance="adaptive"] .primary:hover:not(:disabled) {
    color: var(--vc-accent);
    background: color-mix(in srgb, var(--vc-accent) 10%, var(--vc-control));
  }

  .shell[data-appearance="adaptive"][data-activity="cleaning"] .controls .primary,
  .shell[data-appearance="adaptive"][data-activity="paused"] .controls .primary {
    color: var(--vc-accent);
    background: color-mix(in srgb, var(--vc-accent) 10%, var(--vc-control));
  }

  .shell[data-appearance="adaptive"] .program {
    background: var(--vc-control);
    border: 1px solid var(--divider-color, rgb(127 127 127 / 12%));
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] .program-icon {
    color: var(--program-color, var(--secondary-text-color, #687386));
    background: color-mix(
      in srgb,
      var(--program-color, var(--secondary-text-color, #687386)) 9%,
      transparent
    );
  }

  .shell[data-appearance="adaptive"] .battery,
  .shell[data-appearance="adaptive"] .metric,
  .shell[data-appearance="adaptive"] .dock-strip,
  .shell[data-appearance="adaptive"] details {
    background: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent)
    );
  }

  .shell[data-appearance="adaptive"] .battery[data-charging="true"] {
    color: var(--state-vacuum-active-color, var(--vc-success));
  }

  .shell[data-appearance="adaptive"][data-density="compact"] .battery {
    padding-inline: 3px;
    background: transparent;
  }

  .shell[data-appearance="adaptive"] .control-icon {
    color: var(--vc-icon);
  }

  .shell[data-appearance="adaptive"] .dialog-actions .primary {
    color: var(--vc-on-accent);
    background: var(--vc-accent);
  }

  .shell[data-appearance="adaptive"] .control-icon,
  .shell[data-appearance="adaptive"] .program-icon {
    transition: color 140ms ease, background-color 140ms ease;
  }

  @keyframes vc-adaptive-pulse {
    50% {
      border-color: color-mix(in srgb, var(--vc-accent) 45%, transparent);
      opacity: 0.82;
    }
  }

  @keyframes vc-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes vc-wave {
    from { transform: translateX(-3px); opacity: 0.55; }
    to { transform: translateX(3px); opacity: 1; }
  }

  @keyframes vc-pulse {
    50% { transform: scale(1.04); box-shadow: 0 10px 30px color-mix(in srgb, var(--vc-success) 34%, transparent); }
  }

  @keyframes vc-return {
    50% { transform: translateX(7px); }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;
