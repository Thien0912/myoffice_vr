import { Button, Tooltip, Chip, Tabs, Tab, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import {
  DrawerContentCustom,
  DrawerCustom,
  DrawerHeaderCustom
} from '@renderer/components/DrawerCustom'
import {
  ChevronsRight,
  FileText,
  ExternalLink,
  Paperclip,
  ArrowUp,
  ArrowDown,
  Info,
  GitBranch,
  Maximize2,
  KeyRound,
  Mail,
  CheckCircle2,
  MessageSquare,
  Send,
  Undo2
} from 'lucide-react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { date } from '@renderer/utils/formatDate'
import { ProposeData } from '../hooks/usePropose'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { useState, useEffect, useRef } from 'react'
import { getFileUrl } from '@renderer/utils/urlUtils'
import { FilePreviewModal } from '@renderer/components/FilePreviewModal'
import { UserAvatar } from '@renderer/components/UserAvatar'
import ApproveModal from '@renderer/components/ApproveModal'
import { useAuthStore } from '@renderer/store/useAuthStore'
import CreateProposeModal from './CreateProposeModal'
import { motion, AnimatePresence } from 'framer-motion'
import ProposeWorkflowTimeline from './ProposeWorkflowTimeline'
import SelectUsersModal from './SelectUsersModal'
import { FileX } from 'lucide-react'
import ProposeCommentList from './ProposeCommentList'
import ProposeCommentInput from './ProposeCommentInput'
import { toast } from "@heroui-v3/react";

type DrawerProposeProps = {
  open: boolean
  onClose: () => void
  data?: ProposeData | null
  onReload?: () => void
  onExpand?: () => void
}

export default function DrawerPropose({
  open,
  onClose,
  data: initialData,
  onReload,
  onExpand
}: DrawerProposeProps) {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<ProposeData | null>(initialData || null)
  const [loading, setLoading] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null)
  const [activeTab, setActiveTab] = useState<string>('info')
  const infoScrollRef = useRef<HTMLDivElement>(null)
  const processScrollRef = useRef<HTMLDivElement>(null)
  const [approveModal, setApproveModal] = useState<{ isOpen: boolean; type: 'approve' | 'reject' }>(
    {
      isOpen: false,
      type: 'approve'
    }
  )
  const [isApproving, setIsApproving] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [signingMethod, setSigningMethod] = useState<string>('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectingSignersInfo, setSelectingSignersInfo] = useState<{
    level: number | string
    unitId: string | number
    unitName: string
    initialSelected: any[]
  } | null>(null)

  useEffect(() => {
    if (open && initialData?.id_de_xuat) {
      fetchDetail(initialData.id_de_xuat)
    }
  }, [open, initialData?.id_de_xuat])

  const scrollToTop = () => {
    const currentRef = activeTab === 'info' ? infoScrollRef : processScrollRef
    currentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    const currentRef = activeTab === 'info' ? infoScrollRef : processScrollRef
    currentRef.current?.scrollTo({ top: currentRef.current.scrollHeight, behavior: 'smooth' })
  }

  const fetchDetail = async (id: string) => {
    setLoading(true)
    try {
      const res = await dexuatAxios.getDetail(id)
      if (res.status) {
        setData(res.data)
      }
    } catch (error) {
      console.error('Error fetching propose detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveAction = async (reason: string) => {
    if (!data?.id_de_xuat) return

    setIsApproving(true)
    try {
      const isReject = approveModal.type === 'reject'
      const res = await dexuatAxios.approve(data.id_de_xuat, {
        da_duyet: isReject ? 0 : 1,
        ly_do: reason
      })

      if (res.success || res.status) {
        toast(isReject ? 'Đã từ chối đề xuất' : 'Đã duyệt đề xuất', { variant: isReject ? 'warning' : 'success' })
        setApproveModal((prev) => ({ ...prev, isOpen: false }))

        // Gửi mail tới cấp tiếp theo (fire-and-forget, không block UI)
        if (!isReject && res.data?.should_send_email) {
          dexuatAxios.sendEmail(data.id_de_xuat, res.data.cap_duyet)
        }

        onReload?.()
        fetchDetail(data.id_de_xuat)
      } else {
        toast('Thất bại', { description: res.message || 'Thao tác thất bại', variant: 'danger' })
      }
    } catch (e) {
      console.error(e)
      toast('Lỗi', { description: 'Có lỗi xảy ra', variant: 'danger' })
    } finally {
      setIsApproving(false)
    }
  }

  const handleSendDraft = async () => {
    if (!data?.id_de_xuat) return
    setIsSending(true)
    try {
      const res = await dexuatAxios.update(data.id_de_xuat, { nhap: 0 })
      if (res.success || res.status) {
        toast('Gửi đề xuất thành công', { variant: 'success' })
        onReload?.()
        fetchDetail(data.id_de_xuat)
      } else {
        toast('Thất bại', { description: res.message || 'Thao tác thất bại', variant: 'danger' })
      }
    } catch (e) {
      console.error(e)
      toast('Lỗi', { description: 'Có lỗi xảy ra', variant: 'danger' })
    } finally {
      setIsSending(false)
    }
  }

  const handleConvertToDraft = async () => {
    if (!data?.id_de_xuat) return
    setIsSending(true)
    try {
      const res = await dexuatAxios.update(data.id_de_xuat, { nhap: 1 })
      if (res.success || res.status) {
        toast('Đã chuyển về bản nháp', { variant: 'success' })
        onReload?.()
        fetchDetail(data.id_de_xuat)
      } else {
        toast('Thất bại', { description: res.message || 'Thao tác thất bại', variant: 'danger' })
      }
    } catch (e) {
      console.error(e)
      toast('Lỗi', { description: 'Có lỗi xảy ra', variant: 'danger' })
    } finally {
      setIsSending(false)
    }
  }

  const handleCommentSuccess = () => {
    // Chỉ fetch lại bình luận, không reload toàn bộ drawer
    if (data?.id_de_xuat) {
      fetchDetail(data.id_de_xuat)
      onReload?.()
    }
  }

  const handleEditSigners = async (selectedUsers: any[]) => {
    if (!data?.id_de_xuat || !selectingSignersInfo) return

    try {
      // API call to update signers for specific level
      const res = await dexuatAxios.update(data.id_de_xuat, {
        cap_duyet: selectingSignersInfo.level,
        id_don_vi: selectingSignersInfo.unitId,
        danh_sach_nguoi_duyet: selectedUsers.map((u) => u.ql_nguoi_dung_id || u.id)
      })

      if (res.success || res.status) {
        toast('Cập nhật người ký thành công', { variant: 'success' })
        fetchDetail(data.id_de_xuat)
        onReload?.()
      } else {
        toast('Thất bại', { description: res.message || 'Không thể cập nhật người ký', variant: 'danger' })
      }
    } catch (error) {
      console.error('Error updating signers:', error)
      toast('Lỗi', { description: 'Có lỗi xảy ra khi cập nhật người ký', variant: 'danger' })
    } finally {
      setSelectingSignersInfo(null)
    }
  }

  const [canScrollInfo, setCanScrollInfo] = useState(false)
  const [canScrollProcess, setCanScrollProcess] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(false)

  const checkScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    setter: (val: boolean) => void
  ) => {
    if (ref.current) {
      const { scrollHeight, clientHeight, scrollTop: st } = ref.current
      setter(scrollHeight > clientHeight)
      setScrollTop(st)
      setIsAtBottom(st + clientHeight >= scrollHeight - 10)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentRef = activeTab === 'info' ? infoScrollRef : processScrollRef
      if (currentRef.current) {
        const { scrollTop: st, scrollHeight, clientHeight } = currentRef.current
        setScrollTop(st)
        setIsAtBottom(st + clientHeight >= scrollHeight - 10)
      }
    }

    const infoNode = infoScrollRef.current
    const processNode = processScrollRef.current

    const observer = new ResizeObserver(() => {
      checkScroll(infoScrollRef, setCanScrollInfo)
      checkScroll(processScrollRef, setCanScrollProcess)
    })

    if (infoNode) {
      observer.observe(infoNode)
      infoNode.addEventListener('scroll', handleScroll)
    }
    if (processNode) {
      observer.observe(processNode)
      processNode.addEventListener('scroll', handleScroll)
    }

    return () => {
      observer.disconnect()
      infoNode?.removeEventListener('scroll', handleScroll)
      processNode?.removeEventListener('scroll', handleScroll)
    }
  }, [data, activeTab, open])

  // Reset scroll to top when opening new proposal
  useEffect(() => {
    if (open) {
      infoScrollRef.current?.scrollTo(0, 0)
      processScrollRef.current?.scrollTo(0, 0)
    }
  }, [data?.id_de_xuat, open])

  // Gmail Style Scroll Buttons Logic: Chỉ hiện khi cần thiết
  const canScroll = activeTab === 'info' ? canScrollInfo : canScrollProcess
  const showScrollUp = canScroll && scrollTop > 50
  const showScrollDown = canScroll && !isAtBottom

  if (!open) return null

  return (
    <DrawerCustom open={open} position="right">
      <DrawerHeaderCustom title="Xem nhanh" onClose={onClose}>
        <div className="flex items-center gap-1">
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
          {onExpand && (
            <Tooltip content="Xem toàn màn hình" placement="bottom">
              <Button
                isIconOnly
                startContent={<Maximize2 size={18} />}
                size="sm"
                variant="light"
                onPress={onExpand}
              />
            </Tooltip>
          )}
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {/* Xem nhanh */}
          </span>
        </div>
        <div className="flex items-center gap-2 pr-4">
          {/* Edit Button Logic */}
          {(() => {
            if (!data) return null
            const isCreator = user?.ql_nguoi_dung_id === data.created_user_id

            // Check levels logic using quy_trinh
            const canEdit =
              isCreator &&
              (['nhap', 'tu_choi'].includes(data.trang_thai || '') ||
                (data.quy_trinh || []).some((step: any) =>
                  (step.nguoi_duyet || []).every((a: any) => a.da_duyet === null)
                ))

            return (
              canEdit && (
                <div className="flex items-center gap-2">
                  {data.trang_thai === 'nhap' && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="solid"
                      onPress={handleSendDraft}
                      isLoading={isSending}
                      className="font-bold shadow-sm"
                      startContent={<Send size={16} />}
                    >
                      Gửi đề xuất
                    </Button>
                  )}
                  {(data.trang_thai === 'dang_xu_ly' || data.trang_thai === 'tu_choi') && (
                    <Button
                      size="sm"
                      color="warning"
                      variant="flat"
                      onPress={handleConvertToDraft}
                      isLoading={isSending}
                      className="font-bold"
                      startContent={<Undo2 size={16} />}
                    >
                      Thu hồi về nháp
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onPress={() => setIsEditModalOpen(true)}
                    className="font-semibold"
                    startContent={<FileText size={16} />}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              )
            )
          })()}

          {(data?.can_approve === 1 || data?.can_approve === '1') && (
            <>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={() => setApproveModal({ isOpen: true, type: 'reject' })}
                className="font-semibold"
              >
                Từ chối
              </Button>

              <Popover
                placement="bottom"
                showArrow
                isOpen={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
              >
                <PopoverTrigger>
                  <Button
                    size="sm"
                    color="primary"
                    variant="solid"
                    startContent={<CheckCircle2 size={18} />}
                    className="font-bold shadow-sm px-4"
                  >
                    Duyệt
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2">
                  <Button
                    variant="light"
                    className="w-full justify-start h-auto py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 data-[hover=true]:bg-gray-50 dark:data-[hover=true]:bg-gray-700 mt-1"
                    onPress={() => {
                      if (user?.has_pin === 1 || user?.has_pin === '1') {
                        setSigningMethod('pin')
                        setIsPopoverOpen(false)
                        setApproveModal({ isOpen: true, type: 'approve' })
                      } else {
                        toast('Cần mã PIN', { description: user?.has_pin === 2 || user?.has_pin === '2'
                                                        ? 'Vui lòng xác thực email để sử dụng mã PIN'
                                                        : 'Vui lòng đăng ký mã PIN trong cài đặt tài khoản', variant: 'warning' })
                      }
                    }}
                    startContent={
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                          user?.has_pin === 1 || user?.has_pin === '1'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : user?.has_pin === 2 || user?.has_pin === '2'
                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        <KeyRound size={18} />
                      </div>
                    }
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {user?.has_pin === 1 || user?.has_pin === '1'
                          ? 'Ký xác thực bằng mã PIN'
                          : user?.has_pin === 2 || user?.has_pin === '2'
                            ? 'Mã PIN chưa xác thực'
                            : 'Chưa có mã PIN'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {user?.has_pin === 1 || user?.has_pin === '1'
                          ? 'Xác thực nhanh bằng 6 chữ số'
                          : user?.has_pin === 2 || user?.has_pin === '2'
                            ? 'Vui lòng kiểm tra email của bạn'
                            : 'Đăng ký trong Cài đặt tài khoản'}
                      </span>
                    </div>
                  </Button>

                  <Button
                    variant="light"
                    className="w-full justify-start h-auto py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 data-[hover=true]:bg-gray-50 dark:data-[hover=true]:bg-gray-700 mt-1"
                    onPress={() => {
                      setSigningMethod('otp')
                      setIsPopoverOpen(false)
                      setApproveModal({ isOpen: true, type: 'approve' })
                    }}
                    startContent={
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                        <Mail size={18} />
                      </div>
                    }
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Duyệt qua Email OTP
                      </span>
                      <span className="text-[10px] text-gray-400">Nhận mã xác thực qua Email</span>
                    </div>
                  </Button>
                </PopoverContent>
              </Popover>
            </>
          )}

          {/* Confirm Completion Button for TCHC */}
          {(() => {
            const isTCHC =
              user?.ma_don_vi === 'PHONG_TCHC' || user?.loai_lanh_dao === 'LANH_DAO_TCHC'
            const isNotCompleted = data?.trang_thai !== 'da_duyet'
            const canNotApproveNormally = data?.can_approve != 1 && data?.can_approve != '1'

            if (isTCHC && isNotCompleted && canNotApproveNormally) {
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tooltip
                    content="Xác nhận đề xuất này hoàn thành với tư cách là phòng TCHC"
                    placement="bottom"
                  >
                    <Button
                      size="sm"
                      radius="sm"
                      onPress={() => setApproveModal({ isOpen: true, type: 'approve' })}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold px-5 h-9 border-none ml-1"
                      startContent={<CheckCircle2 size={16} className="text-white/90" />}
                    >
                      Tổ chức xác nhận
                    </Button>
                  </Tooltip>
                </motion.div>
              )
            }
            return null
          })()}
        </div>
      </DrawerHeaderCustom>

      <DrawerContentCustom>
        {loading ? (
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 animate-pulse rounded w-3/4"></div>
            <div className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded w-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded w-1/2"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded w-1/3"></div>
            </div>
          </div>
        ) : !data ? (
          <NoData />
        ) : (
          <div className="flex flex-col h-full relative overflow-hidden">
            <Tabs
              aria-label="Propose Details Tabs"
              variant="underlined"
              color="primary"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              classNames={{
                base: 'w-full',
                tabList:
                  'gap-6 w-full relative rounded-none p-0 px-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-40 h-12 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none',
                cursor: 'w-full bg-blue-600',
                tab: 'max-w-fit px-0 h-12',
                tabContent: 'group-data-[selected=true]:text-blue-600 font-semibold',
                panel: 'p-0 flex-1 overflow-hidden'
              }}
            >
              <Tab
                key="info"
                title={
                  <div className="flex items-center gap-2">
                    <Info size={16} />
                    <span>Thông tin</span>
                  </div>
                }
              >
                <div className="flex flex-col h-[calc(100vh-180px)]">
                  <div
                    ref={infoScrollRef}
                    className="flex-1 overflow-y-auto px-2 space-y-6 pb-24 custom-scrollbar"
                  >
                    {/* Information Card styled as "Initial Issue" */}
                    <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 space-y-4 mt-2 rounded-xl">
                      <div className="flex items-start gap-4">
                        <UserAvatar
                          name={data.nguoi_de_xuat || 'User'}
                          src={data.avatar_nguoi_de_xuat}
                          size="md"
                          className="w-12 h-12 ring-2 ring-blue-100 dark:ring-blue-900/30"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-blue-700 dark:text-blue-400 text-base">
                              {data.nguoi_de_xuat}
                            </span>
                            <span className="text-gray-400 text-[11px] font-medium">
                              {date('d/m/Y, H:i', data.created_at)}
                            </span>

                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Chip
                              size="sm"
                              variant="bordered"
                              className="h-6 text-[10px] bg-slate-50 border-slate-200 text-slate-600 font-medium"
                            >
                              # {data.ma_nhan_vien_de_xuat || data.ma_nhan_vien_tao}
                            </Chip>
                            <Chip
                              size="sm"
                              variant="bordered"
                              className="h-6 text-[10px] bg-slate-50 border-slate-200 text-slate-600 font-medium lowercase"
                              startContent={<Mail size={12} className="ml-1" />}
                            >
                              {data.email_de_xuat || data.email || 'N/A'}
                            </Chip>
                            {data.ten_don_vi_de_xuat && (
                              <Chip
                                size="sm"
                                variant="bordered"
                                className="h-6 text-[10px] bg-slate-50 border-slate-200 text-slate-600 font-medium"
                              >
                                {data.ten_don_vi_de_xuat}
                              </Chip>
                            )}
                          </div>

                          <div className="mt-3">
                            <Chip color="primary" variant="solid" size="sm" className="font-bold h-7 px-4 rounded-full">
                              {data.ten_loai_de_xuat || 'General Support'}
                            </Chip>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-4">
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {data.tieu_de}
                        </div>
                        
                        <div>
                          <div className="font-bold text-gray-500">Nội dung:</div>
                          <div 
                            className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none rich-text-content p-2 border border-gray-200 rounded-sm bg-gray-50 dark:bg-gray-800"
                            dangerouslySetInnerHTML={{ __html: data.noi_dung }}
                          /> 
                        </div>
                      </div>
                    </div>

                    {/* Attachment Section */}
                    {data.file_dinh_kem && data.file_dinh_kem.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[13px] font-medium">
                          <Paperclip size={12} />
                          <span>Tài liệu đính kèm ({data.file_dinh_kem.length})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {data.file_dinh_kem.map((file: any) => {
                            const fileName = file.ten_file_goc || ''
                            const ext = fileName.toLowerCase().split('.').pop() || ''
                            const loaiFile = (file.loai_file || '').toLowerCase()
                            const isImage =
                              loaiFile.includes('image') ||
                              ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)

                            const rawSize =
                              file.dung_luong !== undefined && file.dung_luong !== null
                                ? file.dung_luong
                                : file.size || 0
                            const sizeInBytes =
                              typeof rawSize === 'number'
                                ? rawSize
                                : parseFloat(String(rawSize).replace(/[^0-9.]/g, '')) || 0

                            const formatFileSize = (bytes: number) => {
                              if (bytes === 0) return '0 B'
                              const k = 1024
                              const sizes = ['B', 'KB', 'MB', 'GB']
                              const i = Math.floor(Math.log(bytes) / Math.log(k))
                              return (
                                parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
                              )
                            }

                            const formattedSize = formatFileSize(sizeInBytes)

                            return (
                              <div
                                key={file.id_file_dinh_kem || Math.random()}
                                className="group relative aspect-video rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                                onClick={() =>
                                  setPreviewFile({
                                    url: file.duong_dan,
                                    name: file.ten_file_goc
                                  })
                                }
                              >
                                <div className="w-full h-full flex items-center justify-center">
                                  {isImage ? (
                                    <img
                                      src={getFileUrl(file.duong_dan)}
                                      alt={file.ten_file_goc}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50/30 dark:bg-blue-900/10">
                                      <OfficeIcon name={file.ten_file_goc} size={32} />
                                    </div>
                                  )}
                                </div>

                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                  <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/20 text-white">
                                    <ExternalLink size={14} />
                                  </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                                  <p className="text-[11px] text-white truncate px-1">
                                    {file.ten_file_goc}
                                  </p>
                                  <p className="text-[9px] text-white/70 px-1">{formattedSize}</p>
                                </div>
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {/* Discussion / Comments */}
                    <div className="mt-12 mb-8 border-t border-gray-100 dark:border-gray-700 pt-8 px-2">
                      <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-gray-200">
                        <MessageSquare size={18} className="text-blue-600" />
                        <span className="font-bold text-base">Thảo luận</span>
                      </div>

                      <ProposeCommentList
                        data={data.binh_luan || []}
                        idDeXuat={data.id_de_xuat}
                        onReload={handleCommentSuccess}
                        propose={data}
                      />
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab
                key="process"
                title={
                  <div className="flex items-center gap-2">
                    <GitBranch size={16} />
                    <span>Quy trình ký</span>
                  </div>
                }
              >
                <div
                  ref={processScrollRef}
                  className="p-4 overflow-y-auto h-[calc(100vh-180px)] custom-scrollbar"
                >
                  <ProposeWorkflowTimeline
                    creator={{
                      name: data.nguoi_tao,
                      avatar: data.avatar_nguoi_tao,
                      unit: `Người khởi tạo • Mã NV: ${data.ma_nhan_vien_tao}`,
                      time: data.created_at,
                      statusLabel: 'ĐÃ GỬI'
                    }}
                    steps={(data.quy_trinh || []).map((step: any) => ({
                      level: step.cap_duyet,
                      unitName: step.ten_don_vi || `Cấp ${step.cap_duyet}`,
                      idDonVi: step.id_don_vi,
                      approvers: (step.nguoi_duyet || []).map((approver: any) => ({
                        id: approver.id_nguoi_duyet_de_xuat,
                        ql_nguoi_dung_id: approver.id_nguoi_duyet, // Map cho SelectUsersModal
                        name: approver.ten_nguoi_duyet,
                        avatar: approver.avatar,
                        unit: approver.ten_don_vi,
                        status:
                          approver.da_duyet === '1' || approver.da_duyet === 1
                            ? 'approved'
                            : approver.da_duyet === '0' || approver.da_duyet === 0
                              ? 'rejected'
                              : 'pending',
                        time: approver.ngay_duyet || approver.thoi_gian_duyet,
                        comment: approver.ly_do
                      }))
                    }))}
                    onEditSigners={(level, unitId, unitName, currentApprovers) => {
                      setSelectingSignersInfo({
                        level,
                        unitId,
                        unitName,
                        initialSelected: currentApprovers
                      })
                    }}
                  />
                </div>
              </Tab>
            </Tabs>

            <div className="absolute right-4 bottom-28 flex flex-col gap-2 z-[80]">
              <AnimatePresence>
                {showScrollUp && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Tooltip content="Cuộn lên đầu" placement="left">
                      <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        className="bg-blue-600 text-white hover:bg-blue-700 transition-all border border-blue-500/50"
                        onPress={scrollToTop}
                      >
                        <ArrowUp size={16} />
                      </Button>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showScrollDown && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Tooltip content="Cuộn xuống cuối" placement="left">
                      <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        className="bg-blue-600 text-white hover:bg-blue-700 transition-all border border-blue-500/50"
                        onPress={scrollToBottom}
                      >
                        <ArrowDown size={16} />
                      </Button>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fixed Input at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-50">
              <ProposeCommentInput idDeXuat={data.id_de_xuat} onSuccess={handleCommentSuccess} />
            </div>
          </div>
        )}
      </DrawerContentCustom>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
      />
      <ApproveModal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleApproveAction}
        isReject={approveModal.type === 'reject'}
        isLoading={isApproving}
        verificationType={
          approveModal.type === 'approve' && (signingMethod === 'pin' || signingMethod === 'otp')
            ? (signingMethod as 'pin' | 'otp')
            : 'none'
        }
        entityId={data?.id_de_xuat}
      />

      <CreateProposeModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => {
          if (data?.id_de_xuat) fetchDetail(data.id_de_xuat)
          onReload?.()
        }}
        editingData={data}
      />

      {selectingSignersInfo && (
        <SelectUsersModal
          isOpen={!!selectingSignersInfo}
          onClose={() => setSelectingSignersInfo(null)}
          onConfirm={handleEditSigners}
          unitId={selectingSignersInfo.unitId}
          unitName={selectingSignersInfo.unitName}
          initialSelected={selectingSignersInfo.initialSelected}
        />
      )}
    </DrawerCustom>
  )
}



function NoData() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-300">
      <FileX size={64} strokeWidth={1} />
      <span className="mt-2">Không tìm thấy dữ liệu</span>
    </div>
  )
}
