# Card Management React Native --- Design System Theme

## 1. Purpose

This document describes the Midnight Navy + Gold design system for the
Card Management React Native application. It adapts the existing web
application's brand palette to native mobile UI.

The mobile app uses React Native, Expo, NativeWind 5 RC, and Tailwind
CSS 4. The values in `theme.json` document the design tokens; they do
not automatically configure NativeWind or React Native at runtime.

## 2. Design Principles

- Use deep navy for brand structure, primary emphasis, and strong
  headings.
- Use warm gold deliberately for brand accents and important actions.
- Use cool neutral surfaces for screens, cards, and content areas.
- Use semantic colors consistently for success, warning, danger, and
  information.
- Maintain consistent spacing, typography, radii, and visual
  hierarchy.
- Design for touch, small screens, safe areas, and Android/iOS
  behavior.
- Never communicate important status by color alone.

## 3. Color Tokens

Use these values through the project's existing theme/token mechanism.
Do not copy hex values into components when an equivalent token exists.

### Surfaces

Token Value Intended use

---

`app` `#f4f6fa` Main screen background
`surface` `#ffffff` Cards, panels, inputs
`subtle` `#f8f9fc` Secondary surfaces
`hover` `#f0f3f9` Pressed/interaction surface where applicable

Native mobile does not have a universal hover state. Use an appropriate
pressed or selected state instead.

### Navigation and brand structure

Token Value Intended use

---

`navigation.bg` `#0c1830` Primary branded navigation surfaces
`navigation.bg2` `#0a1428` Deeper navy surfaces
`navigation.active` `#16264a` Selected navigation item
`navigation.text` `#c8d2e6` Standard navigation text
`navigation.textMute` `#6b7a99` Secondary navigation text
`navigation.textStrong` `#ffffff` High-emphasis text on navy
`brand.gold` `#d49a4d` Primary brand accent
`brand.gold2` `#e2b06b` Lighter gold accent
`brand.goldSoft` `#f5e6cc` Soft gold surface

Gold should be used for emphasis rather than as the default background
for large areas.

### Text

---

Token Value Intended use

---

`ink.primary` `#0c1830` Primary text

`ink.secondary` `#2a3450` Secondary text

`ink.soft` `#4a5673` Supporting text

`ink.mute` `#8a93a8` Muted metadata

`ink.mute2` `#b4bbcc` Very low-emphasis
content; check contrast
carefully
-----------------------------------------------------------------------

### Borders

Token Value Intended use

---

`lines.default` `#e6e8ee` Standard borders and separators
`lines.strong` `#d2d6de` Emphasized borders
`lines.faint` `#f0f1f5` Subtle dividers

### Semantic status colors

State Foreground Background

---

Success `#1f8a5b` `#e6f3ec`
Warning `#c47a1a` `#fbecd3`
Danger `#b03333` `#fbe7e7`
Information `#2a6fdb` `#e8f0fd`

Pair status colors with readable text, icons, or labels. Do not use gold
as a replacement for success or error colors.

### Links

- `links.link1`: `#9193f7`
- `links.link2`: `#383acf`
- `links.link3`: `#2e30a3`

Check contrast and visual clarity before using these link colors on
every surface.

## 4. Typography

The supplied React Native package configuration does not declare Geist
or Orbitron font packages. Use platform system fonts by default rather
than assuming the web application's fonts are available.

- **Screen titles:** clear, semibold or bold system font.
- **Section headings:** medium or semibold system font.
- **Body text:** readable system font with comfortable line spacing.
- **Labels and metadata:** smaller text that remains legible.
- **Financial values:** use consistent numeric formatting and clear
  hierarchy.
- **Technical identifiers:** use a monospace font only when it
  improves readability.

If custom fonts are introduced, use the project's Expo font-loading
setup, verify licensing and platform behavior, and update `theme.json`.

The documented base font size is 14; treat it as a design reference, not
a requirement to make every text element 14 points. Use an appropriate
type scale and support system font scaling.

## 5. Spacing and Layout

Use the established NativeWind spacing scale where supported. The design
system's base spacing unit is 4.

Common spacing references:

Spacing Value

---

Compact 4
Small 8
Medium 12
Standard 16
Large 24
Extra large 32

Prefer consistent spacing over arbitrary values. Adapt layouts to device
width and content rather than assuming desktop-sized fixed dimensions.

## 6. Shape and Surfaces

