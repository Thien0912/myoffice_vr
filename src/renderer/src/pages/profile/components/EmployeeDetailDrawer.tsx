import React, { Suspense } from 'react'
import { Button, Spinner, Tooltip } from '@heroui/react'
import { ChevronsRight, X } from 'lucide-react'
import { HrDrawer, HrDrawerBody, HrDrawerHeader } from '@renderer/components/hero-custom'

const EditNhansuPage = React.lazy(() => import('../EditNhansuPage'))

interface EmployeeDetailDrawerProps {
  isOpen: boolean
  employeeId?: string
  employeeName?: string
  onClose: () => void
}

export default function EmployeeDetailDrawer({
  isOpen,
  employeeId,
  employeeName,
  onClose
}: EmployeeDetailDrawerProps) {
  return (
    <HrDrawer isOpen={isOpen} placement="right" onClose={onClose} defaultWidth={1000}>
      <HrDrawerHeader>
        <div className="flex items-center gap-1">
          <Tooltip content="Đóng" className="capitalize bg-slate-100" radius="none" placement="left">
            <Button
              isIconOnly
              startContent={<ChevronsRight size={18} />}
              size="sm"
              variant="light"
              onPress={onClose}
            />
          </Tooltip>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {`Thông tin chi tiết: ${employeeName || ''}`}
          </span>
        </div>
        <Button
          isIconOnly
          variant="light"
          radius="full"
          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onPress={onClose}
        >
          <X size={20} />
        </Button>
      </HrDrawerHeader>
      <HrDrawerBody className="p-0 overflow-hidden h-full">
        {isOpen && employeeId && (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spinner label="Đang tải..." />
              </div>
            }
          >
            <EditNhansuPage
              key={employeeId}
              idNhanVien={employeeId}
              isDrawer
              onClose={onClose}
            />
          </Suspense>
        )}
      </HrDrawerBody>
    </HrDrawer>
  )
}
