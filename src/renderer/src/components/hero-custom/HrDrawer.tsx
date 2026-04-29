import { useRef, useCallback, useEffect, useState, Suspense, type ReactNode } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Tooltip,
  cn
} from '@heroui/react'
import { ArrowLeft, GripVertical, Info, Maximize2, Minimize2, X } from 'lucide-react'

/* ──────────── Constants ──────────── */

const MIN_PANEL_WIDTH = 500

/* ──────────── Suspense fallback for secondary panel ──────────── */
function SecondaryFallback() {
  return (
    <div className="flex flex-col gap-4 p-1 animate-pulse">
      <div className="h-9 bg-default-200 rounded-lg w-3/4" />
      <div className="h-9 bg-default-200 rounded-lg w-1/2" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-default-100 rounded-lg" />
        <div className="h-14 bg-default-100 rounded-lg" />
        <div className="h-14 bg-default-100 rounded-lg" />
        <div className="h-14 bg-default-100 rounded-lg" />
      </div>
      <div className="h-9 bg-default-200 rounded-lg w-2/3 mt-2" />
    </div>
  )
}
const MIN_PRIMARY_WIDTH = 500 // Floor for primary panel — ensures 2-col form layout
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

/* ──────────── Types ──────────── */

interface HrDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOpenChange?: (open: boolean) => void
  placement?: 'left' | 'right' | 'top' | 'bottom'
  backdrop?: 'transparent' | 'opaque' | 'blur'
  isDismissable?: boolean
  isKeyboardDismissDisabled?: boolean
  children: ReactNode
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  onWidthChange?: (width: number) => void
  classNames?: Partial<Record<'wrapper' | 'base' | 'backdrop' | 'header' | 'body' | 'footer' | 'closeButton' | 'secondaryHeader' | 'secondaryBody', string>>
  resizable?: boolean
  showMaximize?: boolean

  /* ── Secondary panel ── */
  secondaryContent?: ReactNode
  secondaryTitle?: ReactNode
  secondaryHeaderActions?: ReactNode
  secondaryFooter?: ReactNode
  isSecondaryOpen?: boolean
  onSecondaryClose?: () => void
  secondaryWidth?: number

  /* ── Primary panel toggle ── */
  isPrimaryHidden?: boolean
  onShowPrimary?: () => void

  /* ── Portal Container ── */
  portalContainer?: HTMLElement
  /* ── Block outside interaction when drawer is open ── */
  blockOutside?: boolean
  /* ── Use floating UI styles (for new Stitch-like design) ── */
  isFloatingUI?: boolean
  /* ── Gap from viewport edges for floating UI (e.g. 16, "20px") ── */
  floatingGap?: number | string
}

/* ──────────────────────────────────
   HrDrawer — Resizable dual-panel drawer
   ────────────────────────────────── */

