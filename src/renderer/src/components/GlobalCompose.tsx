
import { vanbandenAxios } from '@renderer/api/documents/vanbandenAxios'
import { vanbandiAxios } from '@renderer/api/documents/vanbandiAxios'
import { vanbandidonviAxios } from '@renderer/api/documents/vanbandidonviAxios'
import { vanbannoiboAxios } from '@renderer/api/documents/vanbannoiboAxios'
import MinimizedDock from '@renderer/components/MinimizedDock'
import MinimizedMore from '@renderer/components/MinimizedMore'
import { queryClient } from '@renderer/lib/queryClient'
import FormVanbanden from '@renderer/pages/document/components/form/FormVanbanden'
import FormVanbandi from '@renderer/pages/document/components/form/FormVanbandi'
import FormVanbandidonvi from '@renderer/pages/document/components/form/FormVanbandidonvi'
import FormVanbannoibo from '@renderer/pages/document/components/form/FormVanbannoibo'
import ModalCompose from '@renderer/pages/document/components/modal/ModalCompose'
import { saoChepTinNhanZalo } from '@renderer/pages/document/VanbandiPage'
import { useComposeStore } from '@renderer/store/useComposeStore'
import axios from 'axios'
import { toast } from '@heroui-v3/react'

export default function GlobalCompose() {
    const { items, onClose, onMinimize, onRestore, setFormData, setFileGroups } = useComposeStore()

    if (!items || items.length === 0) return null

    // Lấy danh sách các item đang thu nhỏ
    const minimizedItems = items.filter((item) => item.isMinimized)
    const visibleMinimized = minimizedItems.slice(0, 2)
    const overflowMinimized = minimizedItems.slice(2)

    return (
        <>
            {/* Render all Modals */}
            {items.map((item) => {
                const handleFilesChange = (name: string, files: File[]) => {
                    setFileGroups(item.id, { [name]: files })
                }

                const handleSetFormData = (val: any) => {
                    setFormData(item.id, val)
                }

                let title = ''
                let queryKey: string[] = []
                let handleSubmit: (_id: any, data: any) => Promise<any>
                let FormComponent: any

                switch (item.type) {
                    case 'vanbanden':
                        title = 'Văn bản đến'
                        queryKey = ['vanbanden']
                        handleSubmit = (_id: any, data: any) => vanbandenAxios.create(data)
                        FormComponent = FormVanbanden
                        break
                    case 'vanbandi':
                        title = 'Văn bản đi'
                        queryKey = ['vanbandi']
                        handleSubmit = (_id: any, data: any) => vanbandiAxios.create(data)
                        FormComponent = FormVanbandi
                        break
                    case 'vanbannoibo':
                        title = 'Văn bản nội bộ'
                        queryKey = ['vanbannoibo']
                        handleSubmit = (_id: any, data: any) => vanbannoiboAxios.create(data)
                        FormComponent = FormVanbannoibo
                        break
                    case 'vanbandidonvi':
                        title = 'Văn bản đi đơn vị'
                        queryKey = ['vanbandidonvi']
                        handleSubmit = (_id: any, data: any) => vanbandidonviAxios.create(data)
                        FormComponent = FormVanbandidonvi
                        break
                    default:
                        return null
                }

                return (
                    <ModalCompose
                        key={item.id}
                        title={title}
                        isOpenCompose={item.isOpen}
                        onClose={() => onClose(item.id)}
                        onMinimize={() => onMinimize(item.id)}
                        size="5xl"
                        handleSubmitApi={handleSubmit}
                        fileGroups={item.fileGroups}
                        onSubmitSuccess={(response) => {
                            // console.log('response: ', response)
                            // Gửi tin nhắn tự động qua nhóm Zalo
                            axios
                                .post('https://n8n.sandboxnctu.qzz.io/webhook/send-zalo-message', {
                                    id_van_ban: response.data.id_van_ban,
                                    trich_yeu: response.data.trich_yeu_tuy_chinh,
                                    ds_don_vi_nhan: response.data.ds_don_vi_nhan,
                                    ql_thong_bao_link: response.data.ql_thong_bao_link,
                                    send_mail: response.send_mail

                                })
                                .then((res) => {
                                    if (res.data?.success === true) {
                                        setTimeout(() => {
                                            toast.success('Thành công', {
                                                description: res.data.message
                                            })
                                        }, 2000)
                                    }
                                })
                                .catch((error) => {
                                    const message = error?.response?.data?.message || 'Please call IT'

                                    toast.danger('Lỗi', {
                                        description: message
                                    })
                                })

                            // console.log('response: ', response)
                            if (response.send_mail && (!response.time_send_mail || response.time_send_mail === 'NGAY') && window.location.hostname == 'myoffice.nctu.edu.vn') {
                                // if (response.send_mail) {
                                axios
                                    .post('https://n8n.sandboxnctu.qzz.io/webhook/gui-mail-van-ban', {
                                        // .post('https://n8n.sandboxnctu.qzz.io/webhook-test/gui-mail-van-ban', {
                                        id_van_ban: response.data.id_van_ban
                                    })
                                    .then((res) => {
                                        if (res.data?.success === true) {
                                            setTimeout(() => {
                                                toast.success('Thành công', {
                                                    description: res.data.message
                                                })
                                            }, 2000)
                                        }
                                    })
                                    .catch((error) => {
                                        const message = error?.response?.data?.message || 'Please call IT'

                                        toast.danger('Lỗi', {
                                            description: message
                                        })
                                    })
                            }

                            if (response.noi_dung_tin_nhan_zalo && response.noi_dung_tin_nhan_zalo.length > 0) {
                                saoChepTinNhanZalo(response.noi_dung_tin_nhan_zalo)
                            }

                            queryClient.invalidateQueries({ queryKey })
                            onClose(item.id)
                        }}
                        formData={item.formData}
                    >
                        <FormComponent
                            onFilesChange={handleFilesChange}
                            formData={item.formData}
                            setFormData={handleSetFormData as any}
                            fileGroups={item.fileGroups}
                        />
                    </ModalCompose>
                )
            })}

            {/* Render Overflow Dock */}
            {overflowMinimized.length > 0 && (
                <MinimizedMore
                    items={overflowMinimized}
                    onRestore={onRestore}
                    onClose={onClose}
                    style={{
                        right: `40px`,
                        transition: 'right 0.3s ease-in-out'
                    }}
                />
            )}

            {/* Render Visible Docks */}
            {visibleMinimized.map((item, index) => {
                let title = ''
                switch (item.type) {
                    case 'vanbanden':
                        title = 'Văn bản đến'
                        break
                    case 'vanbandi':
                        title = 'Văn bản đi'
                        break
                    case 'vanbannoibo':
                        title = 'Văn bản nội bộ'
                        break
                    case 'vanbandidonvi':
                        title = 'Văn bản đi đơn vị'
                        break
                }

                // Nếu có dock "Xem thêm", các dock lẻ sẽ bắt đầu từ vị trí thứ 2 (340px)
                const hasMore = overflowMinimized.length > 0
                const rightOffset = (hasMore ? 340 : 40) + index * 300

                return (
                    <MinimizedDock
                        key={item.id}
                        title={`${title} (Đang soạn)`}
                        onRestore={() => onRestore(item.id)}
                        onClose={() => onClose(item.id)}
                        style={{
                            right: `${rightOffset}px`,
                            transition: 'right 0.3s ease-in-out'
                        }}
                    />
                )
            })}
        </>
    )
}
