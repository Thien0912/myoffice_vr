import { useState } from 'react'
import {
  DrawerCustom,
  DrawerHeaderCustom,
  DrawerFooterCustom,
  DrawerContentCustom
} from './DrawerCustom'
import { Button, Tooltip } from '@heroui/react'
import { ChevronsRight } from 'lucide-react'
import { toast } from '@heroui-v3/react'

type DrawerPosition = 'left' | 'right' | 'bottom'

type DrawerCommonProps = {
  open?: boolean
  onClose: () => void
  position?: DrawerPosition
  title?: string
  children?: React.ReactNode
  handleSubmitApi?: (id?: string | number, data?: FormData) => Promise<any>
  formData?: Record<string, any>
  fileGroups?: Record<string, File[]>
  idSubmitApi?: string | number
  onSubmitSuccess?: (data?: any) => void
  zIndex?: number
  usePortal?: boolean
}

const MIN_WIDTH = 570
const MAX_WIDTH_RATIO = 0.828

export function DrawerCommon({
  title = 'Drawer',
  open = true,
  position = 'right',
  onClose,
  children,
  handleSubmitApi,
  formData,
  fileGroups = {},
  idSubmitApi,
  onSubmitSuccess,
  zIndex,
  usePortal = true
}: DrawerCommonProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)

    // 1️⃣ Append files
    Object.entries(fileGroups).forEach(([fieldName, files]) => {
      files.forEach((f) => fd.append(fieldName, f))
    })

    // 2️⃣ Append formData
    Object.entries(formData ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) || typeof value === 'object') {
          fd.append(key, JSON.stringify(value))
        } else {
          fd.append(key, String(value))
        }
      }
    })

    try {
      if (handleSubmitApi) {
        const response = await handleSubmitApi(idSubmitApi, fd)
        if (response.success) {
          onClose()
          toast('Thành công', {
            description: response.message || 'Dữ liệu đã được lưu thành công.',
            variant: 'success'
          })
          onSubmitSuccess?.(response)
        } else {
          const errorMessage = Object.values(response.error).flat().join(',')
          toast('Lỗi', {
            description: errorMessage || 'Gửi dữ liệu thất bại. Vui lòng thử lại.',
            variant: 'danger',
            timeout: 5000
          })
        }
      }
    } catch (err) {
      toast('Lỗi', { description: 'Gửi dữ liệu thất bại. Lỗi ngoại lệ.', variant: 'danger' })
    }
  }

  return (
    <DrawerCustom open={open} onClose={onClose} position={position} zIndex={zIndex ?? 9999} usePortal={usePortal}>
      <DrawerHeaderCustom title={title} onClose={onClose}>
        <div className="flex items-center gap-2 py-2 w-full">
          <Tooltip
            content="Đóng"
            className="capitalize bg-slate-100"
            radius="none"
            placement="left"
          >
            <Button
              isIconOnly
              startContent={<ChevronsRight size={18} />}
              size="sm"
              variant="light"
              onPress={onClose}
            />
          </Tooltip>
          <span className="font-semibold text-[17px] text-gray-800 dark:text-gray-200">
            {title}
          </span>
        </div>
      </DrawerHeaderCustom>

      <DrawerContentCustom>{children}</DrawerContentCustom>

      <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off">
        <DrawerFooterCustom>
          <Button color="default" variant="light" onPress={onClose}>
            Hủy
          </Button>
          <Button color="primary" type="submit">
            Lưu
          </Button>
        </DrawerFooterCustom>
      </form>
    </DrawerCustom>
  )
}


