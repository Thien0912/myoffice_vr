import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { thongbaoAxios } from '../../../api/thongbaoAxios'
import { getSmartNotificationLink } from '../../../utils/urlUtils'
import { Notification } from '../types'
import { useAuthStore } from '../../../store/useAuthStore'
import { NOTIFICATION_REQUIRED_PERMISSIONS } from '../constants'
import { ROUTES } from '../../../routes/route'
import { toast } from "@heroui-v3/react";

const checkLinkPermission = (link: string, userPermissions: string[] | undefined): boolean => {
  if (!link) return false
  
  const parsed = getSmartNotificationLink(link)
  const pathToCheck = parsed.split('?')[0].replace(/^\/|\/$/g, '')
  
  const findPerm = (routes: any[], currentPath: string): string[] | boolean | undefined => {
    let foundPerm: string[] | boolean | undefined = undefined

    for (const route of routes) {
      const fullPath = route.path ? (currentPath ? `${currentPath}/${route.path}` : route.path).replace(/^\/|\/$/g, '') : currentPath
      
      if (route.path !== undefined && pathToCheck.startsWith(fullPath) && fullPath.length > 0) {
        if (route.permission !== undefined) {
             foundPerm = route.permission
        }
      }
      
      if (route.children && route.children.length > 0) {
        const childPerm = findPerm(route.children, fullPath)
        if (childPerm !== undefined) {
          foundPerm = childPerm
        }
      }
    }
    return foundPerm
  }
  
  const requiredPerms = findPerm(ROUTES, '')
  
  if (requiredPerms === false || requiredPerms === undefined) {
    return true
  }
  
  if (Array.isArray(requiredPerms)) {
    return requiredPerms.some((p) => userPermissions?.includes(p))
  }
  
  return false
}

const ROWS_PER_PAGE = 20

