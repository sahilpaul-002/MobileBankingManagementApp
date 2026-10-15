# React Native Application - Development Guidelines

> **Version:** 1.0  
> **Last Updated:** October 2026  
> **Purpose:** Source of truth for engineering a production-oriented Card Management application using React Native, Expo, TypeScript, Redux Toolkit, and RTK Query.

---

## 1. Project Overview

This is a native mobile application for card and banking-management workflows. The codebase should prioritize:

- **Type safety:** strict TypeScript and explicit API/form models.
- **Feature separation:** routes, UI, API integration, and business logic have clear responsibilities.
- **Native user experience:** mobile navigation, safe areas, keyboard handling, gestures, touch targets, and platform behavior.
- **Security:** careful handling of authentication, sessions, cardholder information, and financial data.
- **Reliability:** predictable loading, empty, error, offline, and mutation states.
- **Consistency:** shared design tokens, reusable components, and established project patterns.
- **Performance:** responsive interactions, efficient lists, and restrained animation work.

This document is the source of truth for the React Native application. Existing implementation and package configuration take precedence over assumptions in examples.

## 2. Technology Stack

### Core

- React 19
- React Native
- TypeScript
- Expo SDK
- Expo Router

### State and networking

- Redux Toolkit
- React Redux
- RTK Query for server-state requests, caching, and mutations
- Existing shared Axios/base-query and error-handling utilities, if present

### Forms and validation

- React Hook Form
- Zod
- `@hookform/resolvers`

### Styling and UI

- NativeWind 5 RC / Tailwind CSS 4, as currently configured
- Existing application theme tokens and reusable native UI components
- `react-native-safe-area-context`
- `lucide-react-native`

### Animation and feedback

- React Native Reanimated 4
- `react-native-worklets`
- `react-native-toast-message`

### Project-specific rule

Before changing dependencies, Babel/Metro configuration, Expo plugins, native settings, or styling setup, inspect `package.json`, the relevant configuration files, and the existing implementation. Do not infer that a package is fully configured merely because it appears in `package.json`. Use `npx expo install <package>` for Expo-compatible package installation when appropriate, and use npm for package management.

## 3. Architecture and Folder Structure

Use Expo Router and the repository's existing folder structure. The known project uses `src/app/` as the Expo Router root. Do not reorganize the application or invent a parallel architecture during a feature task.

A reasonable responsibility map, to be reconciled with the actual repository, is:

```text
src/
├── app/                    # Expo Router route files and layouts
├── components/
│   ├── common/             # Shared application-level UI
│   └── ui/                 # Reusable primitive UI components, if established
├── features/               # Feature-specific screens, components, hooks, types
├── layouts/                # Shared layout composition, if established
├── screens/                # Shared screen composition, if established
├── redux/
│   ├── features/           # RTK Query API definitions, organized by domain
│   ├── hooks/              # Typed Redux hooks
│   ├── slice/              # Client-state slices
│   └── store.ts            # Store configuration; retain actual repository name
├── services/               # Reusable business/service operations, if established
├── theme/                  # Theme tokens or helpers, if established
├── types/                  # Shared types, if established
└── utils/                  # Pure reusable helpers
```

This is a responsibility guide, not an instruction to create every directory. Follow the real project tree and naming conventions. Do not duplicate existing abstractions or move files without a task-specific reason.

### Responsibility boundaries

- **Route files:** declare screens and navigation structure; keep business logic limited.
- **Screens:** compose feature components and coordinate screen-level query/form state.
- **Components:** render focused UI and expose typed props.
- **Feature modules:** contain domain-specific components, hooks, schemas, types, and logic where the repository's organization supports this.
- **RTK Query APIs:** own server requests, cache behavior, tags, and mutation definitions.
- **Slices:** hold shared client state that is not better represented as server state or local component state.
- **Services:** encapsulate multi-step business operations when they need reuse or isolation.
- **Utilities:** contain small, well-typed, preferably pure helpers.
- **Layouts/providers:** establish shared navigation presentation and application-wide providers.

## 4. Naming Conventions

