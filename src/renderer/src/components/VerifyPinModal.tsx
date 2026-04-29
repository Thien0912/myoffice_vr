import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, InputOtp } from '@heroui/react'
import { useState, useEffect, useRef } from 'react'
import { KeyRound, ShieldCheck, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { userAxios } from '@renderer/api/auth/userAxios'
import RegisterPinModal from '@renderer/layouts/header/components/RegisterPinModal'
import { useMutation } from '@tanstack/react-query'
import { toast } from "@heroui-v3/react";

interface VerifyPinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function VerifyPinModal({ isOpen, onClose, onSuccess }: VerifyPinModalProps) {
  const { user, setUser } = useAuthStore()
  const [pinValue, setPinValue] = useState('')
  const [confirmPinValue, setConfirmPinValue] = useState('')
  const [pinError, setPinError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isPinValid, setIsPinValid] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const pinInputRef = useRef<HTMLInputElement>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPinValue('')
      setConfirmPinValue('')
      setPinError('')
      setIsValidating(false)
      setIsPinValid(false)
    }
  }, [isOpen])

  // Tự động validate nếu PIN đã có sẵn (trường hợp vừa xác thực email xong)
  useEffect(() => {
    if (isOpen && (user?.has_pin === 1 || user?.has_pin === '1')) {
      if (pinValue.length === 6 && !isPinValid && !isValidating) {
        validatePin(pinValue)
      }
    }
  }, [user?.has_pin, isOpen, pinValue, isPinValid, isValidating])

  const registerMutation = useMutation({
    mutationFn: (pin: string) => userAxios.registerPin(pin),
    onSuccess: (res: any) => {
      if (res?.success) {
        if (user) {
          setUser({
            ...user,
            has_pin: 2,
            pin_is_valid: 0
          })
        }
        toast('Thành công', { description: 'Đăng ký mã PIN thành công. Vui lòng xác thực qua email để tiếp tục.', variant: 'success' })
        
        // Gửi mail xác thực (chạy ngầm)
        const pinId = res?.data?.id_ql_nguoi_dung_pin_code || res?.data
        if (pinId) {
          userAxios.sendPinCodeApprovalEmail(pinId).catch(console.error)
        }
      } else {
        toast('Lỗi', { description: res?.message || 'Có lỗi khi đăng ký mã PIN', variant: 'danger' })
      }
    },
    onError: (err: any) => {
      toast('Lỗi', { description: err?.response?.data?.message || 'Có lỗi xảy ra', variant: 'danger' })
    }
  })

  const validatePin = async (pin: string) => {
    setIsValidating(true)
    setPinError('')

    try {
      const response = await userAxios.validatePin(pin)
      if (response.success) {
        setIsPinValid(true)
        setPinError('')
        // Tự động gọi onSuccess sau một khoảng thời gian ngắn để hiện hiệu ứng thành công
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 800)
      } else {
        setIsPinValid(false)
        setPinError(response.message || 'Mã PIN không hợp lệ')
        setPinValue('')
        pinInputRef.current?.focus()

        // Cập nhật trạng thái has_pin nếu bị khóa (giả định mã 3 là locked)
        if (response.has_pin === 3 && user) {
          setUser({ ...user, has_pin: 3 })
        }
      }
    } catch (err: any) {
      setIsPinValid(false)
      setPinError(err?.response?.data?.message || 'Có lỗi xảy ra khi xác thực')
      setPinValue('')
      pinInputRef.current?.focus()
    } finally {
      setIsValidating(false)
    }
  }

  const handleAction = () => {
    const noPin = !user?.has_pin || user?.has_pin === 0 || user?.has_pin === '0'
    
    if (noPin) {
      if (pinValue.length !== 6) {
        setPinError('Vui lòng nhập đủ 6 chữ số')
        return
      }
      if (pinValue !== confirmPinValue) {
        setPinError('Mã PIN xác nhận không khớp')
        return
      }
      registerMutation.mutate(pinValue)
      return
    }

    if (pinValue.length === 6) {
      validatePin(pinValue)
    }
  }

  const handleValueChange = (val: string) => {
    setPinValue(val)
    if (pinError) setPinError('')
    setIsPinValid(false)

    const noPin = !user?.has_pin || user?.has_pin === 0 || user?.has_pin === '0'
    if (!noPin && val.length === 6) {
      validatePin(val)
    }
  }

  // Phân tích trạng thái PIN của user
  // has_pin: 1 (Active), 2 (Pending Email), 3 (Locked), 0/null (Not registered)
  const isPending = user?.has_pin === 2 || user?.has_pin === '2'
  const isLocked = user?.has_pin === 3 || user?.has_pin === '3'
  const noPin = !user?.has_pin || user?.has_pin === 0 || user?.has_pin === '0'

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        size="md"
        placement="center"
        backdrop="opaque"
        classNames={{
          wrapper: 'z-[110]',
          backdrop: 'z-[109]'
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 py-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <KeyRound size={18} className="text-blue-500" />
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              {noPin ? 'Đăng ký mã PIN' : 'Xác thực mã PIN'}
            </span>
          </ModalHeader>

          <ModalBody className="py-8">
            <AnimatePresence mode="wait">
              {noPin ? (
                <motion.div
                  key="register-pin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col items-center gap-6"
                >
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-gray-800 dark:text-white">Thiết lập mã PIN mới</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px]">
                      Bạn chưa có mã PIN. Vui lòng thiết lập mã PIN 6 chữ số để sử dụng tính năng ký số.
                    </p>
                  </div>

                  <div className="space-y-6 w-full flex flex-col items-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhập mã PIN
                      </span>
                      <InputOtp
                        length={6}
                        variant="bordered"
                        type="password"
                        size="lg"
                        value={pinValue}
                        onValueChange={handleValueChange}
                        classNames={{
                          segment: 'text-2xl font-bold'
                        }}
                      />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Xác nhận mã PIN
                      </span>
                      <InputOtp
                        length={6}
                        variant="bordered"
                        type="password"
                        size="lg"
                        value={confirmPinValue}
                        onValueChange={(val) => {
                          setConfirmPinValue(val)
                          if (pinError) setPinError('')
                        }}
                        classNames={{
                          segment: 'text-2xl font-bold'
                        }}
                      />
                    </div>

                    {pinError && (
                      <p className="text-xs text-red-500 font-medium">
                        {pinError}
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : isPending ? (
                <motion.div
                  key="pending-pin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Info size={32} className="text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 dark:text-white">Chờ xác thực email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px]">
                      Hệ thống đã gửi email xác nhận. Vui lòng kiểm tra hộp thư trước khi thực hiện ký số.
                    </p>
                  </div>
                </motion.div>
              ) : isLocked ? (
                <motion.div
                  key="locked-pin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <ShieldCheck size={32} className="text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 dark:text-white">Mã PIN bị khóa</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px]">
                      Tài khoản của bạn đã bị khóa tính năng ký số do nhập sai mã PIN nhiều lần.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="verify-pin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nhập mã PIN 6 chữ số
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mã PIN dùng để xác thực quyền ký số của bạn
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <InputOtp
                      ref={pinInputRef}
                      length={6}
                      variant="bordered"
                      type="password"
                      size="lg"
                      value={pinValue}
                      isDisabled={isValidating || isPinValid}
                      onValueChange={handleValueChange}
                      errorMessage={pinError}
                      isInvalid={!!pinError}
                      validationBehavior="aria"
                      classNames={{
                        segment: 'text-2xl font-bold'
                      }}
                    />

                    {isValidating && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xác thực...</span>
                      </div>
                    )}

                    {isPinValid && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 text-sm text-green-600 font-medium"
                      >
                        <ShieldCheck size={16} />
                        <span>Mã PIN hợp lệ</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ModalBody>

          <ModalFooter className="border-t border-gray-50 dark:border-gray-800">
            <Button variant="light" onPress={onClose} className="font-medium">
              {isPending || isLocked ? 'Đóng' : 'Hủy'}
            </Button>
            {!isPending && !isLocked && (
              <Button
                color="primary"
                className="font-bold bg-blue-600 shadow-lg shadow-blue-500/20"
                onPress={handleAction}
                isLoading={isValidating || registerMutation.isPending}
                isDisabled={
                  (noPin ? (pinValue.length !== 6 || confirmPinValue.length !== 6) : (pinValue.length !== 6 || isPinValid)) ||
                  isValidating || 
                  registerMutation.isPending
                }
              >
                {noPin ? 'Đăng ký ngay' : 'Xác thực'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <RegisterPinModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  )
}
