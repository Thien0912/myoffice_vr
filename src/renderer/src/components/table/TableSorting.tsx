import { SortDescriptor } from '@heroui/react'
import { useMemo, useState, useEffect, useRef } from 'react'

export interface SortableColumn {
  uid: string
  sortable?: boolean
  sortKey?: string
  [key: string]: any
}

export const useTableSorting = <T extends Record<string, any>>(
  data: T[],
  columns: SortableColumn[],
  initialSortDescriptor: SortDescriptor = { column: '', direction: 'ascending' }
) => {
  const [sortDescriptors, setSortDescriptors] = useState<SortDescriptor[]>(
    initialSortDescriptor.column ? [initialSortDescriptor] : []
  )

  const isShiftPressed = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressed.current = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressed.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const sortedData = useMemo(() => {
    if (sortDescriptors.length === 0) {
      return data
    }

    return [...data].sort((a, b) => {
      for (const descriptor of sortDescriptors) {
        const { column: columnUid, direction } = descriptor
        const column = columns.find((c) => c.uid === columnUid)

        if (column?.sortable === false) continue

        const dataKey = (column?.sortKey || columnUid) as keyof T
        const first = a[dataKey]
        const second = b[dataKey]

        if (first === second) continue

        // Handle null/undefined values
        if (first === null || first === undefined) return 1
        if (second === null || second === undefined) return -1

        const cmp = first < second ? -1 : first > second ? 1 : 0

        return direction === 'descending' ? -cmp : cmp
      }
      return 0
    })
  }, [sortDescriptors, data, columns])

  const onSortChange = (descriptor: SortDescriptor | SortDescriptor[]) => {
    if (Array.isArray(descriptor)) {
      setSortDescriptors(descriptor)
      return
    }

    setSortDescriptors((prev) => {
      const { column } = descriptor
      const existingIndex = prev.findIndex((d) => d.column === column)
      const existingDescriptor = prev[existingIndex]

      if (isShiftPressed.current) {
        if (existingIndex !== -1) {
          // Cycle: Asc -> Desc -> Remove
          if (existingDescriptor.direction === 'ascending') {
            const newDescriptors = [...prev]
            newDescriptors[existingIndex] = { column, direction: 'descending' }
            return newDescriptors
          } else {
            // Remove
            return prev.filter((d) => d.column !== column)
          }
        } else {
          // Add new Asc
          return [...prev, { column, direction: 'ascending' }]
        }
      } else {
        // Single sort
        if (existingIndex !== -1 && prev.length === 1) {
          // Cycle: Asc -> Desc -> Remove
          if (existingDescriptor.direction === 'ascending') {
            return [{ column, direction: 'descending' }]
          } else {
            return [] // Remove
          }
        } else {
          // New column or switching from multi-sort -> Start fresh Asc
          return [{ column, direction: 'ascending' }]
        }
      }
    })
  }

  return {
    sortDescriptors,
    onSortChange,
    sortedData
  }
}
