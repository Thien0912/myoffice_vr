import React from 'react'
import { Skeleton } from '@heroui/react'

// ─────────────────────────────────────────────────────────────
// DataGrid — Lightweight, flexible CSS-Grid table component
// ─────────────────────────────────────────────────────────────
// Use this for basic table layouts that need flexible column
// widths without the overhead of a full-featured data table.
//
// Example:
//   <DataGrid
//     columns={[
//       { key: 'name', header: 'Tên', flex: 3 },
//       { key: 'date', header: 'Ngày', width: 100 },
//       { key: 'actions', header: 'Thao tác', width: 80, align: 'right' },
//     ]}
//     data={items}
//     rowKey="id"
//     renderCell={(item, col) => { ... }}
//   />
// ─────────────────────────────────────────────────────────────

export interface DataGridColumn {
  /** Unique key for the column */
  key: string
  /** Header text */
  header: string
  /** Flexible proportion (e.g. 3 → 3fr). Defaults to 1 if no `width` set */
  flex?: number
  /** Fixed width in px. Takes priority over `flex` */
  width?: number
  /** Text alignment: 'left' | 'center' | 'right' */
  align?: 'left' | 'center' | 'right'
  /** Extra className applied to both header and cell */
  className?: string
  /** Hide this column entirely (useful for responsive toggle) */
  hidden?: boolean
}

export interface DataGridProps<T = any> {
  /** Column definitions */
  columns: DataGridColumn[]
  /** Row data array */
  data: T[]
  /** Unique key field on each row object, or a function returning key */
  rowKey: keyof T | ((item: T, index: number) => string | number)
  /** Render a cell. Return ReactNode */
  renderCell: (item: T, column: DataGridColumn, rowIndex: number) => React.ReactNode
  /** Optional: render a leading element per row (e.g. icon) */
  rowIcon?: (item: T, rowIndex: number) => React.ReactNode
  /** Extra className for each row (e.g. conditional highlight) */
  rowClassName?: string | ((item: T, rowIndex: number) => string)
  /** Content shown when data is empty */
  emptyText?: string
  /** Gap between grid columns in px. Default: 8 */
  gap?: number
  /** Show column headers. Default: true */
  showHeader?: boolean
  /** Container className */
  className?: string
  /** Header row className */
  headerClassName?: string
  /** Content area className */
  bodyClassName?: string
  /** Row onClick handler */
  onRowClick?: (item: T, rowIndex: number) => void
  /** Show loading state */
  isLoading?: boolean
}

/** Resolve the unique key for a row */
function resolveKey<T>(item: T, rowKey: DataGridProps<T>['rowKey'], index: number): string | number {
  if (typeof rowKey === 'function') return rowKey(item, index)
  return String(item[rowKey as keyof T] ?? index)
}

/** Build the CSS grid-template-columns string from column definitions */
function buildGridTemplate(columns: DataGridColumn[]): string {
  return columns
    .filter((c) => !c.hidden)
    .map((col) => {
      if (col.width) return `${col.width}px`
      return `${col.flex ?? 1}fr`
    })
    .join(' ')
}

/** Resolve alignment to Tailwind text-align class */
function alignClass(align?: string): string {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

function DataGridInner<T>(
  {
    columns,
    data,
    rowKey,
    renderCell,
    rowIcon,
    rowClassName,
    emptyText = 'Không có dữ liệu',
    gap = 8,
    showHeader = true,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    onRowClick,
    isLoading,
  }: DataGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const visibleCols = columns.filter((c) => !c.hidden)
  const template = buildGridTemplate(columns)

  // If rowIcon is provided, prepend a fixed-width icon column
  const hasIcon = !!rowIcon
  const fullTemplate = hasIcon ? `auto ${template}` : template

  return (
    <div ref={ref} className={`flex flex-col ${className}`} role="table">
      {/* ── Header ── */}
      {showHeader && (
        <div
          className={`grid items-center px-4 py-2.5 border-b border-gray-100 ${headerClassName}`}
          style={{ gridTemplateColumns: fullTemplate, gap }}
          role="row"
        >
          {/* Icon spacer */}
          {hasIcon && <span aria-hidden />}

          {visibleCols.map((col) => (
            <span
              key={col.key}
              className={`
                text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none
                ${alignClass(col.align)} ${col.className ?? ''}
              `}
              role="columnheader"
            >
              {col.header}
            </span>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <div className={`flex flex-col relative min-h-[100px] ${bodyClassName}`} role="rowgroup">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="grid items-center px-4 py-3 border-b border-gray-50"
              style={{ gridTemplateColumns: fullTemplate, gap }}
              role="row"
            >
              {hasIcon && (
                <div className="flex items-center justify-center shrink-0">
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              )}
              {visibleCols.map((col) => (
                <div
                  key={col.key}
                  className={`min-w-0 ${alignClass(col.align)} ${col.className ?? ''}`}
                  role="cell"
                >
                  <Skeleton
                    className={`h-4 rounded-md ${
                      col.align === 'center' ? 'mx-auto' : col.align === 'right' ? 'ml-auto' : ''
                    } ${idx % 2 === 0 ? 'w-4/5' : 'w-3/4'}`}
                  />
                </div>
              ))}
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((item, idx) => {
            const key = resolveKey(item, rowKey, idx)
            const extraClass = typeof rowClassName === 'function' ? rowClassName(item, idx) : (rowClassName ?? '')

            return (
              <div
                key={key}
                className={`
                  grid items-center px-4 py-3 border-b border-gray-50
                  hover:bg-gray-50/60 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${extraClass}
                `}
                style={{ gridTemplateColumns: fullTemplate, gap }}
                role="row"
                onClick={onRowClick ? () => onRowClick(item, idx) : undefined}
              >
                {/* Row icon */}
                {hasIcon && (
                  <div className="flex items-center justify-center shrink-0">
                    {rowIcon!(item, idx)}
                  </div>
                )}

                {/* Cells */}
                {visibleCols.map((col) => (
                  <div
                    key={col.key}
                    className={`min-w-0 ${alignClass(col.align)} ${col.className ?? ''}`}
                    role="cell"
                  >
                    {renderCell(item, col, idx)}
                  </div>
                ))}
              </div>
            )
          })
        ) : (
          !isLoading && (
            <div className="flex items-center justify-center py-6 text-gray-400 text-sm" role="row">
              {emptyText}
            </div>
          )
        )}
      </div>
    </div>
  )
}

/**
 * Lightweight CSS-Grid based data display component.
 *
 * Supports flexible (`fr`) and fixed (`px`) column widths,
 * optional row icons, conditional row classes, and empty states.
 *
 * Use instead of full-featured `TableHr` when you only need
 * a simple, responsive data list without sorting/pagination/selection.
 */
export const DataGrid = React.forwardRef(DataGridInner) as <T>(
  props: DataGridProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement

export default DataGrid
