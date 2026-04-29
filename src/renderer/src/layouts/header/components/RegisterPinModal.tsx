import { Button, Modal, InputOTP, REGEXP_ONLY_DIGITS, toast } from '@heroui-v3/react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { userAxios } from '@renderer/api/auth/userAxios'
import { useAuthStore } from '@renderer/store/useAuthStore'

interface RegisterPinModalProps {
  isOpen: boolean
  onClose: () => void
}

interface RegisterPinForm {
  pin_code: string
  confirm_pin_code: string
}

export default function RegisterPinModal({ isOpen, onClose }: RegisterPinModalProps) {
  const { user, setUser } = useAuthStore()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterPinForm>({
    defaultValues: {
      pin_code: '',
      confirm_pin_code: ''
    }
  })

  const mutation = useMutation({
    mutationFn: (pin: string) => userAxios.registerPin(pin),
    onSuccess: (res: any) => {
      if (res?.success) {
        // Cập nhật trạng thái user ngay lập tức trong store
        if (user) {
          setUser({
            ...user,
            has_pin: 2,
            pin_is_valid: 0
          })
        }

        toast('Thành công', { description: res?.message || 'Đăng ký mã PIN thành công. Đang gửi email xác thực...', variant: 'success' })

        reset()
        onClose()

        // Gửi mail xác thực (chạy ngầm, không đợi)
        const pinId = res?.data?.id_ql_nguoi_dung_pin_code || res?.data
        if (pinId) {
          userAxios.sendPinCodeApprovalEmail(pinId).catch((error) => {
            console.error('Lỗi gửi email xác thực:', error)
          })
        }
      } else {
        toast('Lỗi', { description: res?.message || 'Có lỗi xảy ra khi đăng ký mã PIN', variant: 'danger' })
      }
    },
    onError: (error: any) => {
      console.error('Register PIN error:', error)
      toast('Lỗi', { description: error?.response?.data?.message || 'Có lỗi xảy ra khi đăng ký mã PIN', variant: 'danger' })
    }
  })

  const onSubmit = (data: RegisterPinForm) => {
    if (data.pin_code.length !== 6) {
      toast('Lỗi', { description: 'Vui lòng nhập đủ 6 chữ số mã PIN', variant: 'danger' })
      return
    }

    if (data.pin_code !== data.confirm_pin_code) {
      toast('Lỗi', { description: 'Mã PIN xác nhận không khớp', variant: 'danger' })
      return
    }
    mutation.mutate(data.pin_code)
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          reset()
          onClose()
        }
      }}
    >
      <Modal.Container size="md" placement="center">
        <Modal.Dialog className="dark:bg-gray-900 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center dark:bg-blue-500/10">
                <KeyRound size={18} className="text-blue-500" />
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                Đăng ký mã PIN
              </span>
            </Modal.Header>
            <Modal.Body className="py-6 space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/20 flex gap-3 hidden">
                <ShieldCheck className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Mã PIN giúp tăng cường bảo mật cho tài khoản của bạn. Sau khi đăng ký, bạn{' '}
                  <u className="font-medium text-blue-800 dark:text-blue-200">
                    cần xác thực qua email
                  </u>{' '}
                  được gửi tới hộp thư của bạn. Mã PIN phải bao gồm **đúng 6 chữ số**.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mã PIN mới
                  </span>
                  <Controller
                    name="pin_code"
                    control={control}
                    rules={{
                      required: 'Vui lòng nhập mã PIN',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Mã PIN phải là 6 chữ số'
                      }
                    }}
                    render={({ field }) => (
                      <div className="flex flex-col items-center gap-2">
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          value={field.value}
                          onChange={field.onChange}
                          isInvalid={!!errors.pin_code}
                        >
                          <InputOTP.Group>
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={0} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={1} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={2} />
                          </InputOTP.Group>
                          <InputOTP.Separator />
                          <InputOTP.Group>
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={3} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={4} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={5} />
                          </InputOTP.Group>
                        </InputOTP>
                        {errors.pin_code?.message && (
                          <span className="text-xs text-red-500">{errors.pin_code.message}</span>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Xác nhận mã PIN
                  </span>
                  <Controller
                    name="confirm_pin_code"
                    control={control}
                    rules={{
                      required: 'Vui lòng xác nhận mã PIN',
                      validate: (value, values) => value === values.pin_code || 'Mã PIN không khớp'
                    }}
                    render={({ field }) => (
                      <div className="flex flex-col items-center gap-2">
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          value={field.value}
                          onChange={field.onChange}
                          isInvalid={!!errors.confirm_pin_code}
                        >
                          <InputOTP.Group>
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={0} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={1} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={2} />
                          </InputOTP.Group>
                          <InputOTP.Separator />
                          <InputOTP.Group>
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={3} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={4} />
                            <InputOTP.Slot className="text-2xl font-bold [-webkit-text-security:disc]" index={5} />
                          </InputOTP.Group>
                        </InputOTP>
                        {errors.confirm_pin_code?.message && (
                          <span className="text-xs text-red-500">
                            {errors.confirm_pin_code.message}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" slot="close" onPress={onClose} className="font-medium">
                Hủy
              </Button>
              <Button type="submit" isPending={mutation.isPending} variant="primary">
                Đăng ký ngay
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
