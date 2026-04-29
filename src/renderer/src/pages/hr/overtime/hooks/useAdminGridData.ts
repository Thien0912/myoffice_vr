import { useMemo } from 'react'
import { OvertimeRequest } from '../types'

// Cached collator for Vietnamese locale sorting (10x faster than repeated .localeCompare())
const viCollator = new Intl.Collator('vi', { sensitivity: 'base' })

export interface GridDateItem {
  dateStr: string // "YYYY-MM-DD"
  day: number // 1-31
  month: number // 1-12
  year: number
  dayOfWeek: number // 0-6 (0 = Sunday)
}

export interface EmployeeGridData {
  id_nhan_vien: number
  ma_nhan_vien: string
  ho_va_ten: string
  ten_don_vi: string
  requests: Record<string, OvertimeRequest[]> // key: dateStr "YYYY-MM-DD"
  totalHours: number // For the currently viewed period
  totalApproved: number
  totalPending: number
  totalRejected: number
  totalCanceled: number
  // Tổng giờ theo loại ngày
  totalHoursNT: number // Ngày thường
  totalHoursCN: number // Chủ nhật
  totalHoursLE: number // Ngày lễ
  // Tổng ngày theo loại ngày (tính từ giờ/8)
  totalDaysNT: number // Ngày thường (theo ngày)
  totalDaysCN: number // Chủ nhật (theo ngày)
  totalDaysLE: number // Ngày lễ (theo ngày)
  // Tổng cộng
  totalHoursSum?: number // NT + CN + LE (giờ)
  totalDaysSum?: number // NT + CN + LE (ngày)
}

export interface DepartmentGridGroup {
  ten_don_vi: string
  employees: EmployeeGridData[]
  stats: {
    totalEmployees: number
    approvedRequests: number
    pendingRequests: number
    rejectedRequests: number
    canceledRequests: number
    totalHours: number
  }
}

// Convert data list into grouped matrix data
export function useAdminGridData(
  data: OvertimeRequest[],
  startDate: Date,
  endDate: Date
) {
  // Generate dates array for columns
  const dates = useMemo(() => {
    const list: GridDateItem[] = []
    const current = new Date(startDate)
    // Set to start of day to avoid timezone shifts
    current.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)

    while (current <= end) {
      const dateStr = [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, '0'),
        String(current.getDate()).padStart(2, '0')
      ].join('-')

      list.push({
        dateStr,
        day: current.getDate(),
        month: current.getMonth() + 1,
        year: current.getFullYear(),
        dayOfWeek: current.getDay()
      })
      current.setDate(current.getDate() + 1)
    }
    return list
  }, [startDate, endDate])

  // Group data
  const groupedData = useMemo(() => {
    const validDates = new Set(dates.map(d => d.dateStr))
    const empMap = new Map<number, EmployeeGridData>()

    // Initialize map with all employees found in data
    data.forEach((req) => {
      if (!empMap.has(req.id_nhan_vien)) {
        empMap.set(req.id_nhan_vien, {
          id_nhan_vien: req.id_nhan_vien,
          ma_nhan_vien: req.ma_nhan_vien || '',
          ho_va_ten: req.ho_va_ten || 'Không rõ',
          ten_don_vi: req.ten_don_vi || 'Khác',
          requests: {},
          totalHours: 0,
          totalApproved: 0,
          totalPending: 0,
          totalRejected: 0,
          totalCanceled: 0,
          totalHoursNT: 0,
          totalHoursCN: 0,
          totalHoursLE: 0,
          totalDaysNT: 0,
          totalDaysCN: 0,
          totalDaysLE: 0
        })
      }

      const emp = empMap.get(req.id_nhan_vien)!
      const reqDateStr = req.ngay_dang_ky?.substring(0, 10)
      if (reqDateStr) {
        if (!emp.requests[reqDateStr]) {
          emp.requests[reqDateStr] = []
        }
        emp.requests[reqDateStr].push(req)

        // Only count stats if this request is within the currently viewed dates
        if (validDates.has(reqDateStr)) {
          const hours = Number(req.so_gio) || 0
          emp.totalHours += hours

          if (req.trang_thai_tong === 'Da_duyet') emp.totalApproved++
          else if (req.trang_thai_tong === 'Cho_duyet') emp.totalPending++
          else if (req.trang_thai_tong === 'Tu_choi') emp.totalRejected++
          else if (req.trang_thai_tong === 'Huy') emp.totalCanceled++
        }
      }
    })

    // Group by department
    const deptMap = new Map<string, DepartmentGridGroup>()
    Array.from(empMap.values()).forEach((emp) => {
      const deptName = emp.ten_don_vi
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          ten_don_vi: deptName,
          employees: [],
          stats: {
            totalEmployees: 0,
            approvedRequests: 0,
            pendingRequests: 0,
            rejectedRequests: 0,
            canceledRequests: 0,
            totalHours: 0
          }
        })
      }
      const dept = deptMap.get(deptName)!
      dept.employees.push(emp)
      dept.stats.totalEmployees++
      dept.stats.approvedRequests += emp.totalApproved
      dept.stats.pendingRequests += emp.totalPending
      dept.stats.rejectedRequests += emp.totalRejected
      dept.stats.canceledRequests += emp.totalCanceled
      dept.stats.totalHours += emp.totalHours
    })

    // Sort departments alphabetically, maybe 'Khác' at the end
    const sortedDepts = Array.from(deptMap.values()).sort((a, b) => {
      if (a.ten_don_vi === 'Khác') return 1
      if (b.ten_don_vi === 'Khác') return -1
      return viCollator.compare(a.ten_don_vi, b.ten_don_vi)
    })

    // Sort employees alphabetically by name within each department
    sortedDepts.forEach((dept) => {
      dept.employees.sort((a, b) => viCollator.compare(a.ho_va_ten, b.ho_va_ten))
    })

    return sortedDepts
  }, [data, dates])

  return { dates, groupedData }
}