export function HrDrawer({
  isOpen,
  onClose,
  onOpenChange,
  placement = 'right',
  backdrop = 'transparent',
  isDismissable = false,
  isKeyboardDismissDisabled = true,
  children,
  minWidth = 320,
  maxWidth = 1200,
  defaultWidth = 420,
  onWidthChange,
  classNames: extraClassNames,
  secondaryContent,
  secondaryTitle,
  secondaryHeaderActions,
  secondaryFooter,
  isSecondaryOpen = false,
  onSecondaryClose,
  secondaryWidth: defaultSecondaryWidth = 400,
  resizable = true,
  showMaximize = false,
  isPrimaryHidden = false,
  onShowPrimary,
  portalContainer,
  blockOutside = false,
  isFloatingUI = false,
  floatingGap = 16
}: HrDrawerProps) {
  const [primaryWidth, setPrimaryWidth] = useState(defaultWidth)
  const [secWidth, setSecWidth] = useState(defaultSecondaryWidth)
  const [isMaximized, setIsMaximized] = useState(false)

  // Restore normal width when un-maximizing
  const widthBeforeMaximize = useRef(defaultWidth)
  // Two-phase: after CSS transition ends, then shrink outer drawer
  const [primaryExited, setPrimaryExited] = useState(false)

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT)
  const [isTablet, setIsTablet] = useState(window.innerWidth < TABLET_BREAKPOINT)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      setIsTablet(window.innerWidth < TABLET_BREAKPOINT)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Layout modes:
  // - mobile: full-width drawer, secondary fully overlays primary
  // - tablet: drawer keeps primaryWidth, secondary partially overlays (resizable)
  // - desktop: side-by-side, auto-shrink primary if total exceeds viewport
  const isOverlayMode = isTablet && !isMobile

  // Refs for outer (left edge) resize
  const isOuterResizing = useRef(false)
  const outerStartX = useRef(0)
  const outerStartTotal = useRef(0)

  // Refs for inner (divider) resize — used in both side-by-side and overlay mode
  const isInnerResizing = useRef(false)
  const innerStartX = useRef(0)
  const innerStartPrimary = useRef(0)
  const innerStartSecondary = useRef(0)

  // Desktop: auto-shrink primary when secondary opens AFTER drawer is already open
  // (handles case where user opens secondary panel while drawer is open)
  useEffect(() => {
    if (!isOpen || !isSecondaryOpen || isMobile || isTablet) return
    const viewportMax = Math.floor(window.innerWidth * 0.95)
    const total = livePrimaryWidth.current + liveSecWidth.current
    if (total > viewportMax) {
      const shrunkPrimary = viewportMax - liveSecWidth.current
      if (shrunkPrimary >= MIN_PRIMARY_WIDTH) {
        setPrimaryWidth(shrunkPrimary)
      }
    }
  }, [isOpen, isSecondaryOpen, isMobile, isTablet])

  // Reset primaryExited when showing primary again
  useEffect(() => {
    if (!isPrimaryHidden) setPrimaryExited(false)
  }, [isPrimaryHidden])

  // Compute total drawer width based on mode
  // Only shrink AFTER exit animation completes (primaryExited = true)
  const totalWidth = isMobile
    ? window.innerWidth
    : primaryExited && isSecondaryOpen
      ? secWidth
      : isOverlayMode
        ? primaryWidth
        : isSecondaryOpen ? primaryWidth + secWidth : primaryWidth

  /* ── Mouse Handlers ── */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isOuterResizing.current && !isInnerResizing.current) return

      if (rafId.current) cancelAnimationFrame(rafId.current)

      rafId.current = requestAnimationFrame(() => {
        if (isOuterResizing.current) {
          const delta = outerStartX.current - e.clientX
          const viewportMax = Math.min(maxWidth, window.innerWidth)
          const primaryFloor = Math.max(minWidth, MIN_PRIMARY_WIDTH)
          const effectiveMinWidth =
            !isOverlayMode && isSecondaryOpen ? primaryFloor + MIN_PANEL_WIDTH : primaryFloor
          const newTotal = Math.min(
            Math.max(outerStartTotal.current + delta, effectiveMinWidth),
            viewportMax
          )

          if (!isOverlayMode && isSecondaryOpen) {
            const newPrimary = newTotal - liveSecWidth.current
            if (newPrimary >= MIN_PRIMARY_WIDTH) {
              livePrimaryWidth.current = newPrimary
              setPrimaryWidth(newPrimary)
            }
          } else {
            livePrimaryWidth.current = newTotal
            setPrimaryWidth(newTotal)
          }
        }

        if (isInnerResizing.current) {
          if (isOverlayMode) {
            const delta = innerStartX.current - e.clientX
            const maxOverlay = livePrimaryWidth.current - 80
            const newSecondary = Math.min(
              Math.max(innerStartSecondary.current + delta, MIN_PANEL_WIDTH),
              maxOverlay
            )
            liveSecWidth.current = newSecondary
            setSecWidth(newSecondary)
          } else {
            const delta = innerStartX.current - e.clientX
            const viewportLimit = Math.floor(window.innerWidth * 0.95) - livePrimaryWidth.current
            const newSecondary = Math.min(
              Math.max(innerStartSecondary.current + delta, MIN_PANEL_WIDTH),
              viewportLimit
            )
            liveSecWidth.current = newSecondary
            setSecWidth(newSecondary)
          }
        }
      })
    },
    [minWidth, maxWidth, isSecondaryOpen, isOverlayMode]
  )

  const handleMouseUp = useCallback(() => {
    if (isOuterResizing.current || isInnerResizing.current) {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      isOuterResizing.current = false
      isInnerResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setPrimaryWidth(livePrimaryWidth.current)
      setSecWidth(liveSecWidth.current)
    }

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  /* ── Outer left-edge resize (changes total drawer width) ── */
  const handleOuterMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return
      e.preventDefault()
      e.stopPropagation()
      isOuterResizing.current = true
      outerStartX.current = e.clientX
      outerStartTotal.current = totalWidth
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [totalWidth, isMobile, handleMouseMove, handleMouseUp]
  )

  /* ── Inner divider / overlay resize ── */
  const handleInnerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return
      e.preventDefault()
      e.stopPropagation()
      isInnerResizing.current = true
      innerStartX.current = e.clientX
      innerStartPrimary.current = primaryWidth
      innerStartSecondary.current = secWidth
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [primaryWidth, secWidth, isMobile, handleMouseMove, handleMouseUp]
  )

  // Pending rAF id for throttled resize
  const rafId = useRef<number>(0)
  // Live width refs — updated every mousemove, committed to state on mouseUp
  const livePrimaryWidth = useRef(primaryWidth)
  const liveSecWidth = useRef(secWidth)

  // Keep refs in sync with state (for when state changes outside of drag)
  useEffect(() => {
    livePrimaryWidth.current = primaryWidth
  }, [primaryWidth])
  useEffect(() => {
    liveSecWidth.current = secWidth
  }, [secWidth])

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [handleMouseMove, handleMouseUp])

  // Reset widths when opening — clamp to viewport + apply auto-shrink immediately
  useEffect(() => {
    if (!isOpen) return
    const vw = window.innerWidth
    const viewportMax = Math.floor(vw * 0.95)
    const newPrimary = Math.min(defaultWidth, viewportMax)
    const newSec = Math.min(defaultSecondaryWidth, vw - MIN_PANEL_WIDTH)

    // In desktop side-by-side mode: if both panels exceed viewport, shrink primary immediately
    // (avoids 2-effect race where reset overrides auto-shrink's earlier correction)
    if (!isMobile && !isTablet && isSecondaryOpen && newPrimary + newSec > viewportMax) {
      const shrunkPrimary = viewportMax - newSec
      setPrimaryWidth(shrunkPrimary >= MIN_PRIMARY_WIDTH ? shrunkPrimary : newPrimary)
    } else {
      setPrimaryWidth(newPrimary)
    }
    setSecWidth(newSec)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultWidth, defaultSecondaryWidth])

  // Notify parent of width changes
  useEffect(() => {
    onWidthChange?.(totalWidth)
  }, [totalWidth])

  const isAnyResizing = isOuterResizing.current || isInnerResizing.current

  /* ── Handle close ── */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange?.(open)
      if (!open) onClose()
    },
    [onOpenChange, onClose]
  )

  return (
    <>
      <Drawer
        classNames={{
          wrapper: cn(
            // When blockOutside=true: keep HeroUI's full-viewport wrapper so backdrop
            // covers the entire screen (not just the drawer panel area on the right).
            // When blockOutside=false: !w-auto shrinks wrapper to drawer width so it
            // doesn't sit over other elements (safe since pointer-events-none anyway).
            blockOutside
              ? 'pointer-events-auto'
              : '!w-auto !pointer-events-none',
            // Prevent wrapper from scrolling — drawer height is self-contained
            '!overflow-hidden',
            extraClassNames?.wrapper
          ),
          backdrop: cn(
            blockOutside ? 'pointer-events-auto !bg-black/30' : '!pointer-events-none',
            extraClassNames?.backdrop
          ),
          base: cn(
            isFloatingUI
              ? '!max-w-none !overflow-hidden !rounded-[24px] shadow-[0px_12px_48px_rgba(0,0,0,0.12)] border border-[#e0e2ed] pointer-events-auto'
              : '!max-w-none !overflow-visible !rounded-tl-2xl !rounded-b-2xl rounded-tr-none shadow-[-24px_0_64px_-8px_rgba(0,0,0,0.18)] border-l border-gray-200 pointer-events-auto',
            isMobile && '!rounded-none !m-0 !h-[100dvh] !max-h-[100dvh] border-none',
            extraClassNames?.base
          ),
          header: cn('border-b border-divider p-0', extraClassNames?.header),
          body: cn('p-0 !min-h-0 !overflow-hidden', extraClassNames?.body),
          footer: cn('border-t border-divider p-0', extraClassNames?.footer),
          closeButton: cn('hidden', extraClassNames?.closeButton)
        }}
        hideCloseButton
        isOpen={isOpen}
        placement={placement}
        backdrop={blockOutside ? 'opaque' : backdrop}
        isDismissable={blockOutside ? false : isDismissable}
        isKeyboardDismissDisabled={blockOutside ? true : isKeyboardDismissDisabled}
        size="full"
        portalContainer={portalContainer}
        style={{
          width: isMobile || isMaximized
            ? '100vw'
            : `${Math.min(totalWidth, window.innerWidth)}px`,
          transition: isAnyResizing ? 'none' : 'width 0.3s ease-out',
          // Floating UI gap and height constraint
          ...(isFloatingUI && !isMobile ? {
            padding: typeof floatingGap === 'number' ? `${floatingGap}px` : floatingGap,
            height: '100vh',
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
          } : {})
        }}
        onOpenChange={handleOpenChange}
        onClose={onClose}
      >
        <DrawerContent>
          {() => (
            <>
              {/* Floating close button — positioned at top-right of the drawer */}
              {isFloatingUI && !isMobile && (
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-[#f3f3fa] text-[#2f323a] hover:bg-[#e0e2ed] transition-colors flex items-center justify-center cursor-pointer border border-[#e0e2ed]/50 shadow-sm"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              )}

              {/* Outer Resize Handle — hidden on mobile or when maximized */}
              {!isMobile && resizable && !isMaximized && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize group hover:bg-blue-400/40 active:bg-blue-500/60 transition-colors duration-150 z-50 overflow-visible"
                  role="separator"
                  tabIndex={0}
                  onMouseDown={handleOuterMouseDown}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-200">
                    <GripVertical
                      className="text-default-400 group-hover:text-default-600 transition-colors"
                      size={12}
                    />
                  </div>
                </div>
              )}

              {/* Panels container */}
              <div
                className={cn(
                  "flex flex-1 min-h-0 relative overflow-hidden",
                  !isFloatingUI && !isMobile && "rounded-tl-2xl rounded-b-2xl rounded-tr-none"
                )}
              >
                {/* Primary Panel — pure CSS transition */}
                <div
                  className="flex flex-col h-full min-h-0 overflow-hidden shrink-0"
                  style={{
                    width: isPrimaryHidden ? 0 : (isMobile ? '100%' : `${primaryWidth}px`),
                    minWidth: 0,
                    transition: isAnyResizing ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onTransitionEnd={(e) => {
                    if (e.propertyName === 'width' && isPrimaryHidden) {
                      setPrimaryExited(true)
                    }
                  }}
                >
                  {children}
                </div>

                {/* ── Desktop: side-by-side with resizable divider ── */}
                {!isMobile && !isOverlayMode && isSecondaryOpen && secondaryContent && (
                  <>
                    {/* Divider — hide when primary is hidden */}
                    {!isPrimaryHidden && (
                      <div
                        className="w-1 shrink-0 cursor-col-resize group hover:bg-blue-400/40 active:bg-blue-500/60 transition-colors duration-150 relative bg-divider"
                        role="separator"
                        tabIndex={0}
                        onMouseDown={handleInnerMouseDown}
                      >
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-5 h-10 flex items-center justify-center">
                          <GripVertical className="text-default-400 group-hover:text-default-600 transition-colors" size={14} />
                        </div>
                      </div>
                    )}

                    {/* Secondary Panel — fixed at right edge via marginLeft auto */}
                    <div
                      className="flex flex-col h-full overflow-hidden animate-secondarySlideIn shrink-0"
                      style={{ width: `${secWidth}px`, marginLeft: isPrimaryHidden ? 'auto' : undefined }}
                    >
                      <div className={cn("flex items-center justify-between h-[72px] px-4 md:px-6 border-b border-divider shrink-0", extraClassNames?.secondaryHeader)}>
                        <div className="flex items-center gap-1">
                          {isPrimaryHidden && onShowPrimary && (
                            <Tooltip content="Hiển thị thông tin" className="capitalize bg-slate-100" radius="none" placement="bottom">
                              <Button
                                isIconOnly
                                variant="flat"
                                radius="full"
                                size="sm"
                                className="bg-blue-100 text-blue-600 hover:bg-blue-200"
                                onPress={onShowPrimary}
                              >
                                <Info size={18} />
                              </Button>
                            </Tooltip>
                          )}
                          <h2 className="text-sm font-semibold text-foreground">
                            {secondaryTitle || 'Details'}
                          </h2>
                        </div>
                        <div className="flex items-center gap-1">
                          {secondaryHeaderActions}
                          <Button isIconOnly size="sm" variant="light" onPress={onSecondaryClose}>
                            <X size={18} />
                          </Button>
                        </div>
                      </div>
                      <div className={cn("flex-1 overflow-y-auto p-4", extraClassNames?.secondaryBody)}>
                        <Suspense fallback={<SecondaryFallback />}>{secondaryContent}</Suspense>
                      </div>
                      {secondaryFooter && (
                        <div className="border-t border-divider p-3 shrink-0">
                          {secondaryFooter}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── Tablet: partial overlay with resizable left edge ── */}
                {isOverlayMode && isSecondaryOpen && secondaryContent && (
                  <div
                    className="absolute top-0 bottom-0 right-0 z-10 flex flex-row animate-secondarySlideIn"
                    style={{ width: `${secWidth}px` }}
                  >
                    {/* Overlay resize handle */}
                    <div
                      className="w-1.5 shrink-0 cursor-col-resize group hover:bg-success/40 active:bg-success/60 transition-colors duration-150 relative bg-divider"
                      role="separator"
                      tabIndex={0}
                      onMouseDown={handleInnerMouseDown}
                    >
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-5 h-10 flex items-center justify-center">
                        <GripVertical
                          className="text-default-400 group-hover:text-default-600 transition-colors"
                          size={14}
                        />
                      </div>
                    </div>

                    {/* Secondary content */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background border-l border-divider shadow-lg">
                      <div className={cn("flex items-center gap-2 h-[72px] px-4 md:px-6 border-b border-divider shrink-0", extraClassNames?.secondaryHeader)}>
                        <Button isIconOnly size="sm" variant="light" onPress={onSecondaryClose}>
                          <ArrowLeft size={18} />
                        </Button>
                        <h2 className="text-sm font-semibold text-foreground flex-1 uppercase">
                          {secondaryTitle || 'Details'}
                        </h2>
                        <div className="flex items-center gap-1">
                          {secondaryHeaderActions}
                          <Button isIconOnly size="sm" variant="light" onPress={onSecondaryClose}>
                            <X size={18} />
                          </Button>
                        </div>
                      </div>
                      <div className={cn("flex-1 overflow-y-auto p-4", extraClassNames?.secondaryBody)}>
                        <Suspense fallback={<SecondaryFallback />}>{secondaryContent}</Suspense>
                      </div>
                      {secondaryFooter && (
                        <div className="border-t border-divider p-3 shrink-0">
                          {secondaryFooter}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Mobile: secondary fully overlays primary ── */}
                {isMobile && isSecondaryOpen && secondaryContent && (
                  <div className="absolute inset-0 z-10 flex flex-col bg-background animate-secondarySlideIn">
                    <div className={cn("flex items-center gap-2 h-[72px] px-4 md:px-6 border-b border-divider shrink-0", extraClassNames?.secondaryHeader)}>
                      <Button isIconOnly size="sm" variant="light" onPress={onSecondaryClose}>
                        <ArrowLeft size={18} />
                      </Button>
                      <h2 className="text-sm font-semibold text-foreground flex-1 uppercase">
                        {secondaryTitle || 'Details'}
                      </h2>
                      <div className="flex items-center gap-1">
                        {secondaryHeaderActions}
                        <Button isIconOnly size="sm" variant="light" onPress={onSecondaryClose}>
                          <X size={18} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <Suspense fallback={<SecondaryFallback />}>{secondaryContent}</Suspense>
                    </div>
                    {secondaryFooter && (
                      <div className="border-t border-divider p-3 shrink-0">
                        {secondaryFooter}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

/* ──────────── Sub-components (thin wrappers) ──────────── */

interface HrDrawerHeaderProps {
  children?: ReactNode
  className?: string
  style?: React.CSSProperties
}
export function HrDrawerHeader({ children, className, style }: HrDrawerHeaderProps) {
  return (
    <DrawerHeader
      className={cn(
        'flex items-center justify-between px-4 md:px-6 h-[72px] border-b border-divider shrink-0 overflow-hidden min-w-0',
        className
      )}
      style={style}
    >
      {children}
    </DrawerHeader>
  )
}

interface HrDrawerBodyProps {
  children?: ReactNode
  className?: string
  style?: React.CSSProperties
}
export function HrDrawerBody({ children, className, style }: HrDrawerBodyProps) {
  return (
    <DrawerBody className={cn('flex-1 overflow-y-auto px-0 md:px-4 py-2 md:py-3', className)} style={style}>
      {children}
    </DrawerBody>
  )
}

interface HrDrawerFooterProps {
  children?: ReactNode
  className?: string
  style?: React.CSSProperties
}
export function HrDrawerFooter({ children, className, style }: HrDrawerFooterProps) {
  return (
    <DrawerFooter
      className={cn(
        'p-3 flex items-center justify-end gap-2 border-t border-divider shrink-0',
        className
      )}
      style={style}
    >
      {children}
    </DrawerFooter>
  )
}
