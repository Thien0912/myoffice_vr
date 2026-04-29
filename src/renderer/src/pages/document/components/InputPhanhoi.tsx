import { Button, TextField, InputGroup } from '@heroui-v3/react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { vanbandendonviAxios } from '@renderer/api/documents/vanbandendonviAxios'
import { addToast } from '@heroui/toast'
import { toast } from '@heroui-v3/react'

type InputPhanhoiProps = Omit<React.ComponentProps<typeof TextField>, 'value' | 'onChange'> & {
  vanban?: any
  onSuccess?: (data?: any) => void
}

export default function InputPhanhoi({ vanban, onSuccess, ...props }: InputPhanhoiProps) {
  const { user } = useAuthStore()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestions = [
    user?.ten_don_vi + ' đã nhận được văn bản.',
    user?.ten_don_vi + ' đã nhận được thông tin.',
    'Đã nhận thông tin văn bản'
  ]

  const handleSubmit = async () => {
    if (!value.trim() || !vanban?.id_van_ban) return

    setLoading(true)
    try {
      const res = await vanbandendonviAxios.submitFeedback(vanban.id_van_ban, {
        noi_dung: value,
        trang_thai: 'DA_PHAN_HOI'
      })
      if (res.success) {
        toast('Thành công', {
          description: 'Gửi phản hồi thành công',
          variant: 'success'
        })
        setValue('')
        onSuccess?.(res)
      } else {
        toast('Thất bại', {
          description: res.message || 'Gửi phản hồi thất bại',
          variant: 'danger'
        })
      }
    } catch (error) {
      console.error(error)
      toast('Lỗi', {
        description: 'Có lỗi xảy ra khi gửi phản hồi',
        variant: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <TextField
          aria-label="Nội dung phản hồi"
          value={value}
          onChange={(val) => setValue(val)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && value.trim() !== '') {
              handleSubmit()
            }
          }}
          isDisabled={loading}
          className="w-full"
          {...props}
        >
          <InputGroup>
            <InputGroup.Input
              placeholder="Nội dung phản hồi"
              list="datalist-options"
            />
          </InputGroup>
        </TextField>
        <datalist id="datalist-options">
          {suggestions.map((item, i) => (
            <option key={i} value={item} />
          ))}
        </datalist>
      </div>

      <Button
        isIconOnly
        variant="primary"
        className="rounded-sm"
        isPending={loading}
        onPress={handleSubmit}
        isDisabled={value.trim() === '' || loading}
      >
        <Send className={loading ? 'hidden' : ''} />
      </Button>
    </div>
  )
}
