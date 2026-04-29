import { EmployeeGridData, GridDateItem } from '../../hooks/useAdminGridData'
import { OvertimeRequest } from '../../types'

export interface EmployeeRowProps {
  emp: EmployeeGridData
  dates: GridDateItem[]
  showTotalHoursColumn: boolean
  totalHoursViewMode: 'hours' | 'days'
  isPinned: boolean
  isScrolledX: boolean
  selectedRequests: Set<number>
  onRowClick?: (req: OvertimeRequest) => void
  onSelectRequest?: (reqId: number, selected: boolean) => void
  onSelectAll?: (ids: number[], selected: boolean) => void
  onTogglePin: (empId: number) => void
  hiddenStatuses: Set<string>
  transitionClass: string
}

export interface GridHeaderProps {
  dates: GridDateItem[]
  showTotalHoursColumn: boolean
  totalHoursViewMode: 'hours' | 'days'
  setTotalHoursViewMode: (mode: 'hours' | 'days') => void
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  inputValue: string
  setInputValue: (value: string) => void
  allPendingIds: number[]
  selectedRequests: Set<number>
  onSelectAll?: (ids: number[], selected: boolean) => void
  transitionClass: string
  todayStr: string
  theadRef: React.RefObject<HTMLTableSectionElement | null>
  showHeaderShadow: boolean
}

export interface GroupHeaderRowProps {
  groupName: string
  isExpanded: boolean
  employeeCount: number
  stats: {
    approvedRequests: number
    pendingRequests: number
    rejectedRequests: number
    canceledRequests: number
  }
  hiddenStatuses: Set<string>
  totalHours: number
  theadHeight: number
  showLeftShadow: boolean
  showHeaderShadow: boolean
  onToggleDept: (deptName: string) => void
  onToggleGroupStatus: (groupName: string, status: string) => void
  datesLength: number
}
