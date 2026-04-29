import { useAuthStore } from '@renderer/store/useAuthStore'
import { Suspense } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'


// const OTP_REQUIRED_PATHS = [
//   '/hrm/hop-dong',
//   '/hrm/nhan-vien/edit',
//   '/hrm/thoi-viec',      // Thêm bất kỳ path nào bạn muốn
// ]
const OTP_REQUIRED_PATHS = ['/hrm/hop-dong']

export default function HrmAuthWrapper() {
  const { isHrmVerified } = useAuthStore()
  const location = useLocation()

  const isOtpRequired = OTP_REQUIRED_PATHS.some((path) => location.pathname.startsWith(path))

  if (!isHrmVerified && isOtpRequired) {
    return (
      <Navigate
        to={`/verify-otp?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  )
}
