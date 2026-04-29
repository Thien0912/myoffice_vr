import { UserAvatar } from '@renderer/components/UserAvatar'
import { getAvatarUrl } from '@renderer/utils/urlUtils'

interface UserDetailCardProps {
    user: {
        ql_nguoi_dung_id: number | string
        ql_nguoi_dung_ho_ten: string
        ten_cong_viec?: string
        ten_don_vi?: string
        ql_nguoi_dung_avatar?: string
        ql_nguoi_dung_email?: string
        color?: string
    }
}

const BANNER_GRADIENT = [
    'from-blue-300 to-sky-200',
    'from-purple-300 to-indigo-200',
    'from-emerald-300 to-teal-200',
    'from-rose-300 to-pink-200',
    'from-amber-300 to-orange-200'
]

function getBannerClass(id: number | string): string {
    const num = typeof id === 'number' ? id : parseInt(String(id), 10) || 0
    return BANNER_GRADIENT[num % BANNER_GRADIENT.length]
}

export const UserDetailCard = ({ user }: UserDetailCardProps) => {
    const bannerClass = getBannerClass(user.ql_nguoi_dung_id)
    const avatarSrc = getAvatarUrl(user.ql_nguoi_dung_avatar)

    return (
        <div className="w-[280px] overflow-hidden rounded-lg shadow-sm">
            {/* Banner */}
            <div className={`relative h-[90px] bg-gradient-to-br ${bannerClass}`}>
                {/* Avatar overlapping banner */}
                <div className="absolute -bottom-8 left-4">
                    <UserAvatar
                        src={avatarSrc}
                        name={user.ql_nguoi_dung_ho_ten}
                        size="lg"
                        className="w-16 h-16 text-xl ring-3 ring-background"
                        isBordered={false}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="pt-10 pb-3 px-4">
                {/* Name */}
                <h3 className="text-base font-bold text-foreground leading-tight">
                    {user.ql_nguoi_dung_ho_ten}
                </h3>
                {user.ten_cong_viec && (
                    <p className="text-xs text-default-500 mt-0.5">{user.ten_cong_viec}</p>
                )}

                {/* Info rows */}
                <div className="mt-3 space-y-0.5">
                    {/* Email */}
                    <div className="flex items-center py-2 border-b border-divider">
                        <span className="text-xs text-default-500 w-16 shrink-0">Email</span>
                        {user.ql_nguoi_dung_email ? (
                            <span className="text-xs text-primary truncate">{user.ql_nguoi_dung_email}</span>
                        ) : (
                            <span className="text-xs text-default-400">—</span>
                        )}
                    </div>

                    {/* Đơn vị */}
                    <div className="flex items-center py-2">
                        <span className="text-xs text-default-500 w-16 shrink-0">Đơn vị</span>
                        <span className="text-xs text-default-500">{user.ten_don_vi}</span>
                    </div>
                    {/* Chức vụ */}
                    <div className="flex items-center py-2">
                        <span className="text-xs text-default-500 w-16 shrink-0">Chức vụ</span>
                        <span className="text-xs text-default-500">{user.ten_cong_viec}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
