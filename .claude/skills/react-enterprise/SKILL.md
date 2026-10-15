---
name: react-native-enterprise
description: Use when creating, modifying, reviewing, refactoring, debugging, or architecting the Banking Management React Native application, including Expo Router routes, screens, native UI components, TypeScript, Redux Toolkit, RTK Query, forms, navigation, animations, styling, and mobile application features.
---

# Purpose

Apply the enterprise React Native engineering standards before generating, reviewing, or modifying application code.

# Required Reference

Read and follow `REACT_NATIVE_APPLICATION_GUIDELINES.md`. Treat it as the source of truth for this application's architecture and engineering conventions.

# Known Technology Stack

- React 19
- React Native
- TypeScript with strict typing
- Expo SDK and Expo Router
- Redux Toolkit and React Redux
- RTK Query for API communication
- React Hook Form and Zod
- NativeWind 5 RC / Tailwind CSS 4, according to the current project configuration
- `react-native-safe-area-context`
- React Native Reanimated 4 and `react-native-worklets`
- `react-native-toast-message`
- `lucide-react-native`

Check `package.json`, Expo configuration, and existing source files before relying on versions or assuming a library is configured. Do not silently add dependencies.

# Core Rules

Always follow the guidelines for:

- Expo Router navigation and route organization
- Native React Native component APIs and platform behavior
- TypeScript and component conventions
- Feature boundaries and reusable UI
- Redux Toolkit, RTK Query, and API error handling
- React Hook Form and Zod validation
- NativeWind and application theme tokens
- Performance, animations, and list rendering
- Accessibility and responsive layouts
- Security, session handling, and sensitive financial data
- Testing, linting, and validation

# Code Generation Rules

- Use TypeScript and preserve strict type safety.
- Prefer function components and current React patterns.
- Use React Native primitives such as `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, and `FlatList`, or existing project components.
- **Portal alternatives:** Never use `createPortal` from `react-dom` in React Native. Use `@rn-primitives/portal` for supported overlay use cases, such as popovers, dropdowns, and tooltips, following its installed API and provider requirements. Use React Native's `Modal` for modal dialogs and full-screen overlays. Prefer existing project components and portal infrastructure where available.
- **Conditional rendering with `Activity`:** Prefer React's `<Activity>` component for conditional visibility when the UI should be hidden while preserving its component state, and the installed React Native runtime supports it. Use `mode="visible"` or `mode="hidden"` to control visibility. Use ordinary conditional rendering (`{condition && <Component />}`) when the component should unmount and its local state should be reset. Do not use `<Activity>` indiscriminately when unmounting is the intended behavior.
- Use Expo Router for navigation; do not introduce another navigation system without explicit approval.
- Use RTK Query for server-state fetching and mutations when it fits the existing API architecture.
- Use Redux Toolkit only for shared client state that genuinely belongs in the store.
- Use React Hook Form + Zod for non-trivial forms, following existing project patterns.
- Reuse the existing theme, design tokens, UI components, hooks, and API utilities.
- Match the established project structure and import aliases.
- Prefer maintainable, accessible, platform-correct solutions over shortcuts.
- Explain any required package/configuration changes and provide the exact npm command when installation is needed.
- **React Native Reusables:** Prefer React Native Reusables for customizable native UI components. Follow the official documentation, verify compatibility with the existing project configuration, and reuse established components and theme tokens before adding new dependencies.

# Code Review Rules

Verify:

- Type safety and correct native APIs
- Android and iOS behavior where applicable
- Safe-area and keyboard behavior
- Loading, empty, error, success, and offline states as relevant
- Accessibility labels, roles, focus, touch targets, and contrast
- List and rendering performance
- Navigation and state lifecycle
- Form validation and duplicate-submit prevention
- API error handling and secure handling of credentials/session data
- Compliance with `REACT_NATIVE_APPLICATION_GUIDELINES.md`

# Forbidden or Discouraged Patterns

- `any` or unsafe type assertions without a justified boundary
- Class components for new application code
- Web-only DOM APIs, `document`, `window`, `createPortal`, or HTML elements in native code
- Assuming browser CSS, shadcn/ui web components, or web-only Tailwind utilities work in React Native
- Hardcoded colors or spacing when a theme token exists
- API calls and business rules embedded directly in presentational components
- Duplicated business logic or duplicated API state
- Unnecessary `useEffect` chains or effects used to derive values
- Unnecessary memoization without a demonstrated need
- Unstable list keys, nested virtualized lists without a reason, or large unoptimized lists
- Logging tokens, passwords, card data, personal data, or sensitive API payloads
- Adding dependencies or changing project configuration without need

# Output Rules

Produce production-oriented, maintainable, reusable code that follows the current repository patterns. State assumptions when the repository does not establish a requirement. If a required architectural decision or technology is genuinely unknown, ask before creating or changing files rather than guessing.
