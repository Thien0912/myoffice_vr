import { useState, useEffect } from 'react'
import { Button, InputOtp, Card, CardBody } from '@heroui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, ShieldCheck, ArrowLeft, RefreshCw, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { userAxios } from '@renderer/api/auth/userAxios'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { toast } from "@heroui-v3/react";

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, setHrmVerified } = useAuthStore()
  const [otpValue, setOtpValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otpSent, setOtpSent] = useState(false)

  const redirectUrl = searchParams.get('redirect') || '/hrm/hop-dong'

  useEffect(() => {
    let timer: any = null
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  const handleSendOtp = async () => {
    if (countdown > 0 || isSending) return
    setIsSending(true)
    try {
      const res = await userAxios.sendOtp()
      if (res?.success) {
        toast('Thành công', { description: 'Mã OTP đã được gửi đến email của bạn.', variant: 'success' })
        setCountdown(60)
        setOtpSent(true)
      } else {
        // Ưu tiên lấy message chuỗi, nếu không có thì lấy status chuỗi (trường hợp cũ)
        let errorMsg = 'Không thể gửi mã OTP'
        if (typeof res?.message === 'string') errorMsg = res.message
        else if (typeof res?.status === 'string') errorMsg = res.status

        toast('Lỗi', { description: errorMsg, variant: 'danger' })

        // Nếu có thời gian chờ còn lại từ server (trường hợp mã OTP cũ vẫn còn hiệu lực)
        const remaining = res?.data?.remaining_seconds || res?.remaining_seconds
        if (remaining) {
          setCountdown(Math.ceil(remaining))
          setOtpSent(true)
        }
      }
    } catch (error) {
      console.error('Send OTP Error:', error)
      toast('Lỗi', { description: 'Có lỗi xảy ra khi gửi mã OTP', variant: 'danger' })
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    if (otpValue.length !== 6) return
    setIsLoading(true)
    try {
      const res = await userAxios.verifyOtp(otpValue)
      if (res?.success) {
        setHrmVerified(true)
        toast('Xác thực thành công', { description: 'Bạn đã truy cập vào module hồ sơ.', variant: 'success' })
        navigate(redirectUrl, { replace: true })
      } else {
        const errorMsg = typeof res?.message === 'string' ? res.message : 'Mã OTP không chính xác hoặc đã hết hạn'
        toast('Xác thực thất bại', { description: errorMsg, variant: 'danger' })
        setOtpValue('')
      }
    } catch (error) {
      console.error('Verify OTP Error:', error)
      toast('Lỗi', { description: 'Có lỗi xảy ra khi xác thực OTP', variant: 'danger' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-[13px]" style={{ fontFamily: 'Momo Trust Sans, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden bg-white dark:bg-gray-800">
          <CardBody className="py-10 px-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
              <Mail className="text-blue-600 w-10 h-10" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Xác thực OTP
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[300px]">
              Để bảo mật thông tin nhân sự, vui lòng xác thực OTP qua email: <br />
              <span className="font-semibold text-blue-600 block mt-1">
                {user?.ql_nguoi_dung_email || user?.email}
              </span>
            </p>

            <div className="w-full space-y-8">
              {!otpSent ? (
                <div className="space-y-4">
                  <Button
                    color="primary"
                    className="w-full font-bold h-12 text-base bg-blue-600 shadow-lg shadow-blue-600/20"
                    onPress={handleSendOtp}
                    isLoading={isSending}
                    isDisabled={isSending}
                    startContent={!isSending && <Send size={20} />}
                  >
                    Gửi mã OTP
                  </Button>

                  <Button
                    variant="light"
                    size="sm"
                    onPress={() => navigate('/')}
                    className="w-full text-gray-400 hover:text-gray-600 data-[hover=true]:bg-transparent"
                    startContent={<ArrowLeft size={16} />}
                  >
                    Quay lại trang chủ
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <InputOtp
                      length={6}
                      variant="bordered"
                      type="password"
                      size="lg"
                      value={otpValue}
                      onValueChange={setOtpValue}
                      validationBehavior="aria"
                      classNames={{
                        segment: 'text-2xl font-bold border-gray-200 dark:border-gray-700 focus:border-blue-500 w-12 h-14'
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <Button
                      color="primary"
                      className="w-full font-bold h-12 text-base bg-blue-600 shadow-lg shadow-blue-600/20"
                      onPress={handleVerify}
                      isLoading={isLoading}
                      isDisabled={otpValue.length !== 6 || isLoading}
                      startContent={!isLoading && <ShieldCheck size={20} />}
                    >
                      Xác nhận truy cập
                    </Button>

                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span>Không nhận được mã?</span>
                        <Button
                          variant="light"
                          size="sm"
                          onPress={handleSendOtp}
                          isDisabled={countdown > 0 || isSending}
                          className="p-0 h-auto font-semibold text-blue-600 data-[hover=true]:bg-transparent"
                          startContent={isSending ? <RefreshCw size={14} className="animate-spin" /> : null}
                        >
                          {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã ngay'}
                        </Button>
                      </div>

                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => navigate('/')}
                        className="text-gray-400 hover:text-gray-600 data-[hover=true]:bg-transparent"
                        startContent={<ArrowLeft size={16} />}
                      >
                        Quay lại trang chủ
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}
