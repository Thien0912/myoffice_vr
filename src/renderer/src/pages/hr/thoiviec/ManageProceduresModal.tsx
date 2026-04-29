/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import { Button, Modal, Spinner } from '@heroui-v3/react'
import { thuTucAxios } from '@renderer/api/danhmuc/thuTucAxios'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import TableHr from '@renderer/components/table/TableHr'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { toast } from "@heroui-v3/react";

export default function ManageProceduresModal({
  isOpen,
  onOpenChange
}: {
  isOpen: boolean
  onOpenChange: (o: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [newProcedureName, setNewProcedureName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const { data: proceduresData, isLoading } = useQuery({
    queryKey: ['procedures'],
    queryFn: async () => {
      const res = await thuTucAxios.fetch({ start: 0, length: 9999 })
      return res?.data || []
    },
    enabled: isOpen
  })

  const handleAdd = async () => {
    if (!newProcedureName.trim()) return

    setIsAdding(true)
    try {
      const res = await thuTucAxios.create({ ten_thu_tuc: newProcedureName })
      if (res.data?.success === false) {
        toast('Lỗi', { description: res.data.message || 'Có lỗi xảy ra', variant: 'danger' })
        return
      }
      toast('Thành công', { description: 'Thêm thủ tục thành công', variant: 'success' })
      setNewProcedureName('')
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
    } catch (error: any) {
      toast('Lỗi', { description: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm thủ tục', variant: 'danger' })
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdate = async (id: string | number, name: string) => {
    try {
      const res = await thuTucAxios.update(id, { ten_thu_tuc: name })
      if (res.data?.success === false) {
        toast('Lỗi', { description: res.data.message || 'Có lỗi xảy ra', variant: 'danger' })
        // Revert change if update failed
        queryClient.invalidateQueries({ queryKey: ['procedures'] })
        return
      }
      toast('Thành công', { description: 'Cập nhật thủ tục thành công', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
    } catch (error: any) {
      toast('Lỗi', { description: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật thủ tục', variant: 'danger' })
      // Revert change if update failed
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
    }
  }

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (id: string | number) => {
    setDeletingId(id)
    setConfirmModalOpen(true)
  }

  const handleDeletes = async () => {
    if (selectedKeys.size === 0) return
    setDeletingId(null) // Reset single delete ID
    setConfirmModalOpen(true)
  }

  const onConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      let res
      if (deletingId) {
        res = await thuTucAxios.delete(deletingId)
      } else if (selectedKeys.size > 0) {
        res = await thuTucAxios.deleteMultiple(Array.from(selectedKeys))
      } else {
        return
      }

      if (res.success === false) {
        toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
        setConfirmModalOpen(false)
        return
      }
      toast('Thành công', { description: 'Xóa thủ tục thành công', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
      setConfirmModalOpen(false)
      setSelectedKeys(new Set([])) // Clear selection
    } catch (error: any) {
      toast('Lỗi', { description: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa thủ tục', variant: 'danger' })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: TableColumnType[] = useMemo(
    () => [
      {
        uid: 'stt',
        name: 'STT',
        width: 30,
        className: 'text-center'
      },
      {
        uid: 'ten_thu_tuc',
        name: 'Tên thủ tục',
        editable: true
      },
      {
        uid: 'actions',
        name: '',
        width: 50,
        className: 'text-center',
        sortable: false,
        disablePinning: true,
        render: (_, row: any) => (
          <div className="flex justify-center">
            <Button
              isIconOnly
              size="sm"
              variant="danger-soft"
              onPress={() => handleDelete(row.id_tttv)}
            >
              <Trash size={16} />
            </Button>
          </div>
        )
      }
    ],
    []
  )

  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog>
              <Modal.Header className="flex flex-col gap-1">
                <Modal.Heading>Quản lý danh sách thủ tục</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="gap-4">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <InputFloatingLabel
                      label="Tên thủ tục mới"
                      placeholder=" "
                      value={newProcedureName}
                      onChange={setNewProcedureName}
                      radius="sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd()
                      }}
                    />
                  </div>
                  <Button
                    variant="primary"
                    className="h-10 rounded"
                    onPress={handleAdd}
                    isDisabled={isAdding || !newProcedureName.trim()}
                  >
                    {isAdding ? <Spinner size="sm" /> : <Plus size={18} />}
                    Thêm
                  </Button>
                </div>

                {selectedKeys.size > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onPress={handleDeletes}
                    >
                      <Trash size={16} />
                      Xóa {selectedKeys.size} mục đã chọn
                    </Button>
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg relative">
                  <TableHr
                    columns={columns}
                    data={proceduresData || []}
                    isLoading={isLoading}
                    primaryKey="id_tttv"
                    editable={true}
                    enableResizing={false}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    onRowChange={(id, col, val) => {
                      if (col === 'ten_thu_tuc') {
                        // Only update if value is not empty
                        if (val && String(val).trim().length > 0) {
                          handleUpdate(id, val)
                        } else {
                          toast('Cảnh báo', { description: 'Tên thủ tục không được để trống', variant: 'warning' })
                          // Revert change by invalidating queries to fetch old data
                          queryClient.invalidateQueries({ queryKey: ['procedures'] })
                        }
                      }
                    }}
                    onRowContextMenu={(e) => {
                      e.preventDefault()
                      // Implement context menu logic here if needed
                    }}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={() => onOpenChange(false)}>
                  Đóng
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content={
          deletingId
            ? 'Bạn có chắc chắn muốn xóa thủ tục này? Hành động này không thể hoàn tác.'
            : `Bạn có chắc chắn muốn xóa ${selectedKeys.size} thủ tục đã chọn? Hành động này không thể hoàn tác.`
        }
        isDanger
        isLoading={isDeleting}
      />
    </>
  )
}