export const useNotifications = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Filter States
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [selectedTab, setSelectedTab] = React.useState<string>('notifications')
  const [page, setPage] = React.useState(1)

  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)

  // Delete confirmation modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [deleteConfirmCount, setDeleteConfirmCount] = React.useState(0)

  // Reset selectedIds when page or filters change
  React.useEffect(() => {
    setSelectedIds([])
  }, [page, debouncedSearch, dateFrom, dateTo, selectedTab])

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Unread filter separate from tabs
  const [unreadOnly, setUnreadOnly] = React.useState(false)

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [search, dateFrom, dateTo, unreadOnly])

  const typeFilter = selectedTab === 'reminders' ? '2' : undefined
  const saoFilter = selectedTab === 'starred' ? '1' : undefined

  const {
    data: notificationData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: [
      'notifications',
      dateFrom,
      dateTo,
      debouncedSearch,
      typeFilter,
      saoFilter,
      unreadOnly,
      page
    ],
    queryFn: () =>
      thongbaoAxios.fetch({
        date_from: dateFrom,
        date_to: dateTo,
        search: debouncedSearch,
        ql_thong_bao_loai: typeFilter,
        ql_thong_bao_sao: saoFilter,
        ql_thong_bao_da_doc: unreadOnly ? '0' : undefined,
        page: page,
        per_page: ROWS_PER_PAGE
      }),
    placeholderData: keepPreviousData
  })

  // Xử lý id từ URL (ví dụ: /vanbandendonvi/5)
  React.useEffect(() => {
    const pathParts = location.pathname.split('/')
    const idFromUrl = pathParts[pathParts.length - 1]

    if (idFromUrl && !isNaN(Number(idFromUrl)) && notificationData?.data?.notifications) {
      const found = notificationData.data.notifications.find(
        (n: Notification) => n.ql_thong_bao_id === idFromUrl
      )
      if (found) {
        setSelectedNotification(found)
        setIsDetailOpen(true)
        // Xóa ID trên URL sau khi đã mở thành công và chuyển về trang thông báo
        navigate('/thongbao', { replace: true })
      }
    }
  }, [location.pathname, notificationData])

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      return thongbaoAxios.updateStatus(id, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Mutation for toggling star
  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, sao }: { id: string; sao: number }) => {
      return thongbaoAxios.updateStar(id, sao)
    },
    onMutate: async ({ id, sao }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        'notifications',
        dateFrom,
        dateTo,
        debouncedSearch,
        typeFilter,
        saoFilter,
        page
      ])

      // Optimistically update to the new value
      queryClient.setQueryData(
        ['notifications', dateFrom, dateTo, debouncedSearch, typeFilter, saoFilter, page],
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            data: {
              ...old.data,
              notifications: old.data.notifications.map((n: Notification) =>
                n.ql_thong_bao_id === id ? { ...n, ql_thong_bao_sao: String(sao) } : n
              )
            }
          }
        }
      )

      return { previousData }
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(
          ['notifications', dateFrom, dateTo, debouncedSearch, typeFilter, saoFilter, page],
          context.previousData
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success to guarantee we are in sync with the server
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Bulk update mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return thongbaoAxios.markAsRead(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setSelectedIds([])
      toast('Thành công', { description: 'Đã đánh dấu các thông báo đã chọn là đã đọc.', variant: 'success' })
    }
  })

  // Mark as unread mutation
  const markAsUnreadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return thongbaoAxios.markAsUnread(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setSelectedIds([])
      toast('Thành công', { description: 'Đã đánh dấu các thông báo đã chọn là chưa đọc.', variant: 'success' })
    }
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return thongbaoAxios.markAllAsRead()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setSelectedIds([])
      toast('Thành công', { description: 'Đã đánh dấu tất cả thông báo là đã đọc.', variant: 'success' })
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return thongbaoAxios.deleteNotifications(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setSelectedIds([])
      toast('Thành công', { description: 'Đã xóa các thông báo đã chọn.', variant: 'success' })
    },
    onError: () => {
      toast('Lỗi', { description: 'Xóa thông báo thất bại.', variant: 'danger' })
    }
  })

  const notifications: Notification[] = notificationData?.data?.notifications || []
  const totalItems = notificationData?.data?.countAllRecord || 0

  const handleNotificationClick = (notification: Notification) => {
    if (notification.ql_thong_bao_da_doc === '0') {
      updateStatusMutation.mutate({ id: notification.ql_thong_bao_id, status: 1 })
    }

    // Kiểm tra quyền dynamic dưa trên ROUTES match
    const isLinkAllowed = checkLinkPermission(notification.ql_thong_bao_link || '', user?.permissions)

    // Fallback nếu có trong NOTIFICATION_REQUIRED_PERMISSIONS
    const hasLegacyPermission = NOTIFICATION_REQUIRED_PERMISSIONS.some((p) => user?.permissions?.includes(p))

    if (notification.ql_thong_bao_link && (isLinkAllowed || hasLegacyPermission)) {
      const link = getSmartNotificationLink(notification.ql_thong_bao_link)
      navigate(link)
    } else {
      setSelectedNotification(notification)
      setIsDetailOpen(true)
    }
  }

  const handleToggleStar = (notification: Notification) => {
    const newStarStatus = notification.ql_thong_bao_sao === '1' ? 0 : 1
    toggleStarMutation.mutate({ id: notification.ql_thong_bao_id, sao: newStarStatus })
  }

  const selectUnread = () => {
    setSelectedIds(notifications.filter((n) => n.ql_thong_bao_da_doc === '0').map((n) => n.ql_thong_bao_id))
  }

  const selectRead = () => {
    setSelectedIds(notifications.filter((n) => n.ql_thong_bao_da_doc === '1').map((n) => n.ql_thong_bao_id))
  }

  const markAllViewedAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length && notifications.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(notifications.map((n) => n.ql_thong_bao_id))
    }
  }

  const markSelectedAsRead = () => {
    if (selectedIds.length > 0) {
      markAsReadMutation.mutate(selectedIds)
    }
  }

  const markSelectedAsUnread = () => {
    if (selectedIds.length > 0) {
      markAsUnreadMutation.mutate(selectedIds)
    }
  }

  const deleteSelected = () => {
    if (selectedIds.length > 0) {
      setDeleteConfirmCount(selectedIds.length)
      setIsDeleteConfirmOpen(true)
    }
  }

  const confirmDelete = () => {
    deleteMutation.mutate(selectedIds)
    setIsDeleteConfirmOpen(false)
  }

  const handleClearFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setUnreadOnly(false)
  }

  return {
    filters: {
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
      search,
      setSearch,
      selectedTab,
      setSelectedTab,
      unreadOnly,
      setUnreadOnly,
      page,
      setPage,
      handleClearFilters
    },
    selection: {
      selectedIds,
      toggleSelect,
      toggleSelectAll,
      selectUnread,
      selectRead,
      markSelectedAsRead,
      markSelectedAsUnread,
      deleteSelected,
      isMarkingAsRead: markAsReadMutation.isPending,
      isMarkingAsUnread: markAsUnreadMutation.isPending,
      isDeleting: deleteMutation.isPending
    },
    data: {
      notifications,
      totalItems,
      isLoading: isLoading,
      isFetching,
      isError,
      error
    },
    actions: {
      handleNotificationClick,
      handleToggleStar,
      markAllViewedAsRead,
      refresh: () => refetch(),
      isDetailOpen,
      setIsDetailOpen,
      selectedNotification,
      isMarkingAllAsRead: markAllAsReadMutation.isPending
    },
    deleteConfirmation: {
      isDeleteConfirmOpen,
      setIsDeleteConfirmOpen,
      deleteConfirmCount,
      confirmDelete
    }
  }
}
