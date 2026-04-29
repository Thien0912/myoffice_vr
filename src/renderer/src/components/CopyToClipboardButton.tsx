import React, { useCallback } from 'react'
// ?? IMPORT CHU?N XÁC THEO YÊU C?U
import { Button, ButtonProps } from '@heroui/react'
import { Copy } from 'lucide-react'
import { toast } from "@heroui-v3/react";

// --- INTERFACE VÀ TYPES ---

interface CopyButtonProps extends Omit<ButtonProps, 'onPress'> {
  /** N?i dung TEXT mu?n sao chép (text/plain). */
  textToCopy?: string
  /** File mu?n sao chép (File/Blob object dã có s?n). */
  fileToCopy?: File | Blob
  /** Ðu?ng d?n URL c?a file c?n t?i v? d? sao chép. */
  fileUrl?: string
  /** Thông báo khi copy thành công. */
  successMessage?: string
  /** Icon hi?n th? trên nút. */
  icon?: React.ReactNode
}

// --- HÀM UTILITY X? LÝ CLIPBOARD ---

/**
 * T?i file t? URL và tr? v? Blob
 * @param url - Ðu?ng d?n file c?n t?i
 * @returns Blob ho?c null n?u có l?i
 */
const fetchFileAsBlob = async (url: string): Promise<Blob | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.blob()
  } catch (error) {
    console.error('L?i t?i file:', error)
    toast('L?i t?i file', { description: 'Không th? t?i n?i dung file. Vui lòng th? l?i.', variant: 'danger' })
    return null
  }
}

/**
 * L?y tên file t? URL
 * @param url - Ðu?ng d?n file
 * @returns Tên file ho?c tên m?c d?nh
 */
const getFileNameFromUrl = (url: string): string => {
  const parts = url.split('/')
  return parts[parts.length - 1] || 'file.dat'
}

// --- COMPONENT CHÍNH ---

export const CopyToClipboardButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  fileToCopy,
  fileUrl,
  successMessage = 'Ðã sao chép thành công!',
  icon = <Copy size={14} />,
  children,
  ...rest
}) => {
  // KHÔNG C?N G?I const { toast } = useToast(); n?a.

  const handleCopy = useCallback(async () => {
    try {
      // Ki?m tra h? tr? API Clipboard
      if (!navigator.clipboard) {
        toast('L?i', { description: 'Trình duy?t không h? tr? ch?c nang sao chép.', variant: 'danger' })
        return
      }

      // 1. X? LÝ COPY TEXT ÐON GI?N (không có file)
      if (!fileUrl && !fileToCopy && textToCopy) {
        await navigator.clipboard.writeText(textToCopy)
        toast('Sao chép thành công', { description: successMessage, variant: 'success' })
        return
      }

      // 2. KI?M TRA H? TR? CLIPBOARD ITEM (cho file)
      if (!('ClipboardItem' in window)) {
        // Fallback: N?u không h? tr? file, ch? copy text
        if (textToCopy) {
          await navigator.clipboard.writeText(textToCopy)
          toast('Ðã sao chép text', { description: 'Trình duy?t không h? tr? sao chép file. Ch? sao chép text.', variant: 'warning' })
          return
        }
        toast('L?i', { description: 'Trình duy?t không h? tr? sao chép file.', variant: 'danger' })
        return
      }

      // 3. CHU?N B? FILE BLOB
      let fileBlob: Blob | null = fileToCopy || null
      let fileName = ''

      if (fileUrl && !fileBlob) {
        fileBlob = await fetchFileAsBlob(fileUrl)
        if (!fileBlob) return // L?i dã du?c x? lý trong fetchFileAsBlob
        fileName = getFileNameFromUrl(fileUrl)
      } else if (fileBlob) {
        fileName = fileBlob instanceof File ? fileBlob.name : 'file.dat'
      }

      // 4. T?O VÀ SAO CHÉP CLIPBOARD ITEM (t?i uu cho Gmail)
      if (fileBlob) {
        // ? T?o ClipboardItem v?i nhi?u format d? tuong thích Gmail
        const clipboardData: Record<string, Blob> = {
          [fileBlob.type]: fileBlob
        }

        // Thêm HTML representation v?i tên file (giúp Gmail nh?n di?n t?t hon)
        const htmlContent = `<p>${fileName}</p>`
        clipboardData['text/html'] = new Blob([htmlContent], { type: 'text/html' })

        const clipboardItem = new ClipboardItem(clipboardData)

        await navigator.clipboard.write([clipboardItem])

        toast('Sao chép thành công', { description: `Ðã sao chép file "${fileName}". Có th? paste vào Gmail (Ctrl+V).`, variant: 'success' })
      } else if (textToCopy) {
        // Fallback: ch? copy text n?u không có file
        await navigator.clipboard.writeText(textToCopy)
        toast('Sao chép thành công', { description: successMessage, variant: 'success' })
      } else {
        toast('Thông báo', { description: 'Không có n?i dung d? sao chép.', variant: 'warning' })
      }
    } catch (error) {
      console.error('L?i sao chép:', error)

      // X? lý l?i c? th?
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('permission')) {
        toast('L?i quy?n truy c?p', { description: 'Vui lòng cho phép quy?n truy c?p clipboard trong trình duy?t.', variant: 'danger' })
      } else if (errorMessage.includes('NotSupportedError')) {
        toast('Không h? tr?', { description: 'Lo?i file này không du?c h? tr? d? sao chép.', variant: 'warning' })
      } else {
        toast('L?i sao chép', { description: 'Không th? sao chép. Vui lòng th? l?i ho?c s? d?ng t?i xu?ng.', variant: 'danger' })
      }
    }
  }, [textToCopy, fileToCopy, fileUrl, successMessage])

  return (
    <Button
      isIconOnly={!children}
      startContent={icon}
      onPress={handleCopy}
      {...rest}
      disabled={rest.disabled}
    >
      {children}
    </Button>
  )
}
