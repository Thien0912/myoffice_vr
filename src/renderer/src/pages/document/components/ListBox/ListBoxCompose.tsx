import { Button } from '@heroui-v3/react'
import { Pencil } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface ListBoxComposeProps {
  isCollapsed: boolean
  onOpenCompose: () => void
}

export const ListBoxCompose = ({ isCollapsed, onOpenCompose }: ListBoxComposeProps) => {
  const location = useLocation()
  const pathname = location.pathname

  if (pathname.includes('vanbandendonvi') || pathname.includes('vanbandaxoa')) return null

  const getLabel = () => {
    if (pathname.includes('de-xuat') || pathname.includes('dexuat')) return 'Soạn đề xuất'
    if (pathname.includes('vanban')) return 'Soạn thư'
    return 'Thêm mới'
  }

  const label = getLabel()

  return (
    <div
      className={`mb-4 transition-all duration-300 ${isCollapsed ? 'flex justify-center px-0' : 'px-3'}`}
    >
      <Button
        className={`
          bg-[#c2e7ff] hover:bg-[#c2e1ff] text-[#001d35] font-medium 
          hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]  
          transition-all duration-200 active:scale-95 rounded-none md:rounded-2xl
          ${
            isCollapsed
              ? 'w-14 h-14 min-w-14 p-0'
              : 'h-14 w-fit max-w-[220px] pl-5 pr-11 justify-start'
          }
        `}
        onPress={onOpenCompose}
      >
        <Pencil size={20} className="shrink-0" strokeWidth={2} />
        <span
          className={`
            ml-2 text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-300
            ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}
          `}
        >
          {label}
        </span>
      </Button>
    </div>
  )
}
