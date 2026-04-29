import { Plus } from 'lucide-react'

interface CollapsibleSectionProps {
  id: string
  title: string
  count: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleSection({ id, title, count, children }: CollapsibleSectionProps) {
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    const el = document.getElementById(id)
    const btn = el?.querySelector('.shrink-0 button') as HTMLElement
    btn?.click()
  }

  return (
    <div id={id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[15px] font-semibold text-gray-700">{title}</h3>
          {count > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
              {count}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Thêm mới
        </button>
      </div>
      {/* Always render children so internal add button exists in DOM, but hide visually when empty */}
      <div className={count > 0 ? 'px-6 pb-6 [&_.shrink-0]:hidden' : 'h-0 overflow-hidden'}>
        {children}
      </div>
    </div>
  )
}
