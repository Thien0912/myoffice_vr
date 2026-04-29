import { Button, Input } from '@heroui/react'
import { Send, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { toast } from "@heroui-v3/react";

type ProposeCommentInputProps = {
  idDeXuat: string
  parentId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  isReply?: boolean
}

export default function ProposeCommentInput({ 
  idDeXuat, 
  parentId, 
  onSuccess, 
  onCancel,
  placeholder = 'Enter your reply...',
  autoFocus = false,
  isReply = false
}: ProposeCommentInputProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!value.trim() || !idDeXuat) return

    setLoading(true)
    try {
      const res = await dexuatAxios.submitBinhLuan({
        id_de_xuat: idDeXuat,
        parent_id: parentId,
        noi_dung: value
      })
      if (res.success || res.status) {
        toast('Thành công', { description: 'Gửi thảo luận thành công', variant: 'success' })
        setValue('')
        onSuccess?.()
      } else {
        toast('Thất bại', { description: res.message || 'Gửi thảo luận thất bại', variant: 'danger' })
      }
    } catch (error) {
      console.error(error)
      toast('Lỗi', { description: 'Có lỗi xảy ra khi gửi thảo luận', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className={`relative flex items-center bg-[#f8f9fa] dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 p-2 gap-2 shadow-sm ${autoFocus ? 'ring-2 ring-blue-500/20 border-blue-200' : ''}`}>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && value.trim() !== '') {
              handleSubmit()
            }
            if (e.key === 'Escape' && onCancel) {
              onCancel()
            }
          }}
          isDisabled={loading}
          size="sm"
          variant="flat"
          radius="none"
          classNames={{
            base: 'w-full',
            mainWrapper: 'h-auto',
            inputWrapper: 'bg-transparent dark:bg-transparent shadow-none px-2 h-10 border-none transition-none group-data-[focus=true]:bg-transparent',
            input: 'text-[14px] text-gray-700 dark:text-gray-200 placeholder:text-gray-400 font-medium'
          }}
        />
        
        <div className="flex items-center gap-1 shrink-0 px-1">
          {onCancel && (
            <Button
              variant="light"
              size="sm"
              onPress={onCancel}
              className="text-gray-400 min-w-0 h-8 font-bold"
            >
              Hủy
            </Button>
          )}
          <Button isIconOnly variant="light" size="sm" className="text-gray-400 min-w-0 w-8 h-8 hover:bg-white dark:hover:bg-gray-700 transition-colors">
            <Paperclip size={18} className="rotate-[-45deg]" />
          </Button>
          <Button
            isIconOnly
            variant="solid"
            size="sm"
            color={value.trim() !== '' ? 'primary' : 'default'}
            isLoading={loading}
            onPress={handleSubmit}
            isDisabled={value.trim() === '' || loading}
            className={`min-w-0 w-8 h-8 rounded-lg shadow-sm ${value.trim() !== '' ? 'bg-blue-600' : 'bg-gray-200 text-gray-400'}`}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
