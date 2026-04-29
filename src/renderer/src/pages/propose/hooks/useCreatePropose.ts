import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { toast } from "@heroui-v3/react";

export interface ApproverUnit {
  id_don_vi: number | string
  nguoi_duyet: (number | string)[]
}

interface CreateProposePayload {
  tieu_de: string
  noi_dung: string
  do_uu_tien: 'low' | 'medium' | 'high'
  loai_de_xuat: string
  id_nguoi_soan: string | number
  id_nguoi_de_xuat: string | number
  file_dinh_kem: File[]
  thong_tin_them?: string // Dùng cho email lẻ hoặc thông tin bổ sung
  danh_sach_don_vi: ApproverUnit[]
  ids_don_vi?: string[] // Trường phụ để đồng bộ UI
  trang_thai?: string // dang_xu_ly, nhap
}

interface useCreateProposeProps {
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
  editingData?: any
}

export function useCreatePropose({ onSuccess, onOpenChange, editingData }: useCreateProposeProps) {
  const [loadingType, setLoadingType] = useState<'send' | 'draft' | null>(null)

  const form = useForm<CreateProposePayload>({
    defaultValues: {
      tieu_de: editingData?.tieu_de || '',
      noi_dung: editingData?.noi_dung || '',
      do_uu_tien: editingData?.do_uu_tien || 'low',
      loai_de_xuat: editingData?.loai_de_xuat || (editingData?.id_dx_loai_de_xuat ? String(editingData.id_dx_loai_de_xuat) : ''),
      id_nguoi_soan: editingData?.id_nguoi_soan || '',
      id_nguoi_de_xuat: editingData?.id_nguoi_de_xuat || '',
      file_dinh_kem: [],
      thong_tin_them: editingData?.thong_tin_them || '',
      danh_sach_don_vi: editingData?.danh_sach_don_vi || [],
      trang_thai: editingData?.trang_thai || 'dang_xu_ly'
    }
  })

  // Reset form when editingData changes
  useEffect(() => {
    if (editingData) {
      form.reset({
        tieu_de: editingData.tieu_de || '',
        noi_dung: editingData.noi_dung || '',
        do_uu_tien: editingData.do_uu_tien || 'low',
        loai_de_xuat: editingData.loai_de_xuat || (editingData.id_dx_loai_de_xuat ? String(editingData.id_dx_loai_de_xuat) : ''),
        id_nguoi_soan: editingData.id_nguoi_soan || '',
        id_nguoi_de_xuat: editingData.id_nguoi_de_xuat || '',
        file_dinh_kem: [],
        thong_tin_them: editingData.thong_tin_them || '',
        danh_sach_don_vi: editingData.danh_sach_don_vi || [],
        trang_thai: editingData.trang_thai || 'dang_xu_ly'
      }, { keepDefaultValues: false })
    }
  }, [editingData, form])

  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([])

  const handleRemoveExistingFile = (fileId: string) => {
    setDeletedFileIds(prev => [...prev, fileId])
  }

  const handleCreate = async (
    selectedRecipients: any[],
    status: string = 'dang_xu_ly',
    isUnitRequired: boolean = false
  ) => {
    const isValid = await form.trigger()
    if (!isValid) return

    setLoadingType(status === 'nhap' ? 'draft' : 'send')
    try {
      const formValues = form.getValues()

      // Basic validation for final submission
      if (status !== 'nhap') {
        if (!formValues.tieu_de?.trim()) {
          toast('Thông báo', { description: 'Vui lòng nhập tiêu đề đề xuất', variant: 'warning' })
          setLoadingType(null)
          return
        }

        if (!formValues.loai_de_xuat) {
          toast('Thông báo', { description: 'Vui lòng chọn loại đề xuất', variant: 'warning' })
          setLoadingType(null)
          return
        }

      } else {
        // For draft, still check if title exists to identify it later
        if (!formValues.tieu_de?.trim()) {
          toast('Thông báo', { description: 'Vui lòng nhập tiêu đề để có thể lưu nháp', variant: 'warning' })
          setLoadingType(null)
          return
        }
      }

      // Validation: If units are required and this is not a draft, ensure at least one unit is selected
      if (status !== 'nhap' && isUnitRequired && (!selectedRecipients || selectedRecipients.length === 0)) {
        toast('Thông báo', { description: 'Vui lòng chọn ít nhất một đơn vị phối hợp hoặc vị trí trình ký còn trống', variant: 'warning' })
        setLoadingType(null)
        return
      }

      const unitMap = new Map<number, (string | number)[]>()
      const customLevelUnits: any[] = []

      const extractIds = (signers: any[]) => {
        if (!signers) return []
        return signers.map(s => {
          if (typeof s === 'object' && s !== null) {
            return String(s.ql_nguoi_dung_id || s.id || '')
          }
          return String(s)
        }).filter(id => id !== '')
      }

      selectedRecipients.forEach((rec) => {
        const unitIdVal =
          rec.id_don_vi_cong_tac ||
          rec.unitId ||
          rec.id_don_vi ||
          (rec.type === 'unit' ? rec.id : null)
        const unitId = Number(unitIdVal)
        const hasLevel = rec.level !== undefined && rec.level !== null

        if (!isNaN(unitId) && unitId > 0) {
          if (hasLevel) {
            customLevelUnits.push({
              id_don_vi: unitId,
              cap: Number(rec.level),
              ids_nguoi_duyet: extractIds(rec.specificSigners)
            })
          } else {
            // General recipients (Coordination)
            if (!unitMap.has(unitId)) {
              unitMap.set(unitId, [])
            }

            if (rec.type === 'person') {
              const personId = String(rec.id)
              if (personId) {
                const list = unitMap.get(unitId)
                if (list && !list.includes(personId)) {
                  list.push(personId)
                }
              }
            } else if (rec.specificSigners && rec.specificSigners.length > 0) {
              const list = unitMap.get(unitId)
              if (list) {
                const signerIds = extractIds(rec.specificSigners)
                signerIds.forEach((sid: string) => {
                  if (sid && !list.includes(sid)) {
                    list.push(sid)
                  }
                })
              }
            }
          }
        }
      })

      // Validation: After processing, check if we actually have units to send if required
      const final_danh_sach_pre = [
        ...Array.from(unitMap.keys()),
        ...customLevelUnits.map(u => u.id_don_vi)
      ]

      if (status !== 'nhap' && isUnitRequired && final_danh_sach_pre.length === 0) {
        toast('Thông báo', { description: 'Vui lòng chọn đơn vị tiếp nhận', variant: 'warning' })
        setLoadingType(null)
        return
      }

      const coordination_units = Array.from(unitMap.entries()).map(([unitId, peopleIds]) => ({
        id_don_vi: unitId,
        ids_nguoi_duyet: peopleIds
      }))

      // Combine with custom level units
      const final_danh_sach = [...coordination_units, ...customLevelUnits].sort((a: any, b: any) => {
        const capA = a.cap || 999
        const capB = b.cap || 999
        return capA - capB
      })

      // Sử dụng FormData để gửi file
      const formData = new FormData()
      formData.append('tieu_de', formValues.tieu_de)
      formData.append('noi_dung', formValues.noi_dung)
      formData.append('id_dx_loai_de_xuat', formValues.loai_de_xuat)
      formData.append('id_nguoi_soan', String(formValues.id_nguoi_soan))
      formData.append('id_nguoi_de_xuat', String(formValues.id_nguoi_de_xuat))
      // formData.append('do_uu_tien', formValues.do_uu_tien)
      formData.append('trang_thai', status)

      // Gửi danh sách ID file cần xóa
      if (deletedFileIds.length > 0) {
        formData.append('deleted_file_ids', JSON.stringify(deletedFileIds))
      }

      const nhap = status === 'nhap' ? 1 : 0
      formData.append('nhap', String(nhap))

      if (final_danh_sach.length > 0) {
        // Đảm bảo tất cả các đơn vị đều có 'cap'. 
        // Nếu là đơn vị phối hợp (không có cap), ta gắn cap lớn (ví dụ 99) 
        // hoặc gán theo thứ tự để backend update_post xử lý Key chính xác.
        const danhSachCoCap = final_danh_sach.map((u, index) => ({
          ...u,
          cap: u.cap || (u.level ? Number(u.level) : (index + 1))
        }))
        formData.append('danh_sach_don_vi', JSON.stringify(danhSachCoCap))
      }

      if (formValues.file_dinh_kem && formValues.file_dinh_kem.length > 0) {
        formValues.file_dinh_kem.forEach((file) => {
          formData.append('file_dinh_kem[]', file)
        })
      }

      // DEBUG: Log dữ liệu gửi đi
      console.log('--- DỮ LIỆU GỬI ĐI (DEBUG) ---')
      const debugData: any = {}
      formData.forEach((value, key) => {
        if (key === 'danh_sach_don_vi') {
          debugData[key] = JSON.parse(value as string)
        } else if (key === 'file_dinh_kem[]') {
          if (!debugData[key]) debugData[key] = []
          debugData[key].push((value as File).name)
        } else {
          debugData[key] = value
        }
      })
      console.log('Payload Object:', debugData)
      console.log('Final Signing Sequence:', final_danh_sach)
      console.log('------------------------------')
      // return;
      let res: any
      if (editingData?.id_de_xuat) {
        res = await dexuatAxios.update(editingData.id_de_xuat, formData)
      } else {
        res = await dexuatAxios.create(formData)
      }

      if (res?.status === false || res?.success === false) {
        toast('Thông báo', { description: res?.message || 'Có lỗi xảy ra', variant: 'danger' })
        setLoadingType(null)
        return
      }

      toast(editingData ? 'Cập nhật đề xuất thành công' : 'Gửi đề xuất thành công', { variant: 'success' })

      // Fire-and-forget: gửi email thông báo cho người liên quan
      const idDeXuat = res?.data?.id_de_xuat ?? editingData?.id_de_xuat
      const shouldSendEmail = res?.data?.should_send_email ?? (status === 'dang_xu_ly')
      if (idDeXuat && shouldSendEmail) {
        dexuatAxios.sendEmail(idDeXuat).catch((err) => {
          console.warn('[sendEmail] Lỗi gửi email đề xuất:', err)
        })
      }

      onSuccess()
      onOpenChange(false)
      form.reset()
      setDeletedFileIds([])

    } catch (error) {
      console.error('Error creating propose:', error)
      toast('Có lỗi xảy ra', { variant: 'danger' })
    } finally {
      setLoadingType(null)
    }
  }

  return {
    form,
    handleCreate,
    handleRemoveExistingFile,
    deletedFileIds,
    isLoadingSend: loadingType === 'send',
    isLoadingDraft: loadingType === 'draft'
  }
}
