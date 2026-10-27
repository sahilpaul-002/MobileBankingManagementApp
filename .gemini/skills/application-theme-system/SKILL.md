---
description: Use when creating, modifying, reviewing, or designing React
  Native UI components, screens, forms, lists, cards, navigation, and
  visual interfaces for the Card Management application.
name: application-theme-system
---

# Application Theme System Skill

Before generating or modifying UI:

1.  Read `THEME.md` and `theme.json`.
2.  Inspect the current NativeWind and global CSS configuration before
    using theme tokens.
3.  Follow the color, typography, spacing, radius, component,
    responsive-layout, and accessibility guidance in `THEME.md`.
4.  Prefer existing design tokens and reusable components.
5.  Never hardcode a color when an existing token represents the same
    purpose.
6.  Do not assume browser CSS, DOM behavior, web Tailwind utilities, or
    shadcn/ui components work directly in React Native.
7.  Use only styling syntax supported by the installed NativeWind
    version and project configuration.
8.  For native styling APIs that cannot consume CSS variables, use the
    project's established theme/token access pattern. Do not invent a
    token API.
9.  Keep the visual identity consistent across Android and iOS.
10. Do not add fonts, styling libraries, or UI dependencies without
    checking the project configuration and relevant skills first.

Default brand theme: **Midnight Navy + Gold**.

The React Native application uses NativeWind 5 RC, Tailwind CSS 4,
React Native Reusables, and native React Native components. Treat `theme.json` as design-system
documentation; it is not automatically a runtime theme configuration
unless the project explicitly implements that integration.
