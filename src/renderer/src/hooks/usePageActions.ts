import { ReactNode, useEffect } from 'react'
import { usePageActionsStore } from '@renderer/store/usePageActionsStore'

/**
 * Hook để đăng ký các nút/actions hiển thị trên thanh tiêu đề trang (MainLayout).
 * Trang nào cần nút thì gọi hook này, trang nào không gọi thì slot sẽ trống.
 *
 * @example
 * usePageActions(
 *   <Button color="primary" onPress={handleCreate}>
 *     <Plus size={16} /> Thêm mới
 *   </Button>
 * )
 */
export function usePageActions(actions: ReactNode) {
    const { setActions, clearActions } = usePageActionsStore()

    useEffect(() => {
        setActions(actions)
        return () => clearActions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
