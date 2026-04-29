import {
  Button,
  Modal,
  TextArea,
  InputOTP,
  Spinner, toast } from '@heroui-v3/react'
import { useState, useEffect, useRef } from 'react'
import { userAxios } from '@renderer/api/auth/userAxios'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { KeyRound, ShieldCheck, Mail } from 'lucide-react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import RegisterPinModal from '@renderer/layouts/header/components/RegisterPinModal'

interface ApproveModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isReject?: boolean
  isLoading?: boolean
  verificationType?: 'none' | 'pin' | 'otp'
  entityId?: string
}

export default function ApproveModal({
  isOpen,
  onClose,
  onConfirm,
  isReject = false,
  isLoading = false,
  verificationType = 'none',
  entityId
}: ApproveModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<'reason' | 'verification'>('reason')
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      setReason('')
      setError('')
      setStep('reason')
      setInputValue('')
      setInputError('')
      setIsValidating(false)
      setIsValid(false)
    }
  }, [isOpen])

  // Handle auto-send OTP when entering verification step
  useEffect(() => {
    if (step === 'verification' && verificationType === 'otp' && isOpen && !isReject) {
      handleSendOtp()
    }
  }, [step, verificationType, isOpen, isReject])

  const handleSendOtp = async () => {
    if (!entityId) return
    try {
      // Use dexuatAxios for OTP which is specific to proposal approval
      await dexuatAxios.sendOtpApproval(entityId)
      toast('Đã gửi mã OTP', { description: 'Vui lòng kiểm tra email của bạn', variant: 'success' })
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast('Lỗi gửi mã OTP', { description: 'Không thể gửi mã xác thực đến email', variant: 'danger' })
    }
  }

  const validateCode = async (code: string) => {
    setIsValidating(true)
    setInputError('')

    try {
      let response
      if (verificationType === 'pin') {
        response = await userAxios.validatePin(code)
      } else if (verificationType === 'otp') {
        if (!entityId) throw new Error('Missing proposal ID')
        response = await dexuatAxios.verifyOtpApproval(entityId, code)
      }

      console.log('validate response: ', response)

      if (response && (response.success === true || response.status === true)) {
        // Handle flexible API response
        setIsValid(true)
        setInputError('')
      } else {
        setIsValid(false)
        setInputError(response?.message || 'Mã xác thực không hợp lệ')
        setInputValue('')
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)

        // Update PIN status if needed (specific to PIN flow)
        if (verificationType === 'pin' && response?.has_pin === 3 && user) {
          setUser({ ...user, has_pin: response.has_pin })
        }
      }
    } catch (error: any) {
      setIsValid(false)
      setInputError(error?.response?.data?.message || 'Mã xác thực không hợp lệ')
      setInputValue('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } finally {
      setIsValidating(false)
    }
  }

  const handleNextStep = () => {
    if (isReject && !reason.trim()) {
      setError('Vui lòng nhập lý do từ chối')
      return
    }

    if (verificationType !== 'none' && !isReject) {
      setStep('verification')
    } else {
      onConfirm(reason)
    }
  }

  const handleSubmit = () => {
    if (!isValid) {
      setInputError('Vui lòng nhập mã hợp lệ')
      return
    }
    onConfirm(reason)
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="z-[110]"
    >
      <Modal.Container size="md" placement="center">
        <Modal.Dialog>
            <Modal.Header className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 py-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${isReject ? 'bg-red-50 dark:bg-red-500/10' : 'bg-blue-50 dark:bg-blue-500/10'}`}
              >
                {step === 'verification' ? (
                  verificationType === 'otp' ? (
                    <Mail size={18} className="text-blue-500" />
                  ) : (
                    <KeyRound size={18} className="text-blue-500" />
                  )
                ) : (
                  <ShieldCheck size={18} className={isReject ? 'text-red-500' : 'text-blue-500'} />
                )}
              </div>
              <Modal.Heading
                className={`text-lg font-semibold ${isReject && step !== 'verification' ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}
              >
                {step === 'verification'
                  ? verificationType === 'otp'
                    ? 'Xác thực qua Email'
                    : 'Xác thực mã PIN'
                  : isReject
                    ? 'Xác nhận từ chối'
                    : 'Xác nhận duyệt đề xuất'}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-6">
              {step === 'reason' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isReject
                      ? 'Bạn có chắc chắn muốn từ chối đề xuất này? Hành động này không thể hoàn tác.'
                      : 'Bạn có chắc chắn muốn duyệt đề xuất này? Ghi chú của bạn sẽ được lưu vào lịch sử.'}
                  </p>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Lý do / Ghi chú {isReject && <span className="text-red-500">*</span>}</label>
                    <TextArea
                      placeholder={
                      isReject
                        ? 'Nhập lý do từ chối (bắt buộc)...'
                        : 'Nhập ghi chú thêm (nếu có)...'
                    }
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value)
                      if (error) setError('')
                    }}
                    rows={3}
                    required={isReject}
                  />
                  {error && <span className="text-sm text-red-500">{error}</span>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {verificationType === 'otp'
                        ? 'Nhập mã OTP đã gửi đến email'
                        : 'Nhập mã PIN 6 chữ số'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {verificationType === 'otp'
                        ? 'Vui lòng kiểm tra hộp thư của bạn'
                        : 'Mã PIN dùng để xác thực quyền ký số của bạn'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <InputOTP
                      ref={inputRef}
                      maxLength={6}
                      type={verificationType === 'otp' ? 'text' : 'password'}
                      value={inputValue}
                      isDisabled={isValidating || isValid}
                      onChange={(e: any) => {
                        const val = e?.target?.value ?? e;
                        setInputValue(val)
                        if (inputError) setInputError('')
                        setIsValid(false)

                        if (val.length === 6) {
                          validateCode(val)
                        }
                      }}
                      className="text-2xl font-bold"
                    >
                      <InputOTP.Group>
                        {[0,1,2,3,4,5].map((index) => (
                           <InputOTP.Slot key={index} index={index} />
                        ))}
                      </InputOTP.Group>
                    </InputOTP>
                    {inputError && <span className="text-sm text-red-500">{inputError}</span>}

                    {isValidating && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xác thực...</span>
                      </div>
                    )}

                    {isValid && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <ShieldCheck size={16} />
                        <span>Mã hợp lệ</span>
                      </div>
                    )}

                    {verificationType === 'otp' && !isValid && !isValidating && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-primary"
                        onPress={handleSendOtp}
                      >
                        Gửi lại mã
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="ghost"
                onPress={() => {
                  if (step === 'verification') {
                    setStep('reason')
                    setInputValue('')
                    setInputError('')
                    setIsValid(false)
                  } else {
                    onClose()
                  }
                }}
                isDisabled={isLoading || isValidating}
              >
                {step === 'verification' ? 'Quay lại' : 'Hủy'}
              </Button>
              <Button
                className={isReject ? 'bg-danger text-white' : 'bg-primary text-white'}
                onPress={step === 'verification' ? handleSubmit : handleNextStep}
                isDisabled={isLoading || (step === 'verification' && (!isValid || isValidating)) || isValidating}
              >
                {isLoading && <Spinner size="sm" color="current" />}
                {step === 'verification'
                  ? 'Duyệt ngay'
                  : isReject
                    ? 'Từ chối'
                    : verificationType !== 'none'
                      ? 'Tiếp tục'
                      : 'Duyệt ngay'}
              </Button>
            </Modal.Footer>

            <RegisterPinModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