- Control radius reference: 6.
- Card radius reference: 12.
- Use consistent corner radii across similar components.
- Use a subtle border for cards and inputs when needed.
- Use elevation or shadows sparingly and consistently.
- Avoid relying on web-only CSS shadow syntax; follow React Native
  platform-specific styling APIs.

## 7. Native Component Patterns

### Primary action

- Use a clear, accessible label.
- Use navy for strong structural actions and gold for selected
  high-emphasis brand actions, according to the screen's hierarchy.
- Provide disabled and pressed states.
- Prevent repeated submission while an operation is pending.

### Secondary action

- Prefer a neutral surface or transparent background with a visible
  border.
- Preserve sufficient contrast and a clear touch target.

### Cards and surfaces

- Use the app background for the screen and white surfaces for grouped
  content.
- Use consistent padding, border, and radius tokens.
- Avoid excessive nested cards and unnecessary decoration.

### Status badges

- Use the matching semantic foreground and background.
- Include a text label or accessible description.
- Do not convey status using color alone.

### Forms

- Keep labels close to their fields.
- Show validation errors near the relevant input.
- Use consistent border and focus/active treatment.
- Support keyboard avoidance, scrolling, and accessible labels.
- Follow the project's React Hook Form and Zod conventions.

### Lists

- Use `FlatList` or another appropriate virtualized list for long
  datasets.
- Keep row heights and spacing consistent.
- Provide loading, empty, error, and refresh states where relevant.
- Ensure interactive rows have accessible labels and appropriate touch
  targets.

## 8. NativeWind and CSS Compatibility

The project uses NativeWind 5 RC and Tailwind CSS 4. Confirm that a
utility or token is supported by the actual installed configuration
before using it.

- Do not assume browser DOM APIs or web-only CSS properties are
  available in React Native.
- Do not assume shadcn/ui components or its semantic CSS tokens are
  available in the native application.
- Do not rely on web hover styles, browser scrollbars, or CSS keyframe
  animations for native behavior.
- Use the project's actual theme configuration to expose tokens to
  NativeWind.
- When a native API requires a JavaScript style value, use the
  existing theme accessor or shared constants. Do not invent an
  accessor that the project does not implement.
- Keep `theme.json` synchronized with the implemented design tokens.

## 9. Animation and Interaction

Use React Native Reanimated 4 and Worklets where they provide a suitable
native animation solution.

- Prefer purposeful, subtle transitions.
- Avoid animating large numbers of expensive elements.
- Keep frame-by-frame work off the JavaScript thread when supported by
  the chosen API.
- Respect accessibility and reduced-motion needs where practical.
- Follow installed-version documentation before using animation APIs.
- Do not port web keyframes or `tw-animate-css` utilities directly
  into native components.

## 10. Accessibility

- Provide accessible labels, roles, and states for interactive
  elements.
- Maintain sufficient text and control contrast.
- Do not communicate status by color alone.
- Use appropriately sized touch targets.
- Support system font scaling where practical.
- Keep validation messages close to the affected field.
- Ensure important actions and errors are announced accessibly.
- Test screen-reader behavior and keyboard interactions for relevant
  flows.

## 11. Implementation Rules

1.  Read `THEME.md` and `theme.json` before creating or modifying UI.
2.  Reuse an existing token whenever it represents the intended meaning.
3.  Do not hardcode duplicate colors or arbitrary styling values.
4.  Follow the current NativeWind version and project configuration.
5.  Use native React Native components and platform-compatible behavior.
6.  Keep typography, spacing, borders, radii, and status treatments
    consistent.
7.  Prefer system fonts unless custom fonts are installed and
    configured.
8.  Use Reanimated for native motion where appropriate.
9.  Validate accessibility and Android/iOS behavior.
10. Update this documentation when the actual design system changes.

## 12. Current Configuration

- **Application:** Card Management React Native
- **Brand theme:** Midnight Navy + Gold
- **Framework:** React Native + Expo
- **Styling:** NativeWind 5 RC + Tailwind CSS 4
- **Icons:** `lucide-react-native`
- **Animation:** React Native Reanimated 4 + Worklets
- **Default typography:** Platform system fonts
- **Theme modes documented:** Light
- **Token reference:** `theme.json`

This documentation is adapted from the supplied BMA web design system
and the supplied React Native package/global CSS configuration.
Native-specific runtime integration must be verified against the actual
project files.
