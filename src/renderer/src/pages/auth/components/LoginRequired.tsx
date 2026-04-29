import { Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAfterRedirect } from '@renderer/hooks/useAfterRedirect'
import logoDnc from '@renderer/assets/images/logo/logodnc.png'

interface LoginRequiredProps {
  title?: string
  description?: string
  onBack?: () => void
}

export const LoginRequired = ({
  title = 'Yêu cầu đăng nhập',
  description = 'Vui lòng đăng nhập tài khoản của bạn để tiếp tục thực hiện thao tác này.',
  onBack
}: LoginRequiredProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-dvh bg-white sm:bg-[#f0f4f8] dark:bg-gray-900 sm:p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 sm:rounded-lg sm:border border-gray-200 dark:border-gray-700 max-w-sm w-full h-full sm:h-auto flex flex-col justify-center"
      >
        <div className="flex items-center justify-center mx-auto mb-6 shrink-0">
          <img src={logoDnc} alt="DNC Logo" className="h-12 w-auto object-contain" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-8 text-[15px] font-normal leading-relaxed px-4">
          {description}
        </p>
        <div className="flex flex-col gap-3 mt-2">
          <Button
            color="primary"
            className="w-full font-bold h-12 text-base rounded-xl"
            onPress={() => {
              useAfterRedirect.set()
              navigate('/login')
            }}
          >
            Đăng nhập ngay
          </Button>
          <Button
            variant="light"
            className="w-full font-medium text-gray-400 h-10 mt-1"
            onPress={() => (onBack ? onBack() : navigate(-1))}
          >
            Quay Lại
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
