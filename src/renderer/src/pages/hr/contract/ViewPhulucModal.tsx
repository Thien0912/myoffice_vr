import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Chip,
  useDisclosure
} from '@heroui/react'
import { hopdongAxios } from '@renderer/api/hr/hopdongAxios'
import { FileText, Calendar, User, Plus, ChevronDown, Wallet, Paperclip } from 'lucide-react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
import FormPhuluc from './FormPhuluc'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'

// Helper to format date
const formatDate = (dateString: string | null, displayTime: boolean = false) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (displayTime) {
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const day = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    return `${time} - ${day}`
  }
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(amount)
  )
}

export default function ViewPhulucModal({
  isOpen,
  onOpenChange,
  contractId,
  contractData,
  onChangeData
}: {
  isOpen: boolean
  onOpenChange: (o: boolean) => void
  contractId: string | number | null
  contractData?: any
  onChangeData?: (data?: any) => void
}) {
  const [phulucs, setPhulucs] = useState<any[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  const [loading, setLoading] = useState(false)

  // Drawer state
  const { isOpen: isDrawerOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})

  const onFilesChange = (name: string, files: File[]) => {
    setFileGroups((prev) => ({ ...prev, [name]: files }))
  }

  const fetchPhuluc = async () => {
    if (!contractId) return
    setLoading(true)
    try {
      const res = await hopdongAxios.xemphuluc(contractId)
      if (res.success && res.data) {
        setPhulucs(res.data)
      } else {
        setPhulucs([])
      }
    } catch (error) {
      console.error('Failed to fetch phuluc:', error)
      setPhulucs([])
    } finally {
      setLoading(false)
    }
  }

  // Preview file
  const handlePreview = async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      openPopout(link, name)
    }
  }

  useEffect(() => {
    // console.log('contractData:', contractData)
    setFormData({
      ...formData,
      id_hop_dong: contractData?.id_hop_dong || '',
      ten_phu_luc: formData?.ten_phu_luc || 'Phụ Lục Hợp Đồng Lao Động'
    })

    if (isOpen && contractId) {
      fetchPhuluc()
    } else {
      setPhulucs([])
    }
  }, [isOpen, contractId])

  const handleAddClick = () => {
    setFormData({})
    setFileGroups({})
    onOpenDrawer()
    onOpenChange(false)
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        backdrop="opaque"
        classNames={{
          body: 'p-0 bg-slate-50',
          header: 'border-b border-gray-100 py-3',
          footer: 'border-t border-gray-100 bg-white py-2'
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span>Danh sách phụ lục hợp đồng</span>
                    <span className="text-small font-normal text-gray-500">
                      Chi tiết các phụ lục đính kèm theo hợp đồng
                    </span>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-0 bg-slate-50 min-h-[350px]">
                <div className="p-3 flex flex-col gap-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg"
                      >
                        <Skeleton className="rounded-lg w-10 h-10" />
                        <div className="w-full gap-2 flex flex-col">
                          <Skeleton className="h-3 w-3/5 rounded-lg" />
                          <Skeleton className="h-3 w-4/5 rounded-lg" />
                        </div>
                      </div>
                    ))
                  ) : phulucs.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <FileText size={32} />
                      </div>
                      <p>Không có phụ lục nào</p>
                    </div>
                  ) : (
                    phulucs.map((item) => {
                      const isExpanded = expandedIds.has(item.id_hop_dong_phu_luc)
                      const hasAllowances = item.phu_cap && item.phu_cap.length > 0

                      return (
                        <div
                          key={item.id_hop_dong_phu_luc}
                          className={`flex flex-col bg-white border rounded-lg shadow-sm transition-all ${
                            isExpanded
                              ? 'border-blue-400 ring-1 ring-blue-100'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div
                            className={`p-4 flex flex-col gap-2 ${hasAllowances ? 'cursor-pointer' : ''}`}
                            onClick={() => hasAllowances && toggleExpand(item.id_hop_dong_phu_luc)}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                {hasAllowances && (
                                  <div
                                    className={`mt-1 text-gray-400 transition-transform duration-200 ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  >
                                    <ChevronDown size={20} />
                                  </div>
                                )}
                                <div className="flex flex-col gap-1 flex-1">
                                  <h4 className="font-semibold text-gray-800 text-base">
                                    {item.ten_phu_luc}
                                  </h4>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={14} className="text-gray-400" />
                                      Ngày ký:{' '}
                                      <span className="text-gray-700 font-medium">
                                        {formatDate(item.ngay_ky_phu_luc)}
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar size={14} className="text-gray-400" />
                                      Hiệu lực:{' '}
                                      <span className="text-gray-700 font-medium">
                                        {formatDate(item.ngay_hieu_luc)}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={item.trang_thai === '1' ? 'success' : 'warning'}
                              >
                                {item.trang_thai === '1' ? 'Đang hiệu lực' : 'Hết hiệu lực'}
                              </Chip>
                            </div>

                            <div className="h-px bg-gray-100 my-1"></div>

                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                <span>Người tạo: {item.ten_nguoi_tao}</span>
                              </div>
                              <span>{formatDate(item.created_at, true)}</span>
                            </div>
                          </div>

                          {/* Collapsible Content with Animation */}
                          <AnimatePresence initial={false}>
                            {isExpanded && hasAllowances && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0">
                                  <div className="bg-slate-50 border border-slate-50 rounded-md">
                                    <div className="p-3 flex flex-col gap-2">
                                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                                        <Wallet size={16} className="text-blue-500" />
                                        <span>Danh sách phụ cấp kèm theo</span>
                                      </div>
                                      <div className="grid grid-cols-1 gap-2">
                                        {item.phu_cap.map((pc: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className="flex justify-between items-center text-sm p-2.5 bg-white rounded border border-slate-200 shadow-sm"
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium text-slate-700">
                                                {pc.ten_phu_cap}
                                              </span>
                                              <span className="text-xs text-slate-400">
                                                Mã: {pc.ma_phu_cap}
                                              </span>
                                            </div>
                                            <span className="font-semibold text-emerald-600">
                                              {formatCurrency(pc.so_tien)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {item.file_phu_luc?.length > 0 && (
                                      <div className="flex flex-col">
                                        <div className="flex items-center p-3">
                                          <Paperclip size={16} className="text-blue-500" />
                                          <span>File đính kèm</span>
                                        </div>
                                        <div className="flex gap-1 px-3 py-2">
                                          {item.file_phu_luc.map((f, index) => (
                                            <Chip
                                              key={f.file_name + index}
                                              size="sm"
                                              className="text-xs bg-transparent border-1 border-gray-300 p-1 mr-1 cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handlePreview(f.file_path, f.file_name)
                                              }}
                                            >
                                              <div className="flex gap-2">
                                                <OfficeIcon name={f.file_name} size={14} />
                                                <span className="text-gray-600">{f.file_name}</span>
                                              </div>
                                            </Chip>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-100 bg-white">
                <Button variant="light" onPress={onClose}>
                  Đóng
                </Button>
                <Button color="primary" onPress={handleAddClick} startContent={<Plus size={18} />}>
                  Thêm phụ lục
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Drawer for Adding Phuluc */}
      <DrawerCommon
        title="Phụ lục hợp đồng"
        open={isDrawerOpen}
        onClose={onCloseDrawer}
        handleSubmitApi={(_id, data) => hopdongAxios.themphuluc(data!)}
        formData={formData}
        fileGroups={fileGroups}
        onSubmitSuccess={(res) => {
          fetchPhuluc() // Refresh list

          if (res && res.success && res.data?.id_hop_dong) {
            onChangeData?.(res)
          }
        }}
      >
        <FormPhuluc
          formData={formData}
          setFormData={setFormData}
          onFilesChange={onFilesChange}
          contractData={contractData}
        />
      </DrawerCommon>
    </>
  )
}
