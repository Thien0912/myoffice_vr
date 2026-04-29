
import { callApi } from '@renderer/api/callApi'
import { ssoApi } from '@renderer/api/sso/auth_sso.api'
import LoadingOverlay from '@renderer/components/LoadingOverlay'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { CookieService } from '@renderer/utils/cookieService'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from "@heroui-v3/react";

export default function SSOCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setPermissions } = useAuthStore()

  async function handleGetToken(code: string) {
    const result = await ssoApi.getToken({
      grant_type: 'authorization_code',
      client_id: import.meta.env.VITE_APP_CLIENT_ID,
      client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
      code: code,
      redirect_uri: import.meta.env.VITE_APP_REDIRECT_URI
    })
    return result
  }

  const fetchUserInfoSSO = async (accessToken: string) => {
    if (!accessToken) throw new Error('Access token is required to fetch user info')

    return await callApi('authentication/login_sso', {
      method: 'POST',
      data: { access_token: accessToken }
    })
  }
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      handleGetToken(code)
        .then(({ data }: { data: any }) => {
          const { access_token, refresh_token } = data
          CookieService.set('access_token', access_token)
          CookieService.set('refresh_token', refresh_token)

          fetchUserInfoSSO(access_token).then((response) => {
            const { application_permissions } = response.data
            // console.log('response', response)
            if (!response.success) {
              toast(response.message || 'Lỗi', { variant: 'danger' })
              navigate('/login', { replace: true })
              return
            }
            const userData = response.data.user
            toast('Đăng nhập thành công', { variant: 'success' })
            navigate('/', { replace: true })
            setUser(userData)
            setPermissions(application_permissions || [])
          })
        })
        .catch((err) => {
          console.error('Error fetching SSO token: ', err.message)
          toast(err.message || 'Lỗi', { variant: 'danger' })
          navigate('/login', { replace: true })
        })
    }
  }, [])

  return <LoadingOverlay visible={true} />
}

export const refreshTokenSSO = async (refreshToken: string) => {
  if (!refreshToken) throw new Error('Refresh token is required to refresh access token')
  await ssoApi
    .getToken({
      grant_type: 'refresh_token',
      client_id: import.meta.env.VITE_APP_CLIENT_ID,
      client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
      refresh_token: refreshToken
    })
    .then(({ data }) => {
      const { access_token, refresh_token } = data
      CookieService.set('access_token', access_token)
      CookieService.set('refresh_token', refresh_token)
      console.log('SSO token đã được làm mới thành công')
    })
    .catch((err) => {
      console.error('Lỗi làm mới SSO token: ', err)
      toast('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', { variant: 'danger' })
      useAuthStore.getState().logout()
      return null
    })
}