- Components and screen components: `PascalCase.tsx`, e.g. `CardDetailsScreen.tsx`.
- Hooks: `use` + descriptive name, e.g. `useCardDetails.ts`.
- Utilities and service modules: `camelCase.ts`, e.g. `formatCardNumber.ts`.
- Redux slices: descriptive `camelCase` names ending in `Slice.ts`.
- RTK Query APIs: descriptive `camelCase` names ending in `Api.ts` or follow the existing convention.
- Schemas: descriptive names ending in `Schema`, e.g. `cardLimitSchema`.
- Types and interfaces: `PascalCase`, with domain-specific names such as `CardDetails` or `CreateCardRequest`.
- Booleans: use meaningful prefixes such as `is`, `has`, `can`, or `should`.
- Event handlers: use `handle` prefixes when that matches surrounding code, e.g. `handleSubmit`.
- Avoid abbreviations unless they are established domain terms.

Do not rename existing files just to enforce a new convention in an unrelated task.

## 5. React Native and React Patterns

- Use native components: `View`, `Text`, `Pressable`, `TextInput`, `Image`, `ScrollView`, `FlatList`, and other appropriate React Native primitives.
- Use `StyleSheet.create` or the configured NativeWind approach consistent with the component and repository. Avoid mixing styling systems arbitrarily.
- Keep components focused; extract reusable UI when it reduces duplication or clarifies intent.
- Keep render functions free of side effects.
- Use `useEffect` to synchronize with external systems, not to derive values that can be computed during render.
- Do not add `useMemo`, `useCallback`, or `memo` automatically. Use them when identity stability or measured rendering cost makes them useful.
- Keep hooks unconditional and at the top level of components/custom hooks.
- Use stable keys for rendered collections.
- Use React 19 APIs only when supported by the installed React Native runtime and when they fit the native use case. Do not blindly transfer browser React patterns to React Native.
- Do not use DOM elements, `document`, `window`, `createPortal`, `react-dom` form APIs, or browser-only APIs in native code.
- Do not use web-only shadcn/ui components in native screens. Prefer existing native components or compatible native primitives.

## 6. Expo Router and Navigation

- Treat `src/app/` as the route tree unless the actual Expo configuration establishes another root.
- Follow Expo Router file-based routing and existing `_layout.tsx` conventions.
- Use route groups and layouts to express navigation structure rather than manually duplicating navigation logic.
- Use typed route patterns supported by the installed Expo Router version and the project's TypeScript setup.
- Use the project's existing navigation helpers and route constants when available.
- Avoid passing secrets or sensitive personal/financial data in route parameters. Pass stable identifiers where appropriate and retrieve authorized data through the established data layer.
- Handle back navigation, deep links, authentication gates, and invalid/missing route parameters deliberately.
- Keep global providers and application-wide UI in the established root layout/provider composition.
- Do not add React Navigation configuration alongside Expo Router unless the project has a documented need.

## 7. State Management

Use the smallest state scope that meets the requirement:

1. **Local component state:** ephemeral UI state such as expanded panels, password visibility, or a temporary selection.
2. **React Hook Form:** form values, touched state, and form validation state.
3. **RTK Query:** remote data, cache, request lifecycle, and server mutations.
4. **Redux slices:** shared client state that genuinely needs to be accessed across routes or features.

Rules:

- Avoid duplicating RTK Query data in a Redux slice.
- Prefer selectors for derived Redux state rather than storing redundant values.
- Keep reducers pure and use Redux Toolkit's Immer behavior correctly.
- Use typed `RootState` and `AppDispatch`, and project-typed hooks.
- Reset or invalidate sensitive/user-specific state appropriately on logout or session expiry.
- Do not store credentials, tokens, full card numbers, CVV, or other sensitive values in general-purpose Redux state or persistent storage unless a reviewed security design explicitly requires it.

## 8. API Integration and RTK Query

