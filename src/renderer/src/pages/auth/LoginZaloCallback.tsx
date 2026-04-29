import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginZaloCallback from '../../api/auth/loginZaloCallback'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { setCookiesAuth } from '@renderer/utils/cookieService'
import { toast } from "@heroui-v3/react";

const LoginZaloCallback = () => {
  const navigate = useNavigate()
  const [, setLoading] = useState(false)
  const { setUser } = useAuthStore()

  const saveAuth = (user: Record<string, unknown>): void => {
    setUser(user)
  }

  useEffect(() => {
    const handleLogin = async () => {
      setLoading(true)

      try {
        const lzc = await loginZaloCallback()

        setTimeout(() => {
          const data = lzc.data!
          saveAuth(data.user)
          setLoading(false)

          setCookiesAuth(data.access_urls, data.permission_keys, data.public_key, data.tag)

          // Redirect về returnUrl nếu có, ngược lại về trang chủ
          const returnUrl = sessionStorage.getItem('loginReturnUrl')
          sessionStorage.removeItem('loginReturnUrl')
          navigate(returnUrl || '/', { replace: true })
        }, 1000)
      } catch (error: any) {
        // console.error('❌ Lỗi khi gọi API:', err.response?.data || err.message)

        toast('Lỗi đăng nhập', { description: error.response?.data?.message || error.message, variant: 'danger', timeout: 4000 })

        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    }

    handleLogin()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-linear-to-b from-blue-100 to-blue-200 animate-fadeIn">
      {/* Spinner */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute w-16 h-16 top-2 left-2 border-4 border-yellow-400 border-b-transparent rounded-full animate-spin-slow"></div>
      </div>

      {/* Text */}
      <h2 className="text-gray-800 text-lg font-semibold animate-pulse">
        ⏳ Đang xử lý đăng nhập Zalo...
      </h2>
    </div>
  )
}

export default LoginZaloCallback
