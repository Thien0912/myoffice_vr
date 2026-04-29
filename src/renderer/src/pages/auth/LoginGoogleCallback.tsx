import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import loginGoogleCallback from '../../api/auth/loginGoogleCallback'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { CookieService } from '@renderer/utils/cookieService'
import LoadingOverlay from '@renderer/components/LoadingOverlay'
import { useMutation } from '@tanstack/react-query'
import { toast } from "@heroui-v3/react";

const LoginGoogleCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryString = location.search
  const { setUser } = useAuthStore()
  // 👉 Hàm nén + mã hóa base64
  const loginMutation = useMutation({
    mutationFn: () => loginGoogleCallback(queryString),
    onSuccess: (response: any) => {
      const data = response?.data
      if (!data) {
        toast('Lỗi đăng nhập', { description: response?.message || 'Lỗi callback Google OAuth', variant: 'danger' })
        return
      }

      toast('Đăng nhâp thành công', { description: data.message || 'Đã truy cập vào hệ thống thành công', variant: 'success' })

      // console.log('object: ', data)
      CookieService.set('access_token', data.token)
      setUser({ ...data.user, permissions: data.permission_keys })

      // Redirect về returnUrl nếu có, ngược lại về trang chủ
      const returnUrl = sessionStorage.getItem('loginReturnUrl')
      sessionStorage.removeItem('loginReturnUrl')
      navigate(returnUrl || '/', { replace: true })
    },
    onError: (error: any) => {
      console.error('Login Google callback error:', error)
      toast('Lỗi đăng nhập', { description: 'Lỗi không xác định', variant: 'danger' })
    }
  })

  useEffect(() => {
    loginMutation.mutate()
  }, [])

  return <LoadingOverlay visible={true} />
}

export default LoginGoogleCallback
