# Vacuum Control Card

[Deutsch](./README.md) | [**English**](./README_EN.md)

A clear and configurable Home Assistant card for vacuum and mop robots. It shows the current status, important cleaning information, custom cleaning programs and, if available, the dock.

![Vacuum Control Card in comfortable view](docs/images/vacuum-control-card-comfortable.png)

The card is not tied to a specific manufacturer. It only requires a `vacuum` entity in Home Assistant. Additional features depend on the entities provided by the device integration.

## Features

- status, battery, progress, cleaned area and duration
- start, pause, stop and return-to-dock controls
- custom cleaning programs with confirmation before every start
- a true compact layout for small dashboard tiles
- selectable overview values and visible card sections
- combined, robot-only and dock-only views
- optional map, cleaning modes, mop intensity and volume
- dock status, tank warnings and mop drying
- configurable maintenance indicators
- subtle status animations that respect reduced-motion settings
- two modern appearance variants that follow the Home Assistant theme
- visual card editor in Home Assistant
- German and English interface

## Preview

| Compact | Compact with programs |
| --- | --- |
| ![Compact Vacuum Control Card](docs/images/vacuum-control-card-compact.png) | ![Compact Vacuum Control Card with cleaning programs](docs/images/vacuum-control-card-compact-programs.png) |

## Supported devices

The basic features work with any vacuum or mop robot whose Home Assistant integration provides a `vacuum.*` entity and the usual vacuum features.

Optional information such as progress, map, mop mode, tanks or dock activity is only shown when matching entities are configured. Cleaning programs can be added directly when the integration exposes suitable button entities.

Roborock is included only as a manufacturer-specific configuration example.

## Installation with HACS

While the card is not yet included in the default HACS catalog:

1. Open HACS in Home Assistant.
2. Open **Custom repositories** in the upper-right menu.
3. Enter the URL of this GitHub repository.
4. Select **Dashboard** as the category.
5. Install **Vacuum Control Card**.
6. Reload Home Assistant or the browser.

## Manual installation

1. Download `dist/vacuum-control-card.js` from this repository or `vacuum-control-card.js` from the latest GitHub release.
2. Copy the file to `/config/www/vacuum-control-card.js`.
3. In Home Assistant, open **Settings → Dashboards → Resources**.
4. Add `/local/vacuum-control-card.js` as a **JavaScript module**.
5. Reload Home Assistant or the browser.

## Adding the card

1. Edit a dashboard.
2. Select **Add card**.
3. Search for **Vacuum Control Card**.
4. Select the robot's `vacuum` entity.
5. Add the desired optional entities and programs in the visual editor.

Alternatively, the minimal YAML configuration is:

```yaml
type: custom:vacuum-control-card
entity: vacuum.my_robot
```

## Cleaning programs

Custom routines can be added as button entities. Tapping a program tile never starts it immediately: a confirmation dialog first shows the program name and target robot.

Programs can be selected, named and assigned a cleaning type in the visual card editor.

## Views

- **Combined:** robot and collapsible dock in one card
- **Robot only:** robot information only; important dock warnings remain visible
- **Dock only:** a separate dock card

The view can be selected directly in the visual editor.

## Appearance

The card uses **Adaptive** by default. This variant follows colors and dark mode from the active Home Assistant theme. Neutral surfaces and subtle outlines help it blend into existing dashboards, while accent colors highlight current states.

For a more expressive design, select **Accent** in the visual editor. This variant uses a stronger gradient and more visible accent colors. The choice only changes the appearance; content, card sizing and safety confirmations remain unchanged.

The variant can also be selected in YAML:

```yaml
appearance: adaptive  # alternatively: accent
```

## Compact card and sizing

The **Compact** density is intended for dashboards with many small cards. The name and current status always remain visible, with the battery shown as the space-saving default. The visual editor lets you individually select battery, progress, cleaned area and cleaning duration, as well as the other visible card sections.

In a Sections dashboard, the compact card starts with a minimum size of 6 × 2 cells. For the other presentations, the card adjusts its minimum width and height to the selected information, programs and sections so text and controls remain readable. It can always be resized to a larger size in Home Assistant.

## Language

The card and its visual editor automatically follow the profile language configured in Home Assistant. German is used for German profiles; English is used for every other language. No separate language option is required in the card.

Entity names, states and selectable values are provided by Home Assistant or the device integration and may therefore use the integration's language.

## Examples

- [Generic example](./examples/generic-vacuum.yaml)
- [Roborock](./examples/roborock.yaml)

Entity IDs differ between manufacturers, integrations and local naming. Optional entities that are not available can simply be omitted.
