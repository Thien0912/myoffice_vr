import { useCallback, useMemo } from 'react'

export type TableSortDirection = 'ascending' | 'descending'
export type TableSortDescriptor = {
  column: string
  direction: TableSortDirection
}
export type TableSortValue = [] | TableSortDescriptor[]

type UseTableSortOptions = {
  orders?: Array<any>
  setFilters: (data: Record<string, unknown>) => void
}

const normalizeSortDescriptors = (orders?: Array<any>): TableSortDescriptor[] => {
  if (!orders || orders.length === 0) return []
  return orders
    .map((item) => {
      const column = item?.column ? String(item.column) : ''
      const direction =
        item?.direction === 'descending'
          ? 'descending'
          : item?.direction === 'ascending'
            ? 'ascending'
            : undefined

      if (!column || !direction) return null
      return { column, direction }
    })
    .filter((item): item is TableSortDescriptor => Boolean(item))
}

export const useTableSort = ({ orders, setFilters }: UseTableSortOptions) => {
  const initialSortDescriptors = useMemo(() => normalizeSortDescriptors(orders), [orders])

  const handleSortChange = useCallback(
    (sort: TableSortValue) => {
      setFilters({ orders: sort })
    },
    [setFilters]
  )

  return {
    initialSortDescriptors,
    handleSortChange
  }
}
