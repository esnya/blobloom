# Ref and Dependency Review

The following files contain `useRef` usage or effects with potential dependency issues. Only DOM access should rely on refs. State should handle other updates, and hook dependencies should prevent unnecessary renders.

## Files with DOM refs
- `src/client/components/FileCircle.tsx` – `containerRef` references a `div` element for position updates.
- `src/client/components/FileCircleSimulation.tsx` – `containerRef` manages container measurements.

These usages are tied to DOM interactions and appear justified.

## Files with non-DOM refs
- `src/client/hooks/useFileCircleHandles.ts` – stores a map of handles. Could be converted to state to trigger updates when handles change.
- `src/client/hooks/useCountAnimation.ts` – refs manage animation state (start time, target value). Evaluate if state would be more appropriate for some values.
- `src/client/hooks/useTypewriter.ts` – timer and previous value are stored in refs. Consider state to reflect updates.
- `src/client/hooks/useTimelineData.ts` – multiple refs track request state (`renameMapRef`, `token`, `inFlight`, `nextRef`). These may be refactored into stateful values to ensure React updates propagate correctly.

## Dependency checks
- `src/client/hooks/useCssAnimation.ts` and `useGlowAnimation.ts` disable `react-hooks/exhaustive-deps` for callbacks. Verify the dependency arrays to avoid missing updates.
- `src/client/hooks/usePlayer.ts` also disables exhaustive deps when creating the player instance. Ensure all external values are included.

These areas should be reviewed to confirm that refs are only used for DOM access and that effect dependencies are complete.
