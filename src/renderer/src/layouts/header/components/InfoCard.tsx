import { LucideIcon } from 'lucide-react'
import React from 'react'

type InfoCardProps = {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  title?: string
}

export default function InfoCard({ icon: Icon, label, value, title }: InfoCardProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-gray-800/50 last:border-0 group">
      <div className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 min-w-0 gap-1 sm:gap-4">
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 shrink-0">
          {label}
        </span>
        <div
          className="text-sm font-normal text-gray-800 dark:text-gray-200 truncate sm:text-right"
          title={title}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
