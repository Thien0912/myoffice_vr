import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Custom hook that dynamically calculates remaining viewport height for an element.
 * Uses getBoundingClientRect + ResizeObserver to keep the height accurate
 * as the window resizes or sibling content changes (e.g. collapsible panels).
 *
 * Solves the common problem of needing a table/list to fill remaining space
 * with sticky headers, without creating nested scrollbars.
 *
 * @param deps - Additional dependencies that trigger a recalculation (e.g. toggle states)
 * @param minHeight - Minimum height in px (default 200)
 * @returns `[ref, height]` — attach `ref` to the container element
 *
 * @example
 * const [tableRef, tableHeight] = useRemainingHeight([showStats])
 * <div ref={tableRef} style={{ height: tableHeight }}>
 *   <Table className="h-full overflow-y-auto" />
 * </div>
 */
export function useRemainingHeight<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = [],
  minHeight = 200
): [React.RefObject<T | null>, number | undefined] {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  const recalc = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const available = window.innerHeight - rect.top
    setHeight(Math.max(available, minHeight))
  }, [minHeight])

  // Core listeners: window resize + parent layout shifts
  useEffect(() => {
    recalc()
    window.addEventListener('resize', recalc)

    const observer = new ResizeObserver(recalc)
    if (ref.current?.parentElement) {
      observer.observe(ref.current.parentElement)
    }

    return () => {
      window.removeEventListener('resize', recalc)
      observer.disconnect()
    }
  }, [recalc])

  // Recalculate when external deps change (e.g. collapsible panel toggles)
  useEffect(() => {
    const timer = setTimeout(recalc, 50)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, recalc])

  return [ref, height]
}
