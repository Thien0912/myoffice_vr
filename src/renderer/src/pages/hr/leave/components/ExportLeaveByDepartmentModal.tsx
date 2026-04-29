import { Button, Checkbox, InputGroup, Spinner, ScrollShadow } from '@heroui-v3/react'
import { Search, X, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import DraggableModal from '@renderer/components/DraggableModal'

interface DonVi {
  id_don_vi: string
  ten_don_vi: string
}

interface NhanVien {
  id_nhan_vien: string
  ma_nhan_vien: string
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_email?: string
  ten_cong_viec?: string
  id_don_vi?: string
}

interface ExportLeaveByDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (employeeIds: string[]) => void
  isExporting?: boolean
}

export default function ExportLeaveByDepartmentModal({
  isOpen,
  onClose,
  onExport,
  isExporting = false
}: ExportLeaveByDepartmentModalProps) {
  const [departments, setDepartments] = useState<DonVi[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set())
  const [employeesByDept, setEmployeesByDept] = useState<Record<string, NhanVien[]>>({})
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [searchDepartment, setSearchDepartment] = useState('')
  const [searchEmployee, setSearchEmployee] = useState('')
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(new Set())
  const [employeeLimit, setEmployeeLimit] = useState<Record<string, number>>({})

  // Debounced search values
  const [debouncedSearchDept, setDebouncedSearchDept] = useState('')
  const [debouncedSearchEmp, setDebouncedSearchEmp] = useState('')

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchDept(searchDepartment), 300)
    return () => clearTimeout(timer)
  }, [searchDepartment])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchEmp(searchEmployee), 300)
    return () => clearTimeout(timer)
  }, [searchEmployee])

  // Load danh sách đơn vị khi mở modal
  useEffect(() => {
    if (isOpen) {
      loadDepartments()
    } else {
      // Reset state when modal closes
      setDepartments([])
      setSelectedDepartments(new Set())
      setEmployeesByDept({})
      setSelectedEmployees(new Set())
      setSearchDepartment('')
      setSearchEmployee('')
      setCollapsedDepartments(new Set())
      setEmployeeLimit({})
      setDebouncedSearchDept('')
      setDebouncedSearchEmp('')
    }
  }, [isOpen])

  // Load danh sách nhân viên khi chọn đơn vị
  useEffect(() => {
    if (selectedDepartments.size > 0) {
      loadEmployees()
    } else {
      setEmployeesByDept({})
      setSelectedEmployees(new Set())
    }
  }, [selectedDepartments])

  const loadDepartments = async () => {
    setIsLoadingDepartments(true)
    try {
      const response = await DonviAxios.fetch({ length: 9999 })
      if (response?.success && response?.data) {
        // Đảm bảo data là array
        const deptData = Array.isArray(response.data) ? response.data : []
        setDepartments(deptData)
      } else {
        setDepartments([])
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn vị:', error)
      setDepartments([])
    } finally {
      setIsLoadingDepartments(false)
    }
  }

  const loadEmployees = async () => {
    setIsLoadingEmployees(true)
    try {
      const donViIds = Array.from(selectedDepartments)
      const newEmployeesByDept: Record<string, NhanVien[]> = {}

      // Load nhân viên cho từng đơn vị
      for (const donViId of donViIds) {
        const response = await NhansuAxios.getByUnit(donViId)
        if (response?.success && response?.data) {
          const employeeData = Array.isArray(response.data) ? response.data : []
          newEmployeesByDept[donViId] = employeeData
        } else {
          newEmployeesByDept[donViId] = []
        }
      }

      setEmployeesByDept(newEmployeesByDept)
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhân viên:', error)
      setEmployeesByDept({})
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const handleDepartmentToggle = useCallback(
    (id: string) => {
      const newSelected = new Set(selectedDepartments)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      setSelectedDepartments(newSelected)
      setSelectedEmployees(new Set()) // Reset danh sách nhân viên đã chọn
    },
    [selectedDepartments]
  )

  const handleEmployeeToggle = useCallback(
    (id: string) => {
      const newSelected = new Set(selectedEmployees)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      setSelectedEmployees(newSelected)
    },
    [selectedEmployees]
  )

  const toggleDepartmentCollapse = useCallback(
    (deptId: string) => {
      const newCollapsed = new Set(collapsedDepartments)
      if (newCollapsed.has(deptId)) {
        newCollapsed.delete(deptId)
      } else {
        newCollapsed.add(deptId)
      }
      setCollapsedDepartments(newCollapsed)
    },
    [collapsedDepartments]
  )

  const handleSelectAllDepartments = () => {
    if (selectedDepartments.size === filteredDepartments.length && filteredDepartments.length > 0) {
      setSelectedDepartments(new Set())
    } else {
      setSelectedDepartments(new Set(filteredDepartments.map((d) => d.id_don_vi)))
    }
  }

  const handleSelectAllEmployees = useCallback(() => {
    const allEmps = Object.values(employeesByDept).flat()
    const filteredEmpList = allEmps.filter(
      (emp) =>
        emp.ql_nguoi_dung_ho_ten?.toLowerCase().includes(debouncedSearchEmp.toLowerCase()) ||
        emp.ma_nhan_vien?.toLowerCase().includes(debouncedSearchEmp.toLowerCase()) ||
        emp.ql_nguoi_dung_email?.toLowerCase().includes(debouncedSearchEmp.toLowerCase())
    )

    if (selectedEmployees.size === filteredEmpList.length) {
      setSelectedEmployees(new Set())
    } else {
      setSelectedEmployees(new Set(filteredEmpList.map((e) => e.id_nhan_vien)))
    }
  }, [employeesByDept, debouncedSearchEmp, selectedEmployees])

  const handleLoadMoreEmployees = useCallback((deptId: string) => {
    setEmployeeLimit((prev) => ({
      ...prev,
      [deptId]: (prev[deptId] || 50) + 50
    }))
  }, [])

  const handleClearSelection = () => {
    setSelectedDepartments(new Set())
    setSelectedEmployees(new Set())
  }

  const handleExport = () => {
    const employeeIds = Array.from(selectedEmployees)
    if (employeeIds.length > 0) {
      onExport(employeeIds)
    }
  }

  const handleCloseModal = () => {
    setSelectedDepartments(new Set())
    setSelectedEmployees(new Set())
    setSearchDepartment('')
    setSearchEmployee('')
    setEmployeesByDept({})
    setCollapsedDepartments(new Set())
    setEmployeeLimit({})
    onClose()
  }

  // Memoized filtered departments
  const filteredDepartments = useMemo(
    () =>
      Array.isArray(departments)
        ? departments.filter((dept) =>
            dept.ten_don_vi?.toLowerCase().includes(debouncedSearchDept.toLowerCase())
          )
        : [],
    [departments, debouncedSearchDept]
  )

  // Get all employees và filter with memoization
  const allEmployees = useMemo(() => Object.values(employeesByDept).flat(), [employeesByDept])
  const totalEmployees = allEmployees.length

  // Memoized filtered employees by department
  const getFilteredEmployees = useCallback(
    (empList: NhanVien[]) => {
      return empList.filter(
        (emp) =>
          emp.ql_nguoi_dung_ho_ten?.toLowerCase().includes(debouncedSearchEmp.toLowerCase()) ||
          emp.ma_nhan_vien?.toLowerCase().includes(debouncedSearchEmp.toLowerCase()) ||
          emp.ql_nguoi_dung_email?.toLowerCase().includes(debouncedSearchEmp.toLowerCase())
      )
    },
    [debouncedSearchEmp]
  )

  // Footer content
  const footerContent = useMemo(
    () => (
      <div className="flex items-center justify-between w-full gap-3">
        <Button
          variant="outline"
          onPress={handleClearSelection}
          className="flex items-center gap-2"
          size="sm"
          isDisabled={selectedDepartments.size === 0 && selectedEmployees.size === 0}
        >
          <X size={16} />
          Bỏ chọn
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="danger" onPress={handleCloseModal} size="sm">
            Hủy
          </Button>
          <Button
            variant="primary"
            onPress={handleExport}
            className="flex items-center gap-2 font-semibold shadow-lg shadow-primary-200"
            size="sm"
            isPending={isExporting}
            isDisabled={selectedEmployees.size === 0}
          >
            {isExporting ? <Spinner size="sm" className="text-white" /> : <FileText size={16} />}
            {isExporting ? 'Đang xuất...' : `Xuất (${selectedEmployees.size})`}
          </Button>
        </div>
      </div>
    ),
    [
      selectedDepartments.size,
      selectedEmployees.size,
      isExporting,
      handleClearSelection,
      handleCloseModal,
      handleExport
    ]
  )

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Xuất đơn nghỉ phép (.docx)"
      footer={footerContent}
      width="max-w-6xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Danh sách đơn vị */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">
                Danh sách đơn vị{' '}
                {selectedDepartments.size > 0 && (
                  <span className="text-blue-600">({selectedDepartments.size})</span>
                )}
              </h4>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary h-7 text-xs"
                onPress={handleSelectAllDepartments}
              >
                {selectedDepartments.size === filteredDepartments.length
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn tất cả'}
              </Button>
            </div>
            <InputGroup className="w-full relative shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <InputGroup.Prefix className="bg-white dark:bg-gray-800 pl-3 pr-2">
                <Search size={18} className="text-gray-400" strokeWidth={1.5} />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder="Tìm kiếm..."
                value={searchDepartment}
                onChange={(e) => setSearchDepartment(e.target.value)}
                className="h-10 bg-white dark:bg-gray-800 text-sm w-full border-0 focus:ring-0 rounded-none pr-3"
              />
            </InputGroup>
          </div>
          <ScrollShadow className="max-h-[400px] px-1 pt-1">
            <div className="flex flex-col gap-1">
              {isLoadingDepartments ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : filteredDepartments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">Không tìm thấy đơn vị</div>
              ) : (
                filteredDepartments.map((dept) => (
                  <div
                    key={dept.id_don_vi}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                      selectedDepartments.has(dept.id_don_vi)
                        ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                    }`}
                    onClick={() => handleDepartmentToggle(dept.id_don_vi)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        isSelected={selectedDepartments.has(dept.id_don_vi)}
                        onChange={() => handleDepartmentToggle(dept.id_don_vi)}
                        className="cursor-pointer"
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {dept.ten_don_vi}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollShadow>
        </div>

        {/* Danh sách nhân viên */}
        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">
                Danh sách nhân viên{' '}
                {selectedEmployees.size > 0 && (
                  <span className="text-blue-600">({selectedEmployees.size})</span>
                )}
              </h4>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary h-7 text-xs"
                onPress={handleSelectAllEmployees}
                isDisabled={totalEmployees === 0}
              >
                {selectedEmployees.size === allEmployees.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </div>
            <InputGroup className="w-full relative shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <InputGroup.Prefix className="bg-white dark:bg-gray-800 pl-3 pr-2">
                <Search size={18} className="text-gray-400" strokeWidth={1.5} />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder="Tìm kiếm..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                disabled={totalEmployees === 0}
                className="h-10 bg-white dark:bg-gray-800 text-sm w-full border-0 focus:ring-0 rounded-none pr-3"
              />
            </InputGroup>
          </div>

          <ScrollShadow className="max-h-[400px] px-1 flex-1">
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : selectedDepartments.size === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                Vui lòng chọn đơn vị
              </div>
            ) : totalEmployees === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">Không tìm thấy nhân viên</div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                {Array.from(selectedDepartments).map((deptId) => {
                  const dept = departments.find((d) => d.id_don_vi === deptId)
                  const empList = employeesByDept[deptId] || []
                  const filteredEmpList = getFilteredEmployees(empList)

                  if (filteredEmpList.length === 0 && searchEmployee) return null

                  const isCollapsed = collapsedDepartments.has(deptId)
                  const limit = employeeLimit[deptId] || 50
                  const displayedEmps = filteredEmpList.slice(0, limit)
                  const hasMore = filteredEmpList.length > limit

                  return (
                    <div key={deptId} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="bg-gray-50 px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between sticky top-0 z-10"
                        onClick={() => toggleDepartmentCollapse(deptId)}
                      >
                        <div className="text-sm font-semibold text-gray-700">
                          {dept?.ten_don_vi}{' '}
                          <span className="text-gray-500 font-normal">
                            ({displayedEmps.length}
                            {hasMore && `/${filteredEmpList.length}`})
                          </span>
                        </div>
                        {isCollapsed ? (
                          <ChevronDown size={16} className="text-gray-500" />
                        ) : (
                          <ChevronUp size={16} className="text-gray-500" />
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="p-2 bg-white">
                          {displayedEmps.map((emp) => (
                            <div
                              key={emp.id_nhan_vien}
                              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 border mb-1 last:mb-0 ${
                                selectedEmployees.has(emp.id_nhan_vien)
                                  ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                              }`}
                              onClick={() => handleEmployeeToggle(emp.id_nhan_vien)}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  isSelected={selectedEmployees.has(emp.id_nhan_vien)}
                                  onChange={() => handleEmployeeToggle(emp.id_nhan_vien)}
                                  className="cursor-pointer"
                                >
                                  <Checkbox.Control>
                                    <Checkbox.Indicator />
                                  </Checkbox.Control>
                                </Checkbox>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {emp.ql_nguoi_dung_ho_ten}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono uppercase">
                                    {emp.ma_nhan_vien}
                                    {emp.ql_nguoi_dung_email && (
                                      <span className="text-xs font-normal text-gray-500 italic ml-1">
                                        ({emp.ql_nguoi_dung_email})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {hasMore && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                              onPress={() => handleLoadMoreEmployees(deptId)}
                            >
                              Xem thêm {Math.min(50, filteredEmpList.length - limit)} nhân viên
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollShadow>
        </div>
      </div>
    </DraggableModal>
  )
}
