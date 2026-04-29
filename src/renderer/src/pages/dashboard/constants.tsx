import { FolderLock, Inbox, Save, Send } from 'lucide-react'
import { ReactNode } from 'react'

export interface StatItem {
  label: string
  description: string
  value: number | string
  color: string
  icon: ReactNode
  iconOverlay: ReactNode
  apiField: string
}

export const DOCUMENT_STATS: StatItem[] = [
  {
    label: 'Văn bản đến',
    description: 'Văn bản từ cơ quan bên ngoài',
    value: 0,
    color: 'blue',
    icon: <Inbox className="text-blue-500" size={36} />,
    iconOverlay: <Inbox className="text-blue-900" size={84} />,
    apiField: 'vanbanden'
  },
  {
    label: 'Văn bản đến',
    description: 'Văn bản đến của đơn vị',
    value: 0,
    color: 'blue',
    icon: <Save className="text-blue-500" size={36} />,
    iconOverlay: <Save size={84} />,
    apiField: 'vanbandendonvi'
  },
  {
    label: 'Văn bản đi',
    description: 'Văn bản do trường ban hành',
    value: 0,
    color: 'teal',
    icon: <Send className="text-teal-500" size={36} />,
    iconOverlay: <Send className="text-teal-900" size={84} />,
    apiField: 'vanbandi'
  },
  {
    label: 'Văn bản đi',
    description: 'Văn bản các đơn vị gửi đi',
    value: 0,
    color: 'teal',
    icon: <Send className="text-teal-500" size={36} />,
    iconOverlay: <Send className="text-teal-900" size={84} />,
    apiField: 'vanbandidonvi'
  },
  {
    label: 'Văn bản nội bộ',
    description: 'Lưu hành nội bộ của đơn vị',
    value: 0,
    color: 'yellow',
    icon: <FolderLock className="text-yellow-500" size={36} />,
    iconOverlay: <FolderLock className="text-yellow-900" size={84} />,
    apiField: 'vanbannoibo'
  }
]
