import { useState, useCallback } from 'react'

export interface ContextMenuState<T = any> {
  x: number
  y: number
  isOpen: boolean
  data: T | null
}

export const useContextMenu = <T = any>(onCloseCallback?: () => void) => {
  const [state, setState] = useState<ContextMenuState<T>>({
    x: 0,
    y: 0,
    isOpen: false,
    data: null
  })

  const openMenu = useCallback((e: React.MouseEvent | MouseEvent, data: T) => {
    e.preventDefault()
    e.stopPropagation()

    let clientX = 0
    let clientY = 0

    if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Basic viewport bounds check
    const menuWidth = 200 // estimated min-width
    const menuHeight = 300 // estimated max-height
    
    let x = clientX
    let y = clientY

    if (x + menuWidth > window.innerWidth) {
      x = x - menuWidth
    }
    if (y + menuHeight > window.innerHeight) {
      y = y - menuHeight
    }

    setState({
      x,
      y,
      isOpen: true,
      data
    })
  }, [])

  const closeMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, data: null }))
    onCloseCallback?.()
  }, [onCloseCallback])

  return {
    ...state,
    openMenu,
    closeMenu,
    setState,
    // Backward compatibility for existing pages (VanbandenPage, VanbandendonviPage)
    menu: {
      x: state.x,
      y: state.y,
      isOpen: state.isOpen,
      row: state.data
    },
    handleContextMenu: openMenu,
    handleCloseMenu: closeMenu
  }
}

