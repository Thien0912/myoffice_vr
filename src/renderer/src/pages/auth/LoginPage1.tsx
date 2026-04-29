import { Button, Separator, Input } from '@heroui-v3/react'
import logo from '@renderer/assets/images/logo/LOGO TA 3.png'
import logoSmall from '@renderer/assets/images/logo/logo.png'
import { useState } from 'react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { Link, Navigate } from 'react-router-dom'
import axios from 'axios'

export default function LoginPage(): React.ReactNode {
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const handleLogin = (): void => {
    setLoading(true)
    // Giả lập quá trình đăng nhập (2 giây)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const loginGoogle = async (): Promise<void> => {
    const params = [
      'response_type=code',
      'redirect_uri=' + encodeURIComponent(import.meta.env.VITE_REDIRECT_URI),
      'client_id=' + encodeURIComponent(import.meta.env.VITE_CLIENT_ID),
      'scope=' +
        encodeURIComponent(
          'email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid'
        ),
      'access_type=' + encodeURIComponent('offline'),
      'approval_prompt=' + encodeURIComponent('force')
    ]

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.join('&')}`
    window.location.href = url
  }

  const loginZalo = async () => {
    const res = await axios.get(
      // 'http://localhost/dncoffice_api/api/v1/authentication/loginZalo',
      'https://myoffice.sandboxnctu.qzz.io/api/api/v1/authentication/loginZalo',
      {
        headers: {
          'DHNCT-API-KEY': '@cntt@dhnct@' // Header xác thực backend yêu cầu
        }
      }
    )
    if (res.status === 200) {
      console.log('res: ', res.data.data)
      // return

      sessionStorage.setItem('zalo_code_verifier', res.data.data.code_verifier)
      window.location.href = res.data.data.url
    }
  }

  return (
    <div className="min-h-dvh flex justify-center items-center bg-[#F8F9FB]">
      <div className="fixed top-4 left-4 md:top-5 md:left-7 hidden sm:block">
        <img src={logo} alt="" className="h-9 md:h-11" />
      </div>
      <div className="w-full md:max-w-md h-dvh md:h-auto text-center md:shadow-lg px-8 py-9 md:rounded-2xl bg-white sm:m-0 flex items-center">
        <div className="px-2">
          <div className="mb-6">
            <div className="space-y-2">
              <div className="block sm:hidden">
                <img src={logoSmall} alt="" className="h-12 mx-auto mb-4" />
              </div>
              <h1 className="text-3xl md:mb-6 font-bold text-[#ed1c24]">MyOffice</h1>
              <div
                className="text-[#333333] font-bold text-[16px]"
                style={{ fontFamily: 'Momo Trust Sans, sans-serif' }}
              >
                Đăng nhập để tiếp tục sử dụng
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-full font-bold bg-white border border-gray-300 hover:bg-[#f9fafb] hover:border-[#d1d5db] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200"
              onPress={loginGoogle}
            >
              <GoogleIcon />
              <span className="font-medium text-sm md:text-base">Đăng nhập với Google</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-full font-bold bg-white border border-gray-300 hover:bg-[#f9fafb] hover:border-[#d1d5db] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200"
              onPress={loginZalo}
            >
              <ZaloIcon />
              <span className="font-medium text-sm md:text-base">Đăng nhập với Zalo</span>
            </Button>
            <Link
              to={`${import.meta.env.VITE_APP_SSO_ENDPOINT}/auth/social/google?client_id=${import.meta.env.VITE_APP_CLIENT_ID}&redirect_to=${import.meta.env.VITE_APP_REDIRECT_URI}`}
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full font-bold bg-white border border-gray-300 hover:bg-[#f9fafb] hover:border-[#d1d5db] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200"
              >
                <div className="border border-blue-200 px-1 rounded-md text-blue-600 text-xs">
                  SSO
                </div>
                <span className="font-medium text-sm md:text-base">Đăng nhập với SSO</span>
              </Button>
            </Link>
          </div>

          <Separator className="my-3 sm:my-5 mx-auto w-4/5 hidden" />
          <div className="space-y-3 sm:space-y-3 hidden">
            <Input placeholder="Tên đăng nhập" className="rounded-full" />
            <Button
              variant="secondary"
              size="lg"
              className="w-full rounded-full"
              isDisabled={loading}
              isPending={loading}
              onPress={handleLogin}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <div>
              <small>Nếu gặp khó khăn khi đăng nhập vui lòng</small>
              <small className="underline ms-1 text-primary cursor-pointer">Xem hướng dẫn</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon(): React.JSX.Element {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="-3 0 262 262"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
    >
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  )
}

function ZaloIcon(): React.JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48" className="size-7">
      <path
        fill="#2962ff"
        d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"
      ></path>
      <path
        fill="#FFF"
        d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"
      ></path>
      <path
        fill="#2962ff"
        d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"
      ></path>
      <path fill="#2962ff" d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"></path>
      <path
        fill="#2962ff"
        d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"
      ></path>
      <path
        fill="#2962ff"
        d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"
      ></path>
    </svg>
  )
}
