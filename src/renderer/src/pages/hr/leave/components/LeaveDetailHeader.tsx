import { Button } from '@heroui-v3/react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NghiPhep } from '../types'

interface LeaveDetailHeaderProps {
  data: NghiPhep
  getStatusChip: (status: string) => React.ReactNode
}

export const LeaveDetailHeader = ({ data, getStatusChip }: LeaveDetailHeaderProps) => {
  const navigate = useNavigate()

  return (
    <div className="fixed top-0 left-0 right-0 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-40 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
      <Button isIconOnly variant="tertiary" size="sm" className="rounded-full" onPress={() => navigate(-1)}>
        <ChevronLeft size={24} />
      </Button>
      <div className="flex-1 overflow-hidden">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 truncate text-base">
          Duyệt nghỉ phép
        </h2>
        <p className="text-[10px] text-gray-500 truncate">Mã đơn: {data.uuid_nghi_phep}</p>
      </div>
      {getStatusChip(data.trang_thai_cap_hai || data.trang_thai_cap_mot)}
    </div>
  )
}
