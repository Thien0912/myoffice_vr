import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { userAxios } from '@renderer/api/auth/userAxios'
import LoadingOverlay from '@renderer/components/LoadingOverlay'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@heroui/react'
import { CheckCircle2, XCircle, Home, KeyRound, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PinCodeApproval = () => {
  const { id: token } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  const proposeId = searchParams.get('id_de_xuat')
  const viewMode = searchParams.get('view')

  const loginMutation = useMutation({
    mutationFn: () => {
      if (!token) throw new Error('Token không hợp lệ')
      return userAxios.activatePinCode(token)
    },
    onSuccess: (response: any) => {
      if (response?.success) {
        setStatus('success')
        setMessage(response.message || 'Đã xác thực mã PIN thành công')
        queryClient.invalidateQueries({ queryKey: ['me'] })
      } else {
        setStatus('error')
        setMessage(response?.message || 'Lỗi xác thực mã PIN')
      }
    },
    onError: (error: any) => {
      setStatus('error')
      setMessage(error?.response?.data?.message || 'Có lỗi xảy ra khi xác thực mã PIN')
    }
  })

  const handleNavigate = () => {
    if (proposeId) {
      const url = `/propose?id=${proposeId}${viewMode ? `&view=${viewMode}` : ''}`
      navigate(url)
    } else {
      navigate('/')
    }
  }

  useEffect(() => {
    if (token) {
      loginMutation.mutate()
    } else {
      setStatus('error')
      setMessage('Token xác thực không hợp lệ hoặc đã hết hạn')
    }
  }, [token])

  // Xử lý countdown khi đã có kết quả
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (status !== 'loading' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      handleNavigate()
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [status, countdown, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900 p-4">
      <AnimatePresence mode="wait">
        {status === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingOverlay visible={true} />
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-blue-500/5 p-8 border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="relative mb-6 inline-block">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto ${status === 'success' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}
              >
                {status === 'success' ? (
                  <CheckCircle2 size={40} className="text-green-500" />
                ) : (
                  <XCircle size={40} className="text-red-500" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm border border-gray-50 dark:border-gray-700 font-bold">
                <KeyRound size={16} className="text-blue-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {status === 'success' ? 'Xác thực thành công!' : 'Xác thực thất bại'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              <Button
                color="primary"
                size="lg"
                variant="shadow"
                onPress={handleNavigate}
                className="font-semibold h-12 bg-blue-600 shadow-blue-500/25"
                startContent={proposeId ? <FileText size={18} /> : <Home size={18} />}
              >
                {proposeId ? 'Về đề xuất' : 'Về trang chủ'} ({countdown}s)
              </Button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Hệ thống sẽ tự động quay về {proposeId ? 'đề xuất' : 'trang chủ'} sau{' '}
                <span className="font-bold text-blue-500">{countdown}s</span>
              </p>
              {status === 'error' && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Nếu bạn gặp sự cố, vui lòng liên hệ quản trị viên để được hỗ trợ.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PinCodeApproval
