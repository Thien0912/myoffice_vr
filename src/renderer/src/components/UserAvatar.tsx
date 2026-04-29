import { Avatar, AvatarProps } from '@heroui/react'
import { Tooltip } from '@heroui-v3/react'
import React from 'react'

import { getAvatarUrl } from '@renderer/utils/urlUtils'

interface UserAvatarProps extends AvatarProps {
    name?: string
    src?: string
    isBordered?: boolean
    gender?: string | number // 1: Nam, 0: Nữ
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export const UserAvatar = React.forwardRef<HTMLSpanElement, UserAvatarProps>(
    ({ name, src, gender, className, isBordered, size = 'sm', ...props }, ref) => {
        const isMale = gender === 1 || gender === 'Nam' || String(gender).toLowerCase() === 'nam'
        const isFemale = gender === 0 || gender === 'Nữ' || String(gender).toLowerCase() === 'nữ'

        const borderColor = isMale
            ? 'border-blue-500'
            : isFemale
                ? 'border-pink-500'
                : 'border-gray-200'

        const avatarSrc = React.useMemo(() => {
            return getAvatarUrl(src)
        }, [src])

        // Limit initials to 2 characters: first + last word initial
        const initials = React.useMemo(() => {
            if (!name) return undefined
            const parts = name.trim().split(/\s+/).filter(Boolean)
            if (parts.length === 0) return undefined
            if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
        }, [name])

        return (
            <Avatar
                ref={ref}
                src={avatarSrc}
                name={initials}
                isBordered={isBordered}
                size={size}
                className={`transition-transform ${className} ${gender !== undefined ? `border-2 ${borderColor}` : ''}`}
                showFallback
                classNames={{
                    name: `${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[13px]' : 'text-lg'} font-medium`
                }}
                {...props}
            />
        )
    }
)
UserAvatar.displayName = 'UserAvatar'

export interface UserAvatarVerticalProps extends UserAvatarProps {
    description?: React.ReactNode
}

export const UserAvatarVertical = React.forwardRef<HTMLDivElement, UserAvatarVerticalProps>(
    ({ name, description, className, size = 'sm', ...props }, ref) => {
        const sizeMap = {
            sm: {
                name: 'text-xs',
                desc: 'text-[10px]',
                gap: 'gap-2',
                leading: 'leading-3'
            },
            md: {
                name: 'text-sm',
                desc: 'text-xs',
                gap: 'gap-3',
                leading: 'leading-4'
            },
            lg: {
                name: 'text-base',
                desc: 'text-sm',
                gap: 'gap-3',
                leading: 'leading-5'
            }
        }

        const { name: nameSize, desc: descSize, gap, leading } = sizeMap[size] || sizeMap.sm

        return (
            <div
                ref={ref}
                className={`flex items-center ${gap} hover:bg-default-100 py-1 px-2 rounded-lg cursor-pointer transition-colors w-full ${className || ''} min-w-0`}
            >
                <UserAvatar name={name} size={size} className="shrink-0" {...props} />
                <div
                    className={`flex flex-col min-w-0 ${leading} flex-1 ${description ? '' : 'items-start'} ${!name && !description && 'hidden'}`}
                >
                    <Tooltip delay={500} closeDelay={0}>
                        <p className={`${nameSize} text-foreground truncate`}>{name}</p>
                        <Tooltip.Content placement="top">{name}</Tooltip.Content>
                    </Tooltip>
                    {description && (
                        <div className={`${descSize} text-default-500 truncate`}>{description}</div>
                    )}
                </div>
            </div>
        )
    }
)

export default UserAvatar
