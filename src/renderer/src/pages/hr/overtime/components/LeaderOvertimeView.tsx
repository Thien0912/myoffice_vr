
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { getOvertimeColumns } from '../columns'
import { useNgoaiGioPermissions } from '../hooks/useNgoaiGioPermissions'
import { OvertimeRequest } from '../types'
import OvertimeTable from './OvertimeTable'
import { EmployeeDetailDrawer } from './EmployeeDetailDrawer'

// Hoisted no-op constant (Rule 5.4)
const NOOP = () => { }

interface SortDescriptor {
  column: string
  direction: 'ascending' | 'descending'
}

interface LeaderOvertimeViewProps {
  data: OvertimeRequest[]
  total: number
  filtered: number
  page: number
  limit: number
  sortDescriptors: SortDescriptor[]
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
  onSortChange: (descriptors: SortDescriptor[]) => void
  isLoading?: boolean
  onRowClick?: (req: OvertimeRequest) => void
  selectedRequests?: Set<number>
  onSelectRequest?: (reqId: number, selected: boolean) => void
  onSelectAll?: (ids: number[], selected: boolean) => void
  onApprove?: (reqId: number) => void
  onReject?: (reqId: number) => void
  onUpdateShift?: (row: OvertimeRequest, start: string, end: string) => Promise<boolean>
  onDelete?: (row: OvertimeRequest) => void
  onEdit?: (row: OvertimeRequest) => void
  visibleColumns?: Set<string>
  columnOrder?: string[]
  onColumnOrderChange?: (columnOrder: string[]) => void
}

function LeaderOvertimeView({
  data,
  total,
  filtered,
  page,
  limit,
  sortDescriptors,
  onChangePage,
  onChangeLimit,
  onSortChange,
  isLoading = false,
  onRowClick,
  selectedRequests = new Set(),
  onSelectRequest,
  onSelectAll,
  onApprove,
  onReject,
  onUpdateShift,
  onDelete,
  onEdit,
  visibleColumns,
  columnOrder,
  onColumnOrderChange
}: LeaderOvertimeViewProps) {
  const user = useAuthStore((s) => s.user)
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({})
  const [employeeDrawer, setEmployeeDrawer] = useState<{ isOpen: boolean; employeeId: number | string | null }>({
    isOpen: false,
    employeeId: null,
  })

  const dataRef = useRef(data)
  dataRef.current = data
  const selectedRequestsRef = useRef(selectedRequests)
  selectedRequestsRef.current = selectedRequests
  const onRowClickRef = useRef(onRowClick)
  onRowClickRef.current = onRowClick
  const onApproveRef = useRef(onApprove)
  onApproveRef.current = onApprove
  const onRejectRef = useRef(onReject)
  onRejectRef.current = onReject
  const onUpdateShiftRef = useRef(onUpdateShift)
  onUpdateShiftRef.current = onUpdateShift
  const onDeleteRef = useRef(onDelete)
  onDeleteRef.current = onDelete
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit

  const permissions = useNgoaiGioPermissions()

  console.log(`user:::`, user)

  // Columns without actions (leader uses bulk toolbar)
  const columns = useMemo(() => {
    let cols = getOvertimeColumns(
      (row) => onApproveRef.current?.(row.id_ngoai_gio),
      (row) => onRejectRef.current?.(row.id_ngoai_gio),
      (row) => onDeleteRef.current?.(row),
      (row) => {
        onRowClickRef.current?.(row);
      },
      (row, start, end) => onUpdateShiftRef.current?.(row, start, end) ?? Promise.resolve(false),
      permissions,
      (employeeId) => setEmployeeDrawer({ isOpen: true, employeeId }),
      (row) => onEditRef.current?.(row)
    ).filter(col => {
      if (visibleColumns && !visibleColumns.has(col.uid) && col.uid !== 'stt') return false;
      return true;
    });

    if (columnOrder) {
      cols.sort((a, b) => {
        const indexA = columnOrder.indexOf(a.uid);
        const indexB = columnOrder.indexOf(b.uid);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }

    return cols;
  }, [permissions, visibleColumns, columnOrder])


  // Convert Set<number> → Set<string> for TableHr compatibility
  const selectedKeys = useMemo(() => {
    if (selectedRequests.size === 0) return new Set<string | number>()
    return new Set(Array.from(selectedRequests).map(id => String(id)))
  }, [selectedRequests])

  const disabledKeys = useMemo(() => {
    return new Set(
      data
        .filter(r => r.trang_thai_tong !== 'Cho_duyet')
        .map(r => String(r.id_ngoai_gio))
    )
  }, [data])

  // Use functional setState to stabilize callbacks (Rule 5.9)
  const handleSelectionChange = useCallback((keys: any) => {
    if (!onSelectRequest || !onSelectAll) return
    const currentData = dataRef.current
    const currentSelected = selectedRequestsRef.current

    if (keys === 'all') {
      const pendingIds = currentData
        .filter(r => r.trang_thai_tong === 'Cho_duyet')
        .map(r => r.id_ngoai_gio)
      onSelectAll(pendingIds, true)
    } else if (keys instanceof Set) {
      const newIds = new Set(Array.from(keys).map(k => Number(k)))
      const added = [...newIds].filter(id => !currentSelected.has(id))
      const removed = [...currentSelected].filter(id => !newIds.has(id))
      added.forEach(id => onSelectRequest(id, true))
      removed.forEach(id => onSelectRequest(id, false))
    }
  }, [onSelectRequest, onSelectAll])

  const handleColumnResize = useCallback((uid: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [uid]: width }))
  }, [])

  // Data is already sorted + paginated by server
  // No client-side sort/pagination needed

  return (
    <div className="flex flex-row relative  flex-1 min-h-0">
      <div className="flex-1 min-w-0 h-full overflow-hidden relative flex flex-col">
        <div className="h-full w-full flex flex-col min-h-0">
          <OvertimeTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            page={page}
            total={total}
            filtered={filtered}
            limit={limit}
            sortDescriptors={sortDescriptors}
            columnWidths={columnWidths}
            selectedKeys={selectedKeys}
            disabledKeys={disabledKeys}
            onSelectionChange={handleSelectionChange}
            onColumnResize={handleColumnResize}
            onSortChange={onSortChange}
            onChangePage={onChangePage}
            onChangeLimit={onChangeLimit}
            onRowClick={onRowClick}
            isManager={permissions.canViewManagement}
            permissions={permissions}
            onApprove={(id) => onApproveRef.current?.(id)}
            onReject={(id) => onRejectRef.current?.(id)}
            onDelete={(row) => onDeleteRef.current?.(row)}
            onEdit={(row) => onEditRef.current?.(row)}
            currentUserId={user?.id_nhan_vien}
            columnOrder={columnOrder}
            onColumnOrderChange={onColumnOrderChange}
          />
        </div>
      </div>

      {/* Employee Detail Drawer */}
      <EmployeeDetailDrawer
        isOpen={employeeDrawer.isOpen}
        onClose={() => setEmployeeDrawer({ isOpen: false, employeeId: null })}
        employeeId={employeeDrawer.employeeId}
      />
    </div>
  )
}

export default React.memo(LeaderOvertimeView)