- Use the existing shared API/base-query layer and API conventions.
- Define request and response types; validate untrusted data at boundaries when required by the project.
- Keep endpoint definitions out of presentational components.
- Use RTK Query query and mutation hooks for requests that belong to the shared server-state layer.
- Use `.unwrap()` when a mutation's calling flow needs ordinary promise success/error handling.
- Configure cache tags and invalidation deliberately.
- Distinguish expected domain outcomes from transport/server failures.
- Handle loading, initial loading, refetching, empty data, errors, and successful mutations as appropriate.
- Prevent duplicate submissions and repeated financial actions while a mutation is pending.
- Never log authorization headers, credentials, session identifiers, card data, or sensitive request/response bodies.
- Do not hardcode production URLs, API keys, or secrets in components. Follow the project's environment and configuration strategy.

## 9. Forms and Validation

Use React Hook Form and Zod for non-trivial forms, following existing project wrappers and patterns.

- Define a Zod schema and infer the form data type from it when appropriate.
- Use `zodResolver` with the installed Zod/resolver versions.
- Keep validation rules aligned with server-side validation, without treating client validation as a security boundary.
- Use native-compatible form controls and accessible labels.
- Display field-level errors near their inputs and provide clear submission-level feedback.
- Set keyboard type, capitalization, autocorrect, secure text entry, return-key behavior, and input constraints intentionally.
- Handle keyboard overlap and scrolling on smaller devices.
- Disable or guard duplicate submissions while requests are pending.
- Do not assume HTML `<form>`, `register`-based DOM refs, or React DOM's `useFormStatus` work with native controls. Use the project's React Hook Form `Controller`/controlled-input patterns where needed.
- For card and payment-related forms, validate amount/limit boundaries, currency, status, and other business rules in the domain layer and on the server as well.

## 10. Styling and Application Theme

- Read the project's `application-theme-system/SKILL.md` and `THEME.md` when changing visual UI, if those files are available in the repository.
- Use the Midnight Navy + Gold theme and semantic tokens already established by the project.
- Reuse existing theme-aware components and NativeWind utilities.
- Avoid hardcoded colors, spacing, radii, and typography when a token or shared component exists.
- Do not assume CSS variables or Tailwind utilities behave natively unless supported by the configured NativeWind/native styling version.
- Follow the installed NativeWind 5 RC / Tailwind CSS 4 configuration rather than copying web Tailwind setup instructions.
- Ensure text/background contrast, visible focus/pressed/disabled states, and consistent spacing.
- Use platform-appropriate font configuration; do not assume web fonts or CSS font stacks are installed on native platforms.
- Keep styling changes local and avoid broad global CSS changes for a single component.
- Do not introduce a dark theme or additional theme variants unless the app's requirements and theme implementation support them.

## 11. Mobile Layout, Safe Areas, and Keyboard

- Use `react-native-safe-area-context` and the established safe-area pattern.
- Consider status bars, notches, gesture areas, orientation, and small screens.
- Avoid fixed screen dimensions where flexible layout works.
- Prefer Flexbox and content-driven sizing; account for long localized text and dynamic font scaling.
- Use keyboard-aware behavior for forms and ensure fields and submit actions remain reachable.
- Test scrollable content with the keyboard open and closed.
- Respect platform differences between Android and iOS instead of assuming identical behavior.
- Do not use `Dimensions` as a substitute for responsive layout unless actual screen measurements are required.

## 12. Lists and Performance

- Use `FlatList` or another suitable virtualized list for long or unbounded collections.
- Provide stable keys and avoid expensive calculations or component creation in list render paths.
- Keep list item components focused and avoid unnecessary parent state updates.
- Do not nest virtualized lists with the same orientation without a clear, tested reason.
- Tune `FlatList` options only when supported by observed requirements; do not copy arbitrary performance settings.
- Load images at appropriate sizes and avoid unnecessary large assets.
- Keep animation work on the UI thread where Reanimated supports it; avoid unnecessary JS-thread work during gestures.
- Test performance on a representative Android emulator/device and iOS where available.

## 13. Animation and Gestures

- Use React Native Reanimated and Worklets only according to the installed versions and project configuration.
- Follow existing animation utilities and conventions before introducing new ones.
- Keep animations purposeful, brief, and non-blocking.
- Respect reduced-motion preferences where the app supports them.
- Avoid running expensive calculations or React state updates on every animation frame.
- Clean up subscriptions, gesture handlers, and external resources according to their APIs.
- Do not assume web CSS transitions or browser animation APIs are available.

