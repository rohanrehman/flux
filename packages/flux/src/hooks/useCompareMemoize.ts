// Phaze migration: deep/shallow memoization is unnecessary because phaze
// components run once. The hook bodies become pass-through evaluations of
// `fn()` — no caching needed since there's no re-render to short-circuit.
// Kept as exports so existing callers don't have to be touched in the same
// commit; consumers can be deleted in follow-up cleanup as they're
// already conceptually obsolete in the phaze model.

export function useCompareMemoize<T>(value: T, _deep: boolean): T {
  return value
}

export function useShallowMemo<T>(fn: () => T, _deps?: readonly unknown[] | undefined): T {
  return fn()
}

export function useDeepMemo<T>(fn: () => T, _deps?: readonly unknown[] | undefined): T {
  return fn()
}
