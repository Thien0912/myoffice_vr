import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Button,
  Skeleton
} from '@heroui/react'
import { UserAvatarVertical, UserAvatar } from '@renderer/components/UserAvatar'
import { FormProvider, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useCreatePropose } from '../hooks/useCreatePropose'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { RichTextEditor } from '@renderer/components/RichTextEditor'
import DraggableModal from '@renderer/components/DraggableModal'
import { FilePreviewModal } from '@renderer/components/FilePreviewModal'
import FileUploadSimple from './FileUploadSimple'
import { mapNhanSuCungDonviOptions } from '@renderer/api/danhmuc/nhansuAxios'
import { date } from '@renderer/utils/formatDate'

import { X, Plus, Info, GripVertical, Eye, Settings } from 'lucide-react'

import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import SelectRecipientsModal from './SelectRecipientsModal'
import SelectUsersModal from './SelectUsersModal'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { SignerTag } from './SignerTag'
import WorkflowPreviewModal from './WorkflowPreviewModal'
import { useAuthStore } from '@renderer/store/useAuthStore'
import ProposeWorkflowTimeline from './ProposeWorkflowTimeline'

interface CreateProposeModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editingData?: any
  viewingData?: any
  onMinimize?: () => void
}


export default function CreateProposeModal({
  isOpen,
  onOpenChange,
  onSuccess,
  editingData,
  viewingData,
  onMinimize
}: CreateProposeModalProps) {
  const isViewOnly = !!viewingData
  const activeData = viewingData || editingData
  
  const { form, handleCreate, handleRemoveExistingFile, deletedFileIds, isLoadingSend, isLoadingDraft } = useCreatePropose({
    onSuccess,
    onOpenChange,
    editingData: activeData
  })

  const isAnyLoading = isLoadingSend || isLoadingDraft

  // State for selected recipients (both People and Units)
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([])
  const lastLoadedTypeId = useRef<string | null>(null)
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null)
  const [selectingLevel, setSelectingLevel] = useState<number | null>(null)
  const [selectingSignersInfo, setSelectingSignersInfo] = useState<{ 
      level: number; 
      unitId: string | number; 
      unitName: string;
      initialSelected: any[];
  } | null>(null)
  const [levelToDelete, setLevelToDelete] = useState<number | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isSidebarPreview, setIsSidebarPreview] = useState(false)

  const watchedFiles = form.watch('file_dinh_kem')

  // Sync state to form
  useEffect(() => {
    // 2. IDs for units
    const unitIds = selectedRecipients
        .filter(r => r.type === 'unit')
        .map(r => String(r.id))
    form.setValue('ids_don_vi', unitIds)
  }, [selectedRecipients, form])



  // Fetch Units
  const { data: unitOptions = [] } = useQuery({
    queryKey: ['propose-unit-options'],
    queryFn: async () => {
        try {
            const res = await DonviAxios.fetch({ length: 999 })
            if (!res?.success) return []
            
            const items = Array.isArray(res.data) 
                ? res.data 
                : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : [])

            return items.map((item: any) => ({
                id: item.id_don_vi,
                name: item.ten_don_vi,
                email: item.email || '',
                code: item.ma_don_vi || ''
            }))
        } catch (err) {
            console.error(err)
            return []
        }
    },
    staleTime: 30 * 60 * 1000,
    enabled: isOpen
  })



  // Initialize from form data
  useEffect(() => {
    if (!isOpen || unitOptions.length === 0) return

    if (activeData?.danh_sach_don_vi) {
        // Format used when creating/drafting - Group by unitId and level
        const initialGrouped = activeData.danh_sach_don_vi.reduce((acc: any, item: any) => {
            const unitId = item.id_don_vi
            const level = Number(item.cap || item.thu_tu_trinh_ky)
            const key = `${unitId}_${level}`
            
            if (!acc[key]) {
                const unit = unitOptions.find((u: any) => String(u.id) === String(unitId))
                acc[key] = {
                    ...unit,
                    id: unitId,
                    name: unit?.name || item.ten_don_vi || `Đơn vị ${unitId}`,
                    type: 'unit',
                    level: level,
                    specificSigners: []
                }
            }
            
            // Add signers and filter out nulls
            if (Array.isArray(item.nguoi_duyet)) {
                const validSigners = item.nguoi_duyet.filter((s:any) => s && (s.ql_nguoi_dung_id || s.id))
                acc[key].specificSigners.push(...validSigners)
            }
            
            return acc
        }, {})
        
        const recipients = Object.values(initialGrouped)
        setSelectedRecipients(recipients)
        // Sync lastLoadedTypeId để useEffect xóa quy trình không bắn lại ngay sau đó
        lastLoadedTypeId.current = activeData.loai_de_xuat || (activeData.id_dx_loai_de_xuat ? String(activeData.id_dx_loai_de_xuat) : null)
    } else if (activeData?.nguoi_duyet) {
        // Format from Proposal Detail API
        const grouped = activeData.nguoi_duyet.reduce((acc: any, curr: any) => {
            const unitId = curr.id_don_vi;
            const level = Number(curr.cap_duyet);
            const key = `${unitId}_${level}`;
            
            if (!acc[key]) {
                const unit = unitOptions.find((u: any) => String(u.id) === String(unitId))
                acc[key] = {
                    ...unit,
                    id: unitId,
                    name: unit?.name || curr.ten_don_vi || `Đơn vị ${unitId}`,
                    type: 'unit',
                    level: level,
                    specificSigners: []
                };
            }
            
            if (curr.id_nguoi_duyet) {
                acc[key].specificSigners.push({
                    ql_nguoi_dung_id: curr.id_nguoi_duyet,
                    ql_nguoi_dung_ho_ten: curr.ten_nguoi_duyet,
                    avatar: curr.avatar,
                    ten_don_vi: curr.ten_don_vi,
                    id_don_vi: curr.id_don_vi
                });
            }
            return acc;
        }, {});
        
        const recipients = Object.values(grouped)
        setSelectedRecipients(recipients);
        // Sync lastLoadedTypeId để useEffect xóa quy trình không bắn lại ngay sau đó
        lastLoadedTypeId.current = activeData.loai_de_xuat || (activeData.id_dx_loai_de_xuat ? String(activeData.id_dx_loai_de_xuat) : null)
    } else {
        const currentUnitIds = form.getValues('ids_don_vi')
        const initial: any[] = []

        if (currentUnitIds && currentUnitIds.length > 0) {
            currentUnitIds.forEach((id: string) => {
                const unit = unitOptions.find((u: any) => String(u.id) === id)
                if (unit) initial.push({ ...unit, type: 'unit' })
            })
        }
        setSelectedRecipients(initial)
    }
  }, [isOpen, unitOptions, activeData])

  const title = isViewOnly
    ? 'Chi tiết đề xuất'
    : editingData
      ? 'Chỉnh sửa đề xuất'
      : 'Soạn đề xuất'


  // Fetch Loại đề xuất from API
  const { data: loaiDeXuatData = [], isLoading: isLoadingLoaiDeXuat } = useQuery({
    queryKey: ['loai-de-xuat'],
    queryFn: async () => {
      try {
        const res = await dexuatAxios.getLoaiDeXuat()
        console.log('API Response:', res)
        
        if (!res?.status) return []
        
        // API trả về data trực tiếp trong res.data
        const items = Array.isArray(res.data) ? res.data : []

        const mapped = items.map((item: any) => ({
          value: String(item.id_dx_loai_de_xuat),
          label: item.ten_loai,
          chon_don_vi: item.chon_don_vi
        }))
        
        console.log('Mapped options:', mapped)
        return mapped
      } catch (err) {
        console.error('Error fetching loai de xuat:', err)
        return []
      }
    },
    staleTime: 0,
    enabled: isOpen
  })

  const typeOptions = loaiDeXuatData 
  const selectedTypeId = form.watch('loai_de_xuat')
  const selectedType = typeOptions.find((t: any) => t.value === selectedTypeId)
  // Nếu chưa chọn loại (selectedType undefined), mặc định hiển thị (hoặc ẩn tùy logic).
  // Yêu cầu: chon_don_vi:1 => hiện, null => ẩn.
  // Nếu chưa chọn loại -> tạm cho hiện hoặc ẩn. Để an toàn (tránh lỗi user không chọn được), mình để hiện nếu chưa chọn, 
  // hoặc ẩn nếu muốn bắt buộc chọn loại trước.
  // Tuy nhiên, logic "nếu null thì ẩn" ám chỉ loại đề xuất CÓ cấu hình này. 
  // Để UX tốt, nên cho hiện khi chưa chọn? Nhưng nếu loại hidden, user lỡ chọn người rồi chọn loại hidden sẽ bị mất?
  // Tốt nhất: Check if selectedType exists. If exists, follow chon_don_vi. If not, maybe show (true).
  const isUnitRequired = selectedType ? String(selectedType.chon_don_vi) === '1' : false
  const { user } = useAuthStore()

  const unitId = user?.id_don_vi || user?.organization_id

  // Fetch Users for Proposer (Same unit, not resigned)
  const { data: allPersonOptions = [], isLoading: isLoadingAllPersons } = useQuery({
    queryKey: ['all-person-options', unitId],
    queryFn: () => mapNhanSuCungDonviOptions(unitId),
    enabled: isOpen && !!unitId,
    staleTime: 30 * 60 * 1000
  })

  // Đảm bảo luôn có tên hiển thị cho người đang đăng nhập và người trong đề xuất cũ (tránh hiển thị ID khi load list)
  const fullPersonOptions = useMemo(() => {
    const list = [...allPersonOptions]
    
    // 1. Thêm người đang đăng nhập nếu thiếu
    if (user?.ql_nguoi_dung_id && !list.find(p => String(p.value) === String(user.ql_nguoi_dung_id))) {
      list.push({
        value: String(user.ql_nguoi_dung_id),
        label: `${user.ql_nguoi_dung_ho_ten} (${user.ma_nhan_vien})`,
        avatar: user.ql_nguoi_dung_avatar,
        ho_va_ten: user.ql_nguoi_dung_ho_ten,
        ma_nhan_vien: user.ma_nhan_vien
      })
    }

    // 2. Thêm người đề xuất từ dữ liệu cũ nếu thiếu (trường hợp cũ chưa mã hóa ql_nguoi_dung_id)
    if (activeData?.id_nguoi_de_xuat && !list.find(p => String(p.value) === String(activeData.id_nguoi_de_xuat))) {
      list.push({
        value: String(activeData.id_nguoi_de_xuat),
        label: `${activeData.nguoi_de_xuat || 'Người đề xuất'}`,
        avatar: activeData.avatar_nguoi_de_xuat,
        ho_va_ten: activeData.nguoi_de_xuat,
        ma_nhan_vien: activeData.ma_nhan_vien_de_xuat
      })
    }
    
    return list
  }, [allPersonOptions, user, activeData])



  const composerInfo = useMemo(() => {
    const composerId = form.watch('id_nguoi_soan')
    const found = fullPersonOptions.find(p => String(p.value) === String(composerId))
    if (found) {
      return {
        name: found.ho_va_ten || found.label,
        avatar: found.avatar,
        ma_nhan_vien: found.ma_nhan_vien
      }
    }
    return {
      name: activeData?.nguoi_tao || user?.ql_nguoi_dung_ho_ten,
      avatar: activeData?.avatar_nguoi_tao || user?.ql_nguoi_dung_avatar,
      ma_nhan_vien: activeData?.ma_nhan_vien_tao || user?.ma_nhan_vien
    }
  }, [fullPersonOptions, form.watch('id_nguoi_soan'), user, activeData])

  // Auto-set default values for new proposals
  useEffect(() => {
    if (isOpen && !activeData) {
      if (user?.ql_nguoi_dung_id) {
        form.setValue('id_nguoi_soan', String(user.ql_nguoi_dung_id))
        form.setValue('id_nguoi_de_xuat', String(user.ql_nguoi_dung_id))
      }
    }
  }, [isOpen, activeData, user, form])

  // Fetch Signing Sequence
  const { data: signingSequence = [], isLoading: isLoadingSigningSequence } = useQuery({
    queryKey: ['signing-sequence', selectedTypeId, user?.id_don_vi],
    queryFn: async () => {
      if (!selectedTypeId) return []
      try {
        const res = await dexuatAxios.fetch({ chon_loai_de_xuat: selectedTypeId })
        const data = res?.data || []
        
        // Define default Cấp 1: Trưởng đơn vị người soạn
        const cap1 = {
          thu_tu_trinh_ky: 1,
          id_don_vi: user?.id_don_vi,
          ten_don_vi: user?.ten_don_vi || 'Đơn vị hiện tại',
          isMissing: false,
          isCap1: true
        }

        // Logic: Nếu đơn vị người soạn đã có trong cấu hình quy trình (ở bất kỳ cấp nào),
        // ta sẽ ưu tiên theo cấu hình đó và không tự động chèn thêm bước Cấp 1 mặc định.
        const isUserUnitInConfig = data.some((d: any) => String(d.id_don_vi) === String(user?.id_don_vi))
        const fullSequence: any[] = isUserUnitInConfig ? [] : [cap1]

        if (data.length > 0) {
          const sortedData = [...data]
            .filter((d) => Number(d.thu_tu_trinh_ky) >= 1)
            .sort((a, b) => Number(a.thu_tu_trinh_ky) - Number(b.thu_tu_trinh_ky))

          const levels = sortedData.map((d) => Number(d.thu_tu_trinh_ky))
          const maxLevel = Math.max(...levels)

          // We check from level 1 up to maxLevel
          for (let i = 1; i <= maxLevel; i++) {
            const existing = sortedData.find((d) => Number(d.thu_tu_trinh_ky) === i)
            if (existing) {
              if (i === 1 && fullSequence.length > 0 && fullSequence[0].thu_tu_trinh_ky === 1) {
                // Nếu config có Cấp 1, nó sẽ ghi đè lên cap1 mặc định (nếu có)
                fullSequence[0] = { ...existing, isMissing: false }
              } else {
                fullSequence.push({ ...existing, isMissing: false })
              }
            } else if (i > 1) {
              // placeholder cho các cấp trống từ 2 trở đi
              fullSequence.push({
                thu_tu_trinh_ky: i,
                ten_don_vi: `Cấp ${i}`,
                isMissing: true
              })
            }
          }
        }

        return fullSequence
      } catch (err) {
        console.error(err)
        return []
      }
    },
    enabled: !!selectedTypeId && isOpen,
    staleTime: 0
  })

  const prevTypeIdRef = useRef<string | null>(null)

  // Tự động xóa quy trình cũ khi TRỰC TIẾP thay đổi Loại đề xuất (Hoạt động cả khi edit)
  useEffect(() => {
    if (!isOpen) {
      prevTypeIdRef.current = null
      return
    }

    if (prevTypeIdRef.current === null) {
      // First initialization in this open session
      prevTypeIdRef.current = selectedTypeId
      return
    }

    // Only wipe if the selectedType ACTUALLY changed during the session (meaning the user changed the dropdown)
    if (selectedTypeId !== prevTypeIdRef.current) {
        prevTypeIdRef.current = selectedTypeId
        setSelectedRecipients(prev => prev.filter(r => !r.level))
        lastLoadedTypeId.current = null // Reset để nạp lại quy trình mới
    }
  }, [selectedTypeId, isOpen])

  // Tự động nạp quy trình mặc định khi có dữ liệu từ query (Hoạt động cả khi edit)
  useEffect(() => {
    if (isOpen && (signingSequence as any[]).length > 0) {
      if (lastLoadedTypeId.current === selectedTypeId) return

      setSelectedRecipients(prev => {
        // Chỉ giữ lại những người/đơn vị không thuộc quy trình ký (phối hợp)
        const nonWorkflow = prev.filter(r => !r.level)
        
        const defaultSteps = (signingSequence as any[])
          .filter((s: any) => !s.isMissing && Number(s.thu_tu_trinh_ky) >= 1)
          .map((s: any) => ({
            id: s.id_don_vi,
            name: s.ten_don_vi,
            type: 'unit',
            level: Number(s.thu_tu_trinh_ky),
            specificSigners: s.lanh_dao_don_vi || []
          }))
          
        return [...nonWorkflow, ...defaultSteps]
      })
      lastLoadedTypeId.current = selectedTypeId
    }
  }, [signingSequence, isOpen, activeData, selectedTypeId])

  // Merge selected units into the sequence for real-time preview (Single Source of Truth)
  const mergedSequence = useMemo(() => {
    // Lấy tất cả các đơn vị có gán level từ selectedRecipients
    const workflowItems = selectedRecipients.filter(r => r.type === 'unit' && Number(r.level) >= 1)
    
    // Gom nhóm theo level
    const levelsMap = workflowItems.reduce((acc: any, curr: any) => {
      const lvl = Number(curr.level)
      if (!acc[lvl]) {
        acc[lvl] = {
          thu_tu_trinh_ky: lvl,
          ten_don_vi: '',
          selectedUnits: [],
          isMissing: false,
          isUserSelected: true
        }
      }
      acc[lvl].selectedUnits.push(curr)
      return acc
    }, {})

    // Chuyển thành mảng và format lại thông tin
    const result = Object.values(levelsMap).map((step: any) => {
      if (step.selectedUnits.length === 1) {
        const unit = step.selectedUnits[0]
        return {
          ...step,
          id_don_vi: unit.id,
          ten_don_vi: unit.name,
          specificSigners: unit.specificSigners
        }
      } else {
        return {
          ...step,
          ten_don_vi: `Cấp ${step.thu_tu_trinh_ky} (${step.selectedUnits.length} đơn vị)`
        }
      }
    })

    return result.sort((a: any, b: any) => Number(a.thu_tu_trinh_ky) - Number(b.thu_tu_trinh_ky))
  }, [selectedRecipients])

  const handleSidebarSelectConfirm = (selectedUnits: any[]) => {
      if (selectingLevel === null) return

      setSelectedRecipients(prev => {
          // Lọc bỏ những gì cùng Level đang chọn
          const otherLevels = prev.filter(r => Number((r as any).level) !== Number(selectingLevel))
          
          // Lọc bỏ luôn cả những đơn vị này nếu chúng đang nằm ở danh sách "Phối hợp" (không có level)
          const selectedIds = new Set(selectedUnits.map(u => String(u.id)))
          const finalOthers = otherLevels.filter(r => !(!r.level && selectedIds.has(String(r.id))))

          const newItemsForThisLevel = selectedUnits.map(u => ({
              ...u,
              type: 'unit' as const,
              level: selectingLevel
          }))
          
          return [...finalOthers, ...newItemsForThisLevel]
      })
      setSelectingLevel(null)
  }

  const handleSignersConfirm = (selectedUsers: any[]) => {
      if (!selectingSignersInfo) return
      
      const { level, unitId } = selectingSignersInfo
      
      setSelectedRecipients(prev => {
          const others = prev.filter(r => !(String(r.id) === String(unitId) && Number((r as any).level) === Number(level)))
          const current = prev.find(r => String(r.id) === String(unitId) && Number((r as any).level) === Number(level))
          
          if (current) {
              return [...others, { ...current, specificSigners: selectedUsers }]
          } else {
              // Trường hợp chỉnh sửa người ký cho cấp mặc định (chưa có trong selectedRecipients)
              // Ta cần add nó vào selectedRecipients như một override
              return [...prev, {
                  id: unitId,
                  name: selectingSignersInfo.unitName,
                  type: 'unit',
                  level: level,
                  specificSigners: selectedUsers
              }]
          }
      })
      setSelectingSignersInfo(null)
  }


  const prepareSignersForSubmit = () => {
    const submitList: any[] = []
    
    // Thu thập danh sách người ký từ quy trình (levels)
    mergedSequence.forEach(step => {
      if (step.isUserSelected && step.selectedUnits) {
        // Cấu trình ký tùy chỉnh (chọn nhiều đơn vị cho 1 cấp)
        step.selectedUnits.forEach((u: any) => {
          submitList.push({
            ...u,
            level: step.thu_tu_trinh_ky,
            type: 'unit',
            // Đảm bảo lấy đúng danh sách người ký nếu có
            specificSigners: u.specificSigners
          })
        })
      } else if (step.id_don_vi) {
        // Các cấp mặc định hoặc đã tùy chỉnh người ký (specificSigners)
        const signers = step.specificSigners !== undefined 
          ? step.specificSigners 
          : step.lan_dao_don_vi
          
        submitList.push({
          id: step.id_don_vi,
          name: step.ten_don_vi,
          type: 'unit',
          level: step.thu_tu_trinh_ky,
          specificSigners: signers
        })
      }
    })
    
    // Đơn vị phối hợp (không có cấp)
    // Loại bỏ những đơn vị đã xuất hiện trong quy trình ký ở trên
    const sequenceUnitIds = new Set(submitList.map(item => String(item.id)))
    
    const coordinationUnits = selectedRecipients.filter(r => {
        if (r.level) return false;
        const unitId = String(r.id);
        return !sequenceUnitIds.has(unitId);
    })
    
    submitList.push(...coordinationUnits)
    
    return submitList
  }

  const onClose = () => onOpenChange(false)

  const footerContent = (
    <div className="flex justify-end items-center w-full gap-2">
        {!isViewOnly && (
          <>
            {!editingData && (
              <Button
                variant="bordered"
                className="font-semibold text-gray-600 border-gray-200 px-6 hover:bg-gray-50 bg-white"
                onPress={() => handleCreate(prepareSignersForSubmit(), 'nhap', isUnitRequired)}
                isLoading={isLoadingDraft}
                isDisabled={isAnyLoading}
                radius="full"
              >
                Lưu nháp
              </Button>
            )}
            <Button
              color="primary"
              className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-6"
              onPress={() => handleCreate(prepareSignersForSubmit(), 'dang_xu_ly', isUnitRequired)}
              isLoading={isLoadingSend}
              isDisabled={isAnyLoading}
              radius="full"
              endContent={!isAnyLoading && <Send size={16} className="-rotate-12" />}
            >
              {editingData ? 'Cập nhật' : 'Gửi'}
            </Button>
          </>
        )}
    </div>
  )

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onMinimize={onMinimize}
      footer={footerContent}
      width="max-w-[1200px]"
    >
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Cột 1: Thông tin & Nội dung đề xuất (2/3) */}
        <div className="col-span-8 flex flex-col gap-4 border-r border-gray-100 dark:border-gray-700 px-6 py-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase mb-2">Nội dung chính</h3>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pt-2">
            <FormProvider {...form}>
              <form className="flex flex-col gap-4">
                <Skeleton isLoaded={!isLoadingLoaiDeXuat} className="rounded-lg">
                  <Controller
                    control={form.control}
                    name="tieu_de"
                    render={({ field }) => (
                      <InputFloatingLabel
                        label="Tiêu đề"
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        disabled={isViewOnly}
                        className="w-full"
                      />
                    )}
                  />
                </Skeleton>
                <Skeleton isLoaded={!isLoadingLoaiDeXuat} className="rounded-lg w-full">
                  <Controller
                    control={form.control}
                    name="loai_de_xuat"
                    render={({ field }) => (
                      <SelectDropdown
                        label="Loại đề xuất"
                        name={field.name}
                        options={typeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        isDisabled={isViewOnly}
                        className="w-full"
                      />
                    )}
                  />
                </Skeleton>

                <div className="grid grid-cols-2 gap-4 items-end">
                  <Skeleton isLoaded={!isLoadingAllPersons} className="rounded-lg">
                    <Controller
                      control={form.control}
                      name="id_nguoi_de_xuat"
                      render={({ field }) => (
                        <SelectDropdown
                          label="Người đề xuất"
                          name={field.name}
                          options={fullPersonOptions}
                          value={String(field.value)}
                          onChange={field.onChange}
                          isRequired
                          isDisabled={isViewOnly}
                          className="w-full"
                          height="min-h-[64px]"
                          labelTop="top-[38%]"
                          renderOption={(opt) => (
                             <div className="flex items-center gap-2 py-0.5">
                               <UserAvatar 
                                 name={opt.ho_va_ten || opt.label}
                                 src={opt.avatar}
                                 size="sm"
                                 className="shrink-0"
                               />
                               <div className="flex flex-col min-w-0 leading-tight">
                                 <span className="font-medium text-[13px] truncate">{opt.ho_va_ten || opt.label}</span>
                                 <span className="text-[11px] text-gray-400 truncate">{opt.ma_nhan_vien}</span>
                               </div>
                             </div>
                          )}
                          renderValue={(opt) => (
                             <div className="flex items-center gap-2 py-0.5">
                               <UserAvatar 
                                 name={opt.ho_va_ten || opt.label}
                                 src={opt.avatar}
                                 size="sm"
                                 className="shrink-0"
                               />
                               <div className="flex flex-col min-w-0 leading-tight">
                                 <span className="font-medium text-[13px] truncate">{opt.ho_va_ten || opt.label}</span>
                                 <span className="text-[11px] text-gray-400 truncate">{opt.ma_nhan_vien}</span>
                               </div>
                             </div>
                          )}
                        />
                      )}
                    />
                  </Skeleton>

                  <Skeleton isLoaded={!isLoadingAllPersons} className="rounded-lg h-10 flex items-center">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[13px] text-gray-500">Thời gian đề xuất:</span>
                      <span className="text-[14px] font-medium text-gray-800 dark:text-gray-200">
                        {activeData?.ngay_tao ? date('d/m/Y H:i', activeData.ngay_tao) : date('d/m/Y H:i')}
                      </span>
                    </div>
                  </Skeleton>
                </div>


                <Skeleton isLoaded={!isLoadingLoaiDeXuat} className="rounded-lg">
                  <Controller
                    control={form.control}
                    name="noi_dung"
                    render={({ field, fieldState }) => (
                      <RichTextEditor
                        label="Nội dung đề xuất"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Nhập nội dung đề xuất tại đây..."
                        isInvalid={!!fieldState.error}
                        minHeight="80px"
                      />
                    )}
                  />
                </Skeleton>


                <Skeleton isLoaded={!isLoadingAllPersons} className="rounded-lg">
                  <div className="flex flex-col gap-3 mt-4 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-500 shrink-0 w-24">Người soạn:</span>
                      <UserAvatarVertical
                        name={composerInfo.name}
                        src={composerInfo.avatar}
                        description={`Mã NV: ${composerInfo.ma_nhan_vien}`}
                        size="sm"
                        className="w-auto bg-transparent hover:bg-transparent px-0"
                      />
                    </div>
                    </div>
                </Skeleton>

                {/* File attachments */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <FileUploadSimple
                        name="file_dinh_kem"
                        currentFiles={watchedFiles || []}
                        existingFiles={(activeData?.file_dinh_kem || []).filter(
                           (f: any) => !deletedFileIds.includes(String(f.id_file_dinh_kem))
                        )}
                        onFilesChange={(name, files) => form.setValue(name as any, files)}
                        onRemoveExisting={handleRemoveExistingFile}
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    />
                </div>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Cột 2: Thiết lập quy trình ký (1/3) */}
        <div className="col-span-4 flex flex-col gap-4 px-6 py-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm uppercase">
                  {isSidebarPreview ? "Xem trước quy trình" : "Thiết lập quy trình ký"}
                </h3>
                {!isViewOnly && (
                    <Button
                        variant="light"
                        color="primary"
                        size="sm"
                        className="font-semibold px-3 hover:bg-blue-50 h-8"
                        onPress={() => setIsSidebarPreview(!isSidebarPreview)}
                        isDisabled={isAnyLoading}
                        startContent={isSidebarPreview ? <Settings size={16} /> : <Eye size={16} />}
                        radius="full"
                    >
                        {isSidebarPreview ? "Thiết lập" : "Xem trước"}
                    </Button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <Skeleton isLoaded={!isLoadingSigningSequence} className="rounded-lg h-full">
                  {isSidebarPreview ? (
                    <div className="p-4 bg-white dark:bg-gray-900 h-full overflow-y-auto custom-scrollbar">
                      <ProposeWorkflowTimeline 
                        creator={{
                          name: user?.ql_nguoi_dung_ho_ten || '',
                          avatar: user?.ql_nguoi_dung_avatar,
                          unit: user?.ten_don_vi || '',
                          statusLabel: 'ĐÃ GỬI'
                        }}
                        steps={mergedSequence.filter((s:any) => Number(s.thu_tu_trinh_ky) >= 1).map((s: any) => ({
                          level: s.thu_tu_trinh_ky,
                          unitName: s.ten_don_vi,
                          isMissing: s.isMissing,
                          subUnits: s.selectedUnits?.map((u: any) => ({
                            name: u.name,
                            approvers: (u.specificSigners || []).map((signer: any) => ({
                              name: signer.ql_nguoi_dung_ho_ten || signer.ho_va_ten || signer.name,
                              avatar: signer.ql_nguoi_dung_avatar || signer.avatar,
                            }))
                          })),
                          approvers: !s.selectedUnits ? (s.specificSigners || s.lanh_dao_don_vi || []).map((signer: any) => ({
                            name: signer.ql_nguoi_dung_ho_ten || signer.ho_va_ten || signer.name,
                            avatar: signer.ql_nguoi_dung_avatar || signer.avatar,
                          })) : []
                        }))}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                       {/* Header Step: Người soạn/Người gửi (Không đánh số để phù hợp với timeline chi tiết) */}
                       <div className="flex items-center gap-1.5 p-2.5 px-2 bg-gray-50/50 border border-gray-100 dark:border-gray-800 rounded transition-all">
                          {!isViewOnly && <div className="w-5 shrink-0" />} 
                           <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                               <Plus size={16} className="rotate-45" /> 
                           </div>
                           <div className="flex-1">
                               <p className="text-[12px] text-gray-400 font-medium">Người soạn</p>
                               <p className="text-[13px] font-bold text-gray-800">{composerInfo.name}</p>
                           </div>
                       </div>

                      {/* Dynamic Steps */}
                      {!selectedTypeId && !isViewOnly ? (
                           <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50/50 mt-2">
                              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2 text-blue-500">
                                  <Info size={20} />
                              </div>
                              <p className="text-[13px] text-gray-600 font-medium">Chưa chọn Loại đề xuất</p>
                              <p className="text-[12px] text-gray-400 text-center max-w-[200px]">Vui lòng chọn loại đề xuất để tải quy trình ký áp dụng.</p>
                          </div>
                      ) : (
                          <>
                              {mergedSequence.filter((s:any) => Number(s.thu_tu_trinh_ky) >= 1).map((step: any) => (
                                  <div 
                                      key={step.thu_tu_trinh_ky}
                                      className={`relative flex items-center gap-1.5 p-2.5 px-2 rounded border transition-all cursor-move active:cursor-grabbing ${
                                          step.isMissing 
                                              ? 'bg-amber-50 border-amber-200 border-dashed' 
                                              : 'bg-white border-gray-200 dark:border-gray-700 group'
                                      }`}
                                      draggable={!isViewOnly}
                                      onDragStart={(e) => {
                                          if (isViewOnly) return
                                          e.dataTransfer.setData('sourceLevel', String(step.thu_tu_trinh_ky))
                                          e.dataTransfer.effectAllowed = 'move'
                                      }}
                                      onDragOver={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'z-10');
                                      }}
                                      onDragLeave={(e) => {
                                          e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'z-10');
                                      }}
                                      onDrop={(e) => {
                                          if (isViewOnly) return
                                          e.preventDefault();
                                          e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'z-10');
                                          
                                          const unitData = e.dataTransfer.getData('unit');
                                          const sourceLevelStr = e.dataTransfer.getData('sourceLevel');

                                          if (unitData) {
                                              const unit = JSON.parse(unitData);
                                              const level = Number(step.thu_tu_trinh_ky);
                                              setSelectedRecipients(prev => {
                                                  const others = prev.filter(r => (r as any).level !== level);
                                                  return [...others, { ...unit, type: 'unit', level }];
                                              });
                                              return; 
                                          }

                                          if (sourceLevelStr) {
                                              const sourceLevel = Number(sourceLevelStr)
                                              const targetLevel = Number(step.thu_tu_trinh_ky)
                                              if (sourceLevel === targetLevel) return

                                              const allSteps = mergedSequence.filter((s:any) => Number(s.thu_tu_trinh_ky) > 1)
                                              const sourceIndex = allSteps.findIndex((s:any) => Number(s.thu_tu_trinh_ky) === sourceLevel)
                                              const targetIndex = allSteps.findIndex((s:any) => Number(s.thu_tu_trinh_ky) === targetLevel)
                                              if (sourceIndex === -1 || targetIndex === -1) return

                                              const reorderedSteps = [...allSteps]
                                              const [movedStep] = reorderedSteps.splice(sourceIndex, 1)
                                              reorderedSteps.splice(targetIndex, 0, movedStep)

                                              setSelectedRecipients(prev => {
                                                  const others = prev.filter(r => !r.level || Number(r.level) <= 1)
                                                  const newItems: any[] = []
                                                  reorderedSteps.forEach((s, idx) => {
                                                      const newLvl = idx + 2
                                                      if (s.selectedUnits && s.selectedUnits.length > 0) {
                                                          s.selectedUnits.forEach((u: any) => {
                                                              newItems.push({ ...u, level: newLvl, type: u.type || 'unit' })
                                                          })
                                                      } else if (s.id_don_vi) {
                                                          newItems.push({ id: s.id_don_vi, name: s.ten_don_vi, type: 'unit', level: newLvl, specificSigners: s.specificSigners })
                                                      }
                                                  })
                                                  return [...others, ...newItems]
                                              })
                                          }
                                      }}
                                  >
                                      {!isViewOnly && (
                                           <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex items-center justify-center w-5 shrink-0">
                                               <GripVertical size={16} />
                                           </div>
                                       )}
                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${step.isMissing ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                                           {step.thu_tu_trinh_ky}
                                       </div>
                                       
                                       <div className="flex-1 min-w-0">
                                           {step.isMissing ? (
                                               <p className="text-[13px] text-gray-400 italic">Kéo thả đơn vị hoặc nhấn để chọn...</p>
                                           ) : (
                                               <div>
                                                   <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <p className="text-[13px] font-bold truncate text-gray-800" title={step.ten_don_vi}>{step.ten_don_vi}</p>
                                                        </div>
                                                   </div>

                                                   {step.selectedUnits && step.selectedUnits.length > 1 ? (
                                                       <div className="flex flex-col gap-2 mt-2">
                                                           {step.selectedUnits.map((unit: any, uIdx: number) => (
                                                               <div key={uIdx} className="bg-gray-50 border border-gray-200 rounded p-2">
                                                                   <div className="flex justify-between items-center mb-1 gap-2">
                                                                       <p className="text-[12px] font-semibold text-gray-800 truncate flex-1 min-w-0" title={unit.name}>{unit.name}</p>
                                                                       {!isViewOnly && (
                                                                           <div className="flex gap-1 shrink-0 ml-2">
                                                                                <button 
                                                                                  className="text-[10px] text-blue-600 hover:underline whitespace-nowrap font-bold"
                                                                                  onClick={() => setSelectingSignersInfo({
                                                                                      level: Number(step.thu_tu_trinh_ky),
                                                                                      unitId: unit.id,
                                                                                      unitName: unit.name,
                                                                                      initialSelected: unit.specificSigners || []
                                                                                  })}
                                                                                >
                                                                                  + Chọn người
                                                                                </button>
                                                                                <X size={14} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => {
                                                                                    const level = Number(step.thu_tu_trinh_ky);
                                                                                    const unitId = String(unit.id);
                                                                                    setSelectedRecipients(prev => prev.filter(r => !(String(r.id) === unitId && Number((r as any).level) === level)));
                                                                                }}/>
                                                                           </div>
                                                                       )}
                                                                   </div>
                                                                   <div className="flex flex-wrap gap-1.5">
                                                                      {(unit.specificSigners || []).map((signer: any, sIdx: number) => (
                                                                          <SignerTag 
                                                                              key={sIdx} 
                                                                              signer={signer}
                                                                              isViewOnly={isViewOnly}
                                                                              onRemove={() => {
                                                                                  const level = Number(step.thu_tu_trinh_ky), unitId = String(unit.id), signerId = String(signer.ql_nguoi_dung_id || signer.id || '');
                                                                                  setSelectedRecipients(prev => prev.map(r => (String(r.id) === unitId && Number((r as any).level) === level) ? { ...r, specificSigners: (r.specificSigners || []).filter((s:any) => String(s.ql_nguoi_dung_id || s.id) !== signerId) } : r));
                                                                              }}
                                                                           />
                                                                      ))}
                                                                   </div>
                                                               </div>
                                                           ))}
                                                       </div>
                                                   ) : (
                                                       <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                                                          {(step.specificSigners || step.lanh_dao_don_vi || []).map((signer: any, sIdx: number) => (
                                                              <SignerTag 
                                                                 key={sIdx} 
                                                                 signer={signer}
                                                                 isViewOnly={isViewOnly}
                                                                 onRemove={() => {
                                                                     const level = Number(step.thu_tu_trinh_ky), unitId = String(step.id_don_vi), signerId = String(signer.ql_nguoi_dung_id || signer.id || '');
                                                                     const currentSigners = step.specificSigners || step.lanh_dao_don_vi || [];
                                                                     const newSigners = currentSigners.filter((s:any) => String(s.ql_nguoi_dung_id || s.id) !== signerId);
                                                                     setSelectedRecipients(prev => {
                                                                         const exists = prev.find(r => String(r.id) === unitId && Number((r as any).level) === level);
                                                                         if (exists) return prev.map(r => (String(r.id) === unitId && Number((r as any).level) === level) ? { ...r, specificSigners: newSigners } : r);
                                                                         return [...prev, { id: unitId, name: step.ten_don_vi, type: 'unit', level: level, specificSigners: newSigners }];
                                                                     });
                                                                 }}
                                                              />
                                                          ))}
                                                          <button 
                                                              className="text-[10px] text-blue-600 hover:underline px-1 font-bold"
                                                              onClick={() => setSelectingSignersInfo({
                                                                  level: Number(step.thu_tu_trinh_ky),
                                                                  unitId: step.id_don_vi,
                                                                  unitName: step.ten_don_vi,
                                                                  initialSelected: step.specificSigners || step.lanh_dao_don_vi || []
                                                              })}
                                                          >
                                                              + Chọn người
                                                          </button>
                                                       </div>
                                                   )}
                                               </div>
                                           )}
                                       </div>

                                       {!isViewOnly && (
                                           <div className="flex gap-1">
                                               {(step.isUserSelected || !step.isMissing) && (
                                                    <button 
                                                       className="p-1 hover:bg-gray-100 rounded text-red-500"
                                                       onClick={() => setLevelToDelete(Number(step.thu_tu_trinh_ky))}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                               )}
                                               {step.isMissing && (
                                                  <button
                                                      className="p-1 hover:bg-gray-100 rounded text-blue-500"
                                                      onClick={() => setSelectingLevel(Number(step.thu_tu_trinh_ky))}
                                                  >
                                                      <Plus size={16} />
                                                  </button>
                                               )}
                                           </div>
                                       )}
                                  </div>
                              ))}

                              <Button 
                                  color="primary" 
                                  variant="light" 
                                  size="sm"
                                  className="mt-2 w-full border border-dashed border-blue-300"
                                  onPress={() => {
                                      const maxLevel = Math.max(...mergedSequence.map((s:any) => Number(s.thu_tu_trinh_ky)), 1);
                                      setSelectingLevel(maxLevel + 1);
                                  }}
                              >
                                  + THÊM CẤP DUYỆT
                              </Button>
                          </>
                      )}
                    </div>
                  )}
                </Skeleton>
            </div>
        </div>


      </div>

      <FilePreviewModal
        isOpen={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
      />

      <SelectRecipientsModal
        isOpen={selectingLevel !== null}
        onClose={() => setSelectingLevel(null)}
        onConfirm={handleSidebarSelectConfirm}
        unitData={unitOptions}
      />

      <SelectUsersModal 
          isOpen={!!selectingSignersInfo}
          onClose={() => setSelectingSignersInfo(null)}
          onConfirm={handleSignersConfirm}
          unitId={selectingSignersInfo?.unitId || ''}
          unitName={selectingSignersInfo?.unitName || ''}
          initialSelected={selectingSignersInfo?.initialSelected || []}
      />

      <ConfirmModal
          isOpen={levelToDelete !== null}
          onClose={() => setLevelToDelete(null)}
          onConfirm={() => {
              if (levelToDelete !== null) {
                  const targetLevel = levelToDelete
                  setSelectedRecipients(prev => {
                      // 1. Xóa tất cả đơn vị thuộc cấp bị chọn
                      const filtered = prev.filter(r => Number((r as any).level) !== targetLevel)
                      
                      // 2. Đẩy các cấp phía sau lên (Shift Up)
                      return filtered.map(r => {
                          const currentLevel = Number((r as any).level)
                          if (currentLevel > targetLevel) {
                              return { ...r, level: currentLevel - 1 }
                          }
                          return r
                      })
                  })
                  setLevelToDelete(null)
              }
          }}
          title="Xác nhận xóa cấp duyệt"
          content={`Bạn có chắc chắn muốn xóa tất cả đơn vị thuộc Cấp ${levelToDelete} không?`}
          isDanger
      />

      <WorkflowPreviewModal 
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        sequence={mergedSequence}
        user={user}
      />
    </DraggableModal>
  )
}