## 14. Accessibility

- Give controls meaningful accessible labels, roles, and states.
- Make interactive areas comfortably touchable and avoid communicating status through color alone.
- Ensure text remains readable under font scaling.
- Provide clear validation and error announcements using the project's native accessibility patterns.
- Ensure loading indicators and disabled states are understandable.
- Maintain logical focus and screen-reader order.
- Check contrast for text, icons, status badges, and disabled controls.
- Avoid icon-only actions without an accessible label.

## 15. Security and Financial Data

- Treat authentication, session state, cardholder details, account identifiers, balances, and transactions as sensitive.
- Never place secrets in source code, logs, screenshots, analytics events, route parameters, or error messages.
- Do not store CVV or full payment-card data unless an explicit, compliant product requirement and secure architecture authorize it.
- Use secure storage only when the project's authentication/session design calls for it; do not substitute ordinary AsyncStorage for secure credential storage.
- Clear user-specific state on logout and handle session expiry consistently.
- Do not rely on hidden UI controls for authorization. The backend must authorize every sensitive operation.
- Avoid exposing sensitive values in accessibility labels or debug UI.
- Sanitize and constrain user-controlled data before displaying it in contexts where interpretation could be unsafe.
- Follow the existing encryption, session, and API security architecture rather than inventing a new scheme in a feature task.

## 16. Error, Loading, and Feedback States

For every data-driven screen or action, consider which states are relevant:

- Initial loading
- Refreshing or background refetch
- Empty result
- Recoverable error with retry
- Session expiry or unauthorized access
- Mutation pending
- Mutation success
- Mutation failure
- Offline or connectivity failure when supported

Use the application's existing toast, banner, error handler, and loading components. Avoid multiple competing notifications for the same failure. User-facing messages should be clear and must not expose internal stack traces or sensitive server details.

## 17. Testing and Validation

- Follow the testing tools and scripts actually configured in the repository.
- Add or update tests for business rules, validation schemas, selectors, utilities, and important interaction paths where test infrastructure exists.
- Cover success, failure, boundary, loading, and empty states for critical workflows.
- For card-management workflows, test authorization-sensitive UI states but do not treat UI tests as a substitute for backend authorization tests.
- Run relevant checks after changes, such as the configured lint, TypeScript, test, and Expo validation commands.
- Do not claim a check passed unless it was run and its result is known.
- If a check cannot be run, state that clearly and provide the command for the user.

## 18. Development Workflow

Before editing:

1. Read this guide and `.claude/skills/react-native-enterprise/SKILL.md`.
2. Inspect the relevant route, component, hook, API, schema, and existing tests.
3. Inspect `package.json` and configuration when dependencies or native behavior are involved.
4. Identify existing shared components, theme tokens, and project patterns.
5. Clarify requirements only when a decision materially affects correctness and cannot be determined from the repository or request.

While implementing:

1. Make the smallest cohesive change.
2. Preserve established architecture and public interfaces unless the task requires a change.
3. Keep UI, API integration, and business rules separated.
4. Add appropriate error and accessibility states.
5. Avoid unrelated refactors and unrequested dependencies.

After implementing:

1. Review the diff for correctness and unnecessary changes.
2. Run relevant configured lint/type/test checks.
3. Check native platform behavior where possible.
4. Summarize changed files, meaningful decisions, and validation results.

## 19. Forbidden or Discouraged Patterns

- `any` without a justified and isolated boundary
- New class components
- Web DOM APIs and browser-only components in native code
- Treating shadcn/ui web components as React Native components
- Unreviewed dependencies or native configuration changes
- Duplicated business logic, server data, or error-handling logic
- Unnecessary effects, effect chains, and derived state
- Memoization without a clear need
- Unstable list keys or non-virtualized large lists
- Hardcoded theme values when tokens exist
- API calls and business rules embedded in presentational UI
- Sensitive financial or authentication data in logs or insecure storage
- Claiming tests, builds, or platform checks passed without running them

---

**Maintainer:** Banking Management application team  
**Version:** 1.0  
**Last Updated:** October 2026
