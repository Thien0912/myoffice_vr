import { Button } from '@heroui-v3/react'
import { FormProvider } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logoDnc from '@renderer/assets/images/logo/LOGO TA 2.png'
import { useCreateLeaveRequest } from './hooks/useCreateLeaveRequest'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useAfterRedirect } from '@renderer/hooks/useAfterRedirect'
import { useState } from 'react'
import { LeaveRequestFormContent } from './components/LeaveRequestFormContent'
import { TotalDaysDisplay } from './components/TotalDaysDisplay'

export default function DangKyNghiPhepPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    form,
    days,
    employeeOptions,
    leaveTypeOptions,
    handleAddDay,
    handleRemoveDay,
    handleCreate,
    isLoading,
    isLoadingEmployees,
    isLoadingLeaveTypes,
    isEmployeeSelectDisabled
  } = useCreateLeaveRequest({
    onSuccess: () => {
      setIsSuccess(true)
    },
    onOpenChange: () => {}
  })

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-[#f0f4f8] dark:bg-gray-900 p-4 text-center">
        <div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl border-gray-200 dark:border-gray-700 border shadow-xl max-w-sm w-full"
        >
          <div
            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
          >
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100 mb-2">
            Đăng ký thành công!
          </h2>
          <p className="text-slate-500 dark:text-gray-400 mb-6 font-light">
            Đơn xin nghỉ phép của bạn đã được gửi và đang chờ phê duyệt.
          </p>
          <Button
            variant="primary"
            className="w-full font-bold h-12 shadow-md"
            onPress={() => navigate(-1)}
          >
            Quay về xem danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#f0f4f8] dark:bg-gray-900 relative overflow-x-hidden">
      <div className="flex-1">
        <div className="max-w-[640px] mx-auto w-full py-4 px-4 pb-20 sm:pb-26 flex flex-col gap-4 transition-all duration-300">
          {/* Title Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative group">
            <div className="p-6">
              <div className="flex flex-row-reverse sm:flex-row-reverse justify-between items-center  gap-1 mb-3">
                <div className="shrink-0 flex items-center justify-center order-2 sm:order-2 mb-2 sm:mb-0">
                  <img
                    src={logoDnc}
                    alt="DNC Logo"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col items-center sm:items-start order-1 sm:order-1">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white uppercase leading-tight">
                    Đơn đăng ký nghỉ phép
                  </h1>
                </div>
              </div>

              <div className="h-0.5 bg-blue-500 w-full mb-4"></div>

              <div className="text-gray-500 font-normal">
                <p className="text-[11px]">
                  - Tạo đơn xin nghỉ phép mới cho cán bộ công nhân viên.
                </p>
                <p className="text-[11px]">- Vui lòng kiểm tra kỹ thông tin trước khi gửi.</p>
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-[10px] text-red-500 font-medium uppercase tracking-wider">
                  * Thông tin bắt buộc
                </span>
                {!user ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-light">
                    <AlertCircle size={16} />
                    <span>Bạn chưa đăng nhập? Nhấn</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-0 px-2 underline text-blue-500"
                      onPress={() => {
                        useAfterRedirect.set()
                        navigate('/login')
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <span>để tiếp tục</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>
                      Đang đăng nhập với tư cách:{' '}
                      <b className="text-gray-700 dark:text-gray-200">
                        {user.ql_nguoi_dung_ho_ten}
                      </b>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <FormProvider {...form}>
            <LeaveRequestFormContent
              form={form}
              days={days}
              employeeOptions={employeeOptions}
              leaveTypeOptions={leaveTypeOptions}
              handleAddDay={handleAddDay}
              handleRemoveDay={handleRemoveDay}
              isLoadingEmployees={isLoadingEmployees}
              isLoadingLeaveTypes={isLoadingLeaveTypes}
              isEmployeeSelectDisabled={isEmployeeSelectDisabled}
              layout="page"
            />
          </FormProvider>
        </div>
      </div>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md fixed bottom-0 left-0 right-0 border-t border-gray-100 dark:border-gray-700 p-3 z-50">
        <div className="max-w-[640px] mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="font-medium text-danger"
            onPress={() => navigate(-1)}
          >
            Hủy bỏ
          </Button>
          <div className="flex items-center gap-4">
            <TotalDaysDisplay 
              control={form.control}
              className="flex flex-col items-end leading-none"
              labelClassName="text-[9px] uppercase text-gray-400 font-bold tracking-wider mb-0.5"
              valueClassName="text-blue-600 dark:text-blue-400 font-bold flex items-baseline text-xl after:content-['X'] after:text-[10px] after:ml-0.5 after:uppercase after:content-['Ngày']"
              showLabel={true}
            />
            <Button
              size="md"
              variant="primary"
              className="font-bold px-6 h-10 shadow-lg shadow-blue-500/20"
              onPress={() => handleCreate()}
              isDisabled={!user}
              isPending={isLoading}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
