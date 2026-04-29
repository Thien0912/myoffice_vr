import { ArrowDownWideNarrow, ArrowLeftToLine, ArrowRightToLine, ArrowUpWideNarrow, X, XCircle } from 'lucide-react'
import React, { useState } from 'react'
import ContextMenu from '../ContextMenu'

export const useTablePinning = () => {
  const [menuState, setMenuState] = useState<{
    x: number
    y: number
    isOpen: boolean
    columnUid: string | null
    columnPinState?: 'left' | 'right' | undefined
    columnSortable?: boolean
    columnSortDirection?: 'ascending' | 'descending' | undefined
  }>({
    x: 0,
    y: 0,
    isOpen: false,
    columnUid: null,
    columnPinState: undefined,
    columnSortable: false,
    columnSortDirection: undefined
  })

  const openMenu = (
    e: React.MouseEvent,
    columnUid: string,
    columnPinState?: 'left' | 'right' | undefined,
    columnSortable?: boolean,
    columnSortDirection?: 'ascending' | 'descending' | undefined
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuState({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      columnUid,
      columnPinState,
      columnSortable,
      columnSortDirection
    })
  }

  const closeMenu = () => {
    setMenuState({
      x: 0,
      y: 0,
      isOpen: false,
      columnUid: null,
      columnPinState: undefined,
      columnSortable: false,
      columnSortDirection: undefined
    })
  }

  return { menuState, openMenu, closeMenu }
}

export interface TablePinningMenuItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

interface TablePinningMenuProps {
  menuState: {
    x: number
    y: number
    isOpen: boolean
    columnUid: string | null
    columnPinState?: 'left' | 'right' | undefined
    columnSortable?: boolean
    columnSortDirection?: 'ascending' | 'descending' | undefined
  }
  onClose: () => void
  onPinColumn?: (uid: string, pin: 'left' | 'right' | undefined) => void
  onSort?: (uid: string, direction: 'ascending' | 'descending' | undefined) => void
  extraItems?: TablePinningMenuItem[] | ((uid: string) => TablePinningMenuItem[])
}

export const TablePinningMenu = ({
  menuState,
  onClose,
  onPinColumn,
  onSort,
  extraItems
}: TablePinningMenuProps) => {
  if (!menuState.isOpen || !menuState.columnUid) return null

  const isPinned = !!menuState.columnPinState
  const isSortedAsc = menuState.columnSortDirection === 'ascending'
  const isSortedDesc = menuState.columnSortDirection === 'descending'
  const isSorted = isSortedAsc || isSortedDesc

  // ── Sort items (MUI-style: sort options first) ──
  const sortItems: TablePinningMenuItem[] = menuState.columnSortable && onSort
    ? [
        ...(!isSortedAsc
          ? [{
              label: 'Sắp xếp tăng dần',
              icon: <ArrowUpWideNarrow size={16} />,
              onClick: () => {
                onSort(menuState.columnUid!, 'ascending')
                onClose()
              }
            }]
          : []),
        ...(!isSortedDesc
          ? [{
              label: 'Sắp xếp giảm dần',
              icon: <ArrowDownWideNarrow size={16} />,
              onClick: () => {
                onSort(menuState.columnUid!, 'descending')
                onClose()
              }
            }]
          : []),
        ...(isSorted
          ? [{
              label: 'Bỏ sắp xếp',
              icon: <X size={16} />,
              onClick: () => {
                onSort(menuState.columnUid!, undefined)
                onClose()
              }
            }]
          : [])
      ]
    : []

  // ── Pin items ──
  const pinItems: TablePinningMenuItem[] = []
  if (onPinColumn) {
    if (!isPinned) {
      pinItems.push(
        {
          label: 'Ghim sang trái',
          icon: <ArrowLeftToLine size={16} />,
          onClick: () => {
            onPinColumn(menuState.columnUid!, 'left')
            onClose()
          }
        },
        {
          label: 'Ghim sang phải',
          icon: <ArrowRightToLine size={16} />,
          onClick: () => {
            onPinColumn(menuState.columnUid!, 'right')
            onClose()
          }
        }
      )
    } else {
      if (menuState.columnPinState === 'left') {
        pinItems.push({
          label: 'Ghim sang phải',
          icon: <ArrowRightToLine size={16} />,
          onClick: () => {
            onPinColumn(menuState.columnUid!, 'right')
            onClose()
          }
        })
      } else if (menuState.columnPinState === 'right') {
        pinItems.push({
          label: 'Ghim sang trái',
          icon: <ArrowLeftToLine size={16} />,
          onClick: () => {
            onPinColumn(menuState.columnUid!, 'left')
            onClose()
          }
        })
      }
      
      pinItems.push({
        label: 'Bỏ ghim',
        icon: <XCircle size={16} />,
        onClick: () => {
          onPinColumn(menuState.columnUid!, 'none' as any)
          onClose()
        }
      })
    }
  }

  // Custom items
  const customItems =
    typeof extraItems === 'function' ? extraItems(menuState.columnUid) : extraItems || []

  // Combine with separators
  const allItems = [
    ...sortItems,
    ...(sortItems.length > 0 && pinItems.length > 0 ? [{ label: 'separator' }] : []),
    ...pinItems,
    ...(pinItems.length > 0 && customItems.length > 0 ? [{ label: 'separator' }] : []),
    ...customItems
  ]

  if (allItems.length === 0) return null

  return (
    <ContextMenu
      x={menuState.x}
      y={menuState.y}
      isOpen={menuState.isOpen}
      items={allItems}
      onClose={onClose}
    />
  )
}
