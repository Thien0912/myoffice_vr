import { Chip, Popover, ScrollShadow } from '@heroui-v3/react'
import { UserAvatar, UserAvatarVertical } from '@renderer/components/UserAvatar'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useOnlineUserStore } from '@renderer/store/useOnlineUserStore'
import type { CSSProperties } from 'react'
import { UserDetailCard } from './UserDetailCard'

interface User {
    ql_nguoi_dung_id: number | string
    ql_nguoi_dung_ho_ten: string
    ten_cong_viec: string
    ten_don_vi: string
    ql_nguoi_dung_avatar: string
    ql_nguoi_dung_email: string
    color?: string
    activity?: {
        type: string
        description: string
        path?: string
    }
}

const MAX_VISIBLE_USERS = 3

// Sub-component for online users list
const OnlineUsersList = ({
    users,
    currentUserId
}: {
    users: User[]
    currentUserId?: string | number
}) => (
    <ScrollShadow className="max-h-80 w-64" hideScrollBar>
        <div className="text-tiny font-bold text-default-500 mb-3">Đang trực tuyến ({users.length})</div>
        <div className="flex flex-col gap-1">
            {users.map((u) => {
                const isMe = currentUserId && String(u.ql_nguoi_dung_id) === String(currentUserId)
                return (
                    <Popover key={u.ql_nguoi_dung_id}>
                        <Popover.Trigger>
                            <div>
                                <UserAvatarVertical
                                    src={u.ql_nguoi_dung_avatar}
                                    name={isMe ? `${u.ql_nguoi_dung_ho_ten} (Bạn)` : u.ql_nguoi_dung_ho_ten}
                                    className={`${isMe ? 'bg-primary-50 dark:bg-primary-900/20' : ''} px-4`}
                                    description={u.ql_nguoi_dung_email}
                                />
                            </div>
                        </Popover.Trigger>
                        <Popover.Content placement="right top" offset={8} className="p-0">
                            <Popover.Dialog className="p-0">
                                <UserDetailCard user={u} />
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>
                )
            })}
        </div>
    </ScrollShadow>
)

const OnlineUserGroup = () => {
    const users = useOnlineUserStore((state) => state.users) as User[]
    const currentUser = useAuthStore((state) => state.user)

    if (!users || users.length === 0) return null

    return (
        <div className="mr-3">
            <div className="flex items-center">
                <div className="flex items-center">
                    {users.slice(0, MAX_VISIBLE_USERS).map((user, index) => (
                        <Popover key={user.ql_nguoi_dung_id}>
                            <Popover.Trigger>
                                <UserAvatar
                                    src={user.ql_nguoi_dung_avatar}
                                    name={user.ql_nguoi_dung_ho_ten}
                                    size="sm"
                                    className="cursor-pointer transition-transform hover:scale-110 -ml-1.5 first:ml-0"
                                    isBordered
                                    style={
                                        {
                                            zIndex: MAX_VISIBLE_USERS - index,
                                            '--tw-ring-color': user.color || '#3b82f6',
                                            borderColor: user.color || '#3b82f6'
                                        } as CSSProperties
                                    }
                                />
                            </Popover.Trigger>
                            <Popover.Content placement="bottom" offset={10} className="p-0">
                                <Popover.Dialog className="p-0">
                                    <UserDetailCard user={user} />
                                </Popover.Dialog>
                            </Popover.Content>
                        </Popover>
                    ))}
                </div>

                {users.length > MAX_VISIBLE_USERS && (
                    <Popover>
                        <Popover.Trigger>
                            <Chip
                                size="sm"
                                className="ms-2 cursor-pointer"
                            >
                                +{users.length - MAX_VISIBLE_USERS} online
                            </Chip>
                        </Popover.Trigger>
                        <Popover.Content placement="bottom end" offset={10} className="p-0">
                            <Popover.Dialog>
                                <OnlineUsersList users={users} currentUserId={currentUser?.ql_nguoi_dung_id} />
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>
                )}
            </div>
        </div>
    )
}

export default OnlineUserGroup
