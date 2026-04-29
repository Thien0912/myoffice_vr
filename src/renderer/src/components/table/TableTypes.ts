import React from 'react'

export interface TableColumnType<T = unknown> {
  uid: string
  name: string
  className?: string
  render?: (value: unknown, row?: T, index?: number, onRowFocus?: () => void) => React.ReactNode
  sort?: boolean
  sortable?: boolean
  sortKey?: string
  type?: 'text' | 'select' | 'date'
  options?: { label: string; value: string | number }[]
  editable?: boolean
  width?: number | string
  minWidth?: number
  pinned?: 'left' | 'right'
  disablePinning?: boolean
  renderDisplay?: (value: unknown, row?: T, index?: number, onRowFocus?: () => void) => React.ReactNode
  multiple?: boolean
}
