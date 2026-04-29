import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook that uses ResizeObserver to track whether a container element
 * exceeds a given width threshold. Works inside drawers, modals, and other
 * containers where viewport-based Tailwind breakpoints don't apply.
 *
 * @param threshold - Width in px at which `isWide` flips to true (default 700)
 * @returns `[ref, isWide]` — attach `ref` to the container element
 *
 * @example
 * const [cardRef, isWide] = useContainerWidth(600)
 * <Card ref={cardRef}>
 *   <div className={isWide ? 'grid-cols-2' : 'grid-cols-1'}>…</div>
 * </Card>
 */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>(
  threshold = 700
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [isWide, setIsWide] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ro = new ResizeObserver(([entry]) => {
      setIsWide(entry.contentRect.width >= threshold)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [threshold])

  return [ref, isWide]
}
