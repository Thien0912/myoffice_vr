import { Modal, ModalContent, ModalHeader, ModalBody, Button, Tooltip, ScrollShadow, Checkbox, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import {
   X,
   FileText,
   Info,
   MessageSquare,
   Download,
   ChevronLeft,
   ChevronRight,
   Printer,
   Layers,
   FileDown,
   Settings,
   Mail,
   KeyRound
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ProposeData } from '../hooks/usePropose'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { date } from '@renderer/utils/formatDate'
import { getFileUrl } from '@renderer/utils/urlUtils'
import OfficeIcon from '@renderer/components/OfficeIcon'
import ProposeCommentList from './ProposeCommentList'
import ProposeCommentInput from './ProposeCommentInput'
import ApproveModal from '@renderer/components/ApproveModal'
import { useAuthStore } from '@renderer/store/useAuthStore'
import CreateProposeModal from './CreateProposeModal'
import { motion } from 'framer-motion'
import { UserAvatar } from '@renderer/components/UserAvatar'
import ProposeWorkflowTimeline from './ProposeWorkflowTimeline'
import { toast } from "@heroui-v3/react";

interface ProposeDetailModalProps {
   isOpen: boolean
   onOpenChange: (isOpen: boolean) => void
   proposeId: string | null
   onReload?: () => void
}

export default function ProposeDetailModal({
   isOpen,
   onOpenChange,
   proposeId,
   onReload
}: ProposeDetailModalProps) {
   const user = useAuthStore((state) => state.user)
   const [data, setData] = useState<ProposeData | null>(null)
   const [loading, setLoading] = useState(false)
   const [activeTab, setActiveTab] = useState('process') // Default to process per image
   const [isApproving, setIsApproving] = useState(false)
   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
   const [approveModal, setApproveModal] = useState<{ isOpen: boolean; type: 'approve' | 'reject' }>({
      isOpen: false,
      type: 'approve'
   })
   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
   const [signingMethod, setSigningMethod] = useState<string>('')
   const [isConfirmed, setIsConfirmed] = useState(false)
   const [isPopoverOpen, setIsPopoverOpen] = useState(false)

   const [selectedFileIndex, setSelectedFileIndex] = useState(0)



   useEffect(() => {
      if (isOpen && proposeId) {
         setData(null)
         setSelectedFileIndex(0)
         setActiveTab('process')
         fetchDetail(proposeId)
      } else if (!isOpen) {
         setData(null)
      }
   }, [isOpen, proposeId])

   const fetchDetail = async (id: string) => {
      setLoading(true)
      try {
         const res = await dexuatAxios.getDetail(id)
         if (res.status) {
            setData(res.data)
         }
      } catch (error) {
         console.error('Error fetching propose detail:', error)
         toast('Lỗi', { description: 'Không thể tải chi tiết đề xuất', variant: 'danger' })
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

   const handleCommentSuccess = () => {
      if (data?.id_de_xuat) {
         fetchDetail(data.id_de_xuat)
         onReload?.()
      }
   }




   return (
      <Modal
         isOpen={isOpen}
         onOpenChange={onOpenChange}
         size="full"
         scrollBehavior="inside"
         classNames={{
            base: 'bg-white dark:bg-gray-900',
            wrapper: 'z-[100]',
            header: 'p-0 border-b border-gray-200 dark:border-gray-800',
            body: 'p-0 overflow-hidden flex flex-col',
            closeButton: 'hidden' // Manual close button in header
         }}
         motionProps={{
            variants: {
               enter: { y: 0, opacity: 1, transition: { duration: 0.3 } },
               exit: { y: 20, opacity: 0, transition: { duration: 0.2 } }
            }
         }}
      >
         <ModalContent>
            {(onClose) => (
               <>
                  <ModalHeader className="flex flex-col gap-0 border-b border-gray-200 dark:border-gray-800">
                     {/* Top Row */}
                     <div className="flex items-center justify-between px-6 h-16 bg-white dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                           <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                              {data?.tieu_de || 'ĐANG TẢI...'} - <span className="text-gray-400 font-medium lowercase tracking-normal">{date('d/m/Y, H:i', data?.created_at || '')}</span>
                           </h1>
                        </div>
                        <div className="flex items-center gap-3">
                           {(() => {
                              if (!data) return null
                              const isCreator = user?.ql_nguoi_dung_id === data.created_user_id
                              const canEdit = isCreator && (
                                 (['nhap', 'tu_choi'].includes(data.trang_thai || '')) ||
                                 (data.quy_trinh || []).some((step: any) =>
                                    (step.nguoi_duyet || []).every((a: any) => a.da_duyet === null)
                                 )
                              )

                              return canEdit && (
                                 <Button
                                    size="md"
                                    variant="flat"
                                    color="secondary"
                                    onPress={() => setIsEditModalOpen(true)}
                                    className="font-bold text-[13px] h-10"
                                    startContent={<FileText size={18} />}
                                 >
                                    Chỉnh sửa
                                 </Button>
                              )
                           })()}
                           <Button
                              size="md"
                              variant="bordered"
                              className="border-gray-300 dark:border-gray-600 font-bold text-[13px] h-10"
                              startContent={<FileDown size={18} />}
                              onPress={() => {
                                 const file = data?.file_dinh_kem?.[selectedFileIndex]
                                 if (file) window.open(getFileUrl(file.duong_dan), '_blank')
                              }}
                           >
                              Tải tài liệu
                           </Button>
                           <Button isIconOnly size="md" variant="light" className="rounded-full" onPress={onClose}>
                              <X size={22} />
                           </Button>
                        </div>
                     </div>

                     {/* Second Row */}
                     <div className="flex items-center justify-between px-6 h-14 bg-gray-50/80 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-[13px] text-gray-500 font-medium truncate max-w-md">
                           Tên tài liệu: <span className="text-gray-700 dark:text-gray-300 font-bold">
                              {data?.file_dinh_kem?.[selectedFileIndex]?.ten_file_goc || data?.tieu_de}
                           </span>
                        </div>


                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 shadow-sm">
                           <span className="text-[13px] text-gray-500 font-medium">Số tài liệu trong lô</span>
                           <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-3">
                              <ChevronLeft
                                 size={18}
                                 className={`${selectedFileIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 cursor-pointer hover:scale-110'} transition-transform`}
                                 onClick={() => selectedFileIndex > 0 && setSelectedFileIndex(selectedFileIndex - 1)}
                              />
                              <span className="text-[14px] font-bold">{selectedFileIndex + 1}</span>
                              <span className="text-[14px] text-gray-400">/ {data?.file_dinh_kem?.length || 0}</span>
                              <ChevronRight
                                 size={18}
                                 className={`${selectedFileIndex === (data?.file_dinh_kem?.length || 1) - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 cursor-pointer hover:scale-110'} transition-transform`}
                                 onClick={() => data?.file_dinh_kem && selectedFileIndex < data.file_dinh_kem.length - 1 && setSelectedFileIndex(selectedFileIndex + 1)}
                              />
                           </div>
                        </div>
                     </div>
                  </ModalHeader>

                  <ModalBody className="p-0 flex gap-0 flex-col overflow-hidden">
                     <div className="flex flex-1 overflow-hidden relative">
                        {/* Far-Left Icon Bar */}
                        <div className="w-12 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col items-center py-4 gap-4 z-20 shrink-0">
                           <IconButton icon={<Layers size={20} />} active={activeTab === 'process'} onClick={() => { setActiveTab('process'); setIsSidebarExpanded(true); }} />
                           <IconButton icon={<MessageSquare size={20} />} active={activeTab === 'discussion'} onClick={() => { setActiveTab('discussion'); setIsSidebarExpanded(true); }} />
                           <IconButton icon={<Info size={20} />} active={activeTab === 'info'} onClick={() => { setActiveTab('info'); setIsSidebarExpanded(true); }} />
                           <IconButton icon={<Settings size={20} />} />
                        </div>

                        {/* Left Sidebar Panel (Expandable) */}
                        {isSidebarExpanded && (
                           <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col transition-all">
                              <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3">
                                 <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    {activeTab === 'process' ? 'Trình tự xử lý:' : activeTab === 'discussion' ? 'Thảo luận:' : 'Thông tin:'}
                                 </span>
                                 <Button isIconOnly size="sm" variant="light" onClick={() => setIsSidebarExpanded(false)}>
                                    <X size={14} />
                                 </Button>
                              </div>

                              <ScrollShadow className="flex-1 custom-scrollbar">
                                 {activeTab === 'process' && (
                                    <div className="p-4 space-y-4">
                                       <Button
                                          size="sm"
                                          fullWidth
                                          variant="bordered"
                                          className="h-9 border-gray-300 dark:border-gray-600 font-bold text-xs"
                                          startContent={<Printer size={16} />}
                                       >
                                          Xuất PDF
                                       </Button>

                                       <ProposeWorkflowTimeline
                                          creator={{
                                             name: data?.nguoi_tao || '',
                                             avatar: data?.avatar_nguoi_tao,
                                             unit: `Người khởi tạo • Mã NV: ${data?.ma_nhan_vien_tao}`,
                                             time: data?.created_at,
                                             statusLabel: 'ĐÃ GỬI'
                                          }}
                                           steps={(data?.quy_trinh || []).map((step: any) => ({
                                              level: step.cap_duyet,
                                              unitName: step.ten_don_vi || `Cấp ${step.cap_duyet}`,
                                              approvers: (step.nguoi_duyet || []).map((approver: any) => ({
                                                 id: approver.id_nguoi_duyet_de_xuat,
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
                                       />
                                    </div>
                                 )}

                                 {activeTab === 'discussion' && (
                                    <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative overflow-hidden">
                                       <ScrollShadow className="flex-1 p-4 pb-24 custom-scrollbar">
                                          <ProposeCommentList
                                             data={data?.binh_luan || []}
                                             idDeXuat={data?.id_de_xuat || ''}
                                             onReload={handleCommentSuccess}
                                          />
                                       </ScrollShadow>
                                       <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
                                          <ProposeCommentInput
                                             idDeXuat={data?.id_de_xuat || ''}
                                             onSuccess={handleCommentSuccess}
                                          />
                                       </div>
                                    </div>
                                 )}

                                 {activeTab === 'info' && (
                                    <div className="p-4 space-y-6">
                                       {/* User Info Section */}
                                       <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                          <UserAvatar
                                             name={data?.nguoi_de_xuat || 'User'}
                                             src={data?.avatar_nguoi_de_xuat}
                                             size="md"
                                             className="w-12 h-12 ring-2 ring-blue-50 dark:ring-blue-900/30"
                                          />
                                          <div className="flex-1 min-w-0">
                                             <div className="flex flex-col">
                                                <span className="font-bold text-blue-700 dark:text-blue-400 text-[14px]">
                                                   {data?.nguoi_de_xuat}
                                                </span>
                                                <span className="text-gray-400 text-[11px] font-medium">
                                                   Mã NV: {data?.ma_nhan_vien_de_xuat || data?.ma_nhan_vien_tao}
                                                </span>
                                             </div>
                                             <div className="flex flex-wrap gap-1 mt-2">
                                                <div className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                                                   {data?.ten_loai_de_xuat || 'Hành chính'}
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="space-y-4">
                                          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                                             <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tiêu đề đề xuất</span>
                                                <p className="text-[14px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                                   {data?.tieu_de}
                                                </p>
                                             </div>
                                             
                                             <div className="flex flex-col gap-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nội dung chi tiết</span>
                                                <div 
                                                   className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none rich-text-content p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800"
                                                   dangerouslySetInnerHTML={{ __html: data?.noi_dung || '' }}
                                                />
                                             </div>

                                             <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="flex flex-col gap-1">
                                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Ngày tạo</span>
                                                   <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                                      {date('d/m/Y H:i', data?.created_at || '')}
                                                   </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Điện thoại</span>
                                                   <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                                      {data?.phone || 'N/A'}
                                                   </span>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </ScrollShadow>
                           </div>
                        )}

                        {/* Main Document Viewer area */}
                        <div className="flex-1 bg-gray-100 dark:bg-gray-950 flex flex-col items-center p-8 overflow-auto custom-scrollbar">
                           <div className="bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-5xl min-h-[1200px] flex flex-col relative">
                              {loading ? (
                                 <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-medium text-gray-500">Đang chuẩn bị tài liệu...</p>
                                 </div>
                              ) : data?.file_dinh_kem && data.file_dinh_kem[selectedFileIndex] ? (
                                 (() => {
                                    const file = data.file_dinh_kem[selectedFileIndex]
                                    const fileUrl = getFileUrl(file.duong_dan)
                                    const fileName = (file.ten_file_goc || '').toLowerCase()
                                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(fileName)
                                    const isPdf = fileName.endsWith('.pdf')

                                    if (isImage) {
                                       return <img src={fileUrl} alt="Document Preview" className="w-full h-auto object-contain" />
                                    }

                                    if (isPdf) {
                                       return <iframe src={`${fileUrl}#toolbar=0`} className="w-full flex-1 min-h-[1200px] border-none" title="PDF Preview" />
                                    }

                                    // Office files viewer using Microsoft Office Online Viewer
                                    const isOffice = /\.(docx|doc|xlsx|xls|pptx|ppt)$/.test(fileName)
                                    if (isOffice) {
                                       const encodedUrl = encodeURIComponent(fileUrl || '')
                                       return (
                                          <iframe 
                                             src={`https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`} 
                                             className="w-full flex-1 min-h-[1200px] border-none" 
                                             title="Office Preview" 
                                          />
                                       )
                                    }

                                    // Fallback for other file types
                                    return (
                                       <div className="flex-1 flex flex-col items-center justify-center p-20 gap-6 text-center">
                                          <OfficeIcon name={fileName} size={120} />
                                          <div className="space-y-2">
                                             <h3 className="text-xl font-bold">{file.ten_file_goc}</h3>
                                             <p className="text-gray-500 max-w-md mx-auto">Tài liệu văn phòng được đính kèm. Bạn có thể tải về để xem chi tiết.</p>
                                          </div>
                                          <Button
                                             color="primary"
                                             variant="solid"
                                             className="font-bold h-12 px-8"
                                             startContent={<Download size={20} />}
                                             onClick={() => window.open(fileUrl, '_blank')}
                                          >
                                             Tải tài liệu ngay
                                          </Button>
                                       </div>
                                    )
                                 })()
                              ) : (
                                 <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <FileText size={64} className="text-gray-200" />
                                    <div className="text-center">
                                       <p className="text-lg font-bold text-gray-400">Không có tài liệu hiển thị</p>
                                       <p className="text-sm text-gray-400">Đề xuất này chưa có tệp đính kèm hoặc tệp không hỗ trợ xem trước.</p>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Right Thumbnail Sidebar */}
                        <div className="w-48 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-3 hidden xl:flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                           {data?.file_dinh_kem?.map((file, idx) => {
                              const fileUrl = getFileUrl(file.duong_dan)
                              const fileName = (file.ten_file_goc || '').toLowerCase()
                              const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(fileName)
                              const isActive = selectedFileIndex === idx

                              return (
                                 <motion.div
                                    key={idx}
                                    onClick={() => setSelectedFileIndex(idx)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`aspect-[1/1.4] border-2 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm flex flex-col items-center justify-center p-2 group cursor-pointer relative transition-all
                                 ${isActive ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-blue-300'}`}
                                 >
                                    {isImage ? (
                                       <img src={fileUrl} className="w-full h-full object-cover rounded-md shadow-sm" alt="Thumbnail" />
                                    ) : (
                                       <div className="flex flex-col items-center justify-center h-full w-full gap-2 px-1 text-center">
                                          <OfficeIcon name={fileName} size={32} />
                                          <div className="w-full px-1">
                                             <p className="text-[9px] text-gray-500 font-medium break-all line-clamp-2 leading-tight">
                                                {file.ten_file_goc}
                                             </p>
                                          </div>
                                       </div>
                                    )}
                                 </motion.div>
                              )
                           })}
                        </div>
                     </div>

                      <div className="h-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-8 shadow-lg">
                         <div className="flex items-center gap-2">
                            <Checkbox
                               size="md"
                               color="primary"
                               isSelected={isConfirmed}
                               onValueChange={setIsConfirmed}
                            >
                               <span className="text-[14px] font-medium text-gray-600 dark:text-gray-400">
                                  Tôi xác nhận đã kiểm tra kỹ nội dung và đồng ý <span className="text-blue-600 font-bold underline cursor-pointer">phê duyệt văn bản</span> này
                               </span>
                            </Checkbox>
                         </div>

                         <div className="flex items-center gap-4">
                            <Button
                               size="lg"
                               variant="bordered"
                               className="h-11 border-blue-600 text-blue-600 bg-transparent font-bold text-[14px] px-6"
                               onPress={onClose}
                            >
                               {data?.can_approve ? 'Xem lại sau' : 'Đóng'}
                            </Button>
                            
                            {(data?.can_approve === 1 || data?.can_approve === '1') && (
                               <>
                                 <Button
                                    size="lg"
                                    variant="bordered"
                                    color="danger"
                                    className="h-11 font-bold text-[14px] px-6"
                                    onPress={() => setApproveModal({ isOpen: true, type: 'reject' })}
                                    isDisabled={!isConfirmed}
                                 >
                                    Từ chối
                                 </Button>

                                 <Popover placement="top" showArrow isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverTrigger>
                                       <Button
                                          size="lg"
                                          color="primary"
                                          className="h-11 font-bold text-[15px] px-8 shadow-lg shadow-blue-500/30"
                                          isDisabled={!isConfirmed}
                                       >
                                          Duyệt đề xuất
                                       </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-2">
                                       <Button
                                          variant="light"
                                          className="w-full justify-start h-auto py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 data-[hover=true]:bg-gray-50 dark:data-[hover=true]:bg-gray-700"
                                          onPress={() => {
                                             setSigningMethod('pin')
                                             setApproveModal({ isOpen: true, type: 'approve' })
                                             setIsPopoverOpen(false)
                                          }}
                                          startContent={
                                             <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                <KeyRound size={18} />
                                             </div>
                                          }
                                       >
                                          <div className="flex flex-col items-start min-w-0">
                                             <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Ký xác thực bằng mã PIN</span>
                                             <span className="text-[10px] text-gray-400">Xác thực nhanh bằng 6 chữ số</span>
                                          </div>
                                       </Button>

                                       <Button
                                          variant="light"
                                          className="w-full justify-start h-auto py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 data-[hover=true]:bg-gray-50 dark:data-[hover=true]:bg-gray-700"
                                          onPress={() => {
                                             setSigningMethod('otp')
                                             setApproveModal({ isOpen: true, type: 'approve' })
                                             setIsPopoverOpen(false)
                                          }}
                                          startContent={
                                             <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                                <Mail size={18} />
                                             </div>
                                          }
                                       >
                                          <div className="flex flex-col items-start min-w-0">
                                             <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Duyệt qua Email OTP</span>
                                             <span className="text-[10px] text-gray-400">Nhận mã xác thực qua Email</span>
                                          </div>
                                       </Button>
                                    </PopoverContent>
                                 </Popover>
                               </>
                            )}
                         </div>
                      </div>
                  </ModalBody>
               </>
            )}
         </ModalContent>

         <ApproveModal
            isOpen={approveModal.isOpen}
            onClose={() => setApproveModal((prev) => ({ ...prev, isOpen: false }))}
            onConfirm={handleApproveAction}
            isReject={approveModal.type === 'reject'}
            isLoading={isApproving}
            verificationType={approveModal.type === 'approve' && (signingMethod === 'pin' || signingMethod === 'otp') ? (signingMethod as 'pin' | 'otp') : 'none'}
            entityId={data?.id_de_xuat}
         />

         {isEditModalOpen && data && (
            <CreateProposeModal
               isOpen={isEditModalOpen}
               onOpenChange={setIsEditModalOpen}
               editingData={data}
               onSuccess={() => {
                  fetchDetail(data.id_de_xuat)
                  onReload?.()
               }}
            />
         )}
      </Modal>
   )
}

function IconButton({ icon, active, onClick }: { icon: React.ReactNode; active?: boolean; onClick?: () => void }) {
   return (
      <Tooltip content="Mở rộng" placement="right">
         <div
            onClick={onClick}
            className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all
          ${active
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
         >
            {icon}
         </div>
      </Tooltip>
   )
}


